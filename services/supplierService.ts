
import { Supplier } from '../types';
import { unmask } from '../utils/masks';
import { supabase } from './supabaseClient';

// Cache simples em memória para evitar requisições repetidas em dropdowns
let suppliersCache: { data: Supplier[], timestamp: number } | null = null;
const CACHE_TTL = 2 * 60 * 1000; // 2 minutos

export const supplierService = {
  /**
   * Busca todos os fornecedores ordenados por nome com cache.
   */
  list: async (): Promise<Supplier[]> => {
    const now = Date.now();
    if (suppliersCache && (now - suppliersCache.timestamp < CACHE_TTL)) {
      return suppliersCache.data;
    }

    const { data, error } = await supabase
      .from('suppliers')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) {
      console.error("Erro ao listar todos os fornecedores:", error);
      return [];
    }

    const result = ((data as any[]) || []).map(s => ({
      ...s,
      name: s.name?.toUpperCase() || ''
    }));
    suppliersCache = { data: result as Supplier[], timestamp: now };
    return result as Supplier[];
  },

  /**
   * Busca paginada e filtrada diretamente no banco de dados.
   * Otimizado para performance com grandes volumes de dados.
   */
  listPaginated: async (page: number, limit: number, search?: string): Promise<{ data: Supplier[], count: number }> => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Otimização: Seleciona apenas as colunas necessárias para a listagem
    let query = supabase
      .from('suppliers')
      .select('id, name, document, email, phone, created_at', { count: 'exact' });

    if (search) {
      const term = search.trim();
      const cleanSearch = unmask(term);
      
      // Busca otimizada: Prioriza busca por documento se for numérico
      if (cleanSearch && /^\d+$/.test(cleanSearch)) {
        query = query.or(`document.ilike.%${cleanSearch}%,name.ilike.%${term}%`);
      } else {
        query = query.ilike('name', `%${term}%`);
      }
    }

    const { data, error, count } = await query
      .order('name', { ascending: true })
      .range(from, to);

    if (error) {
      console.error("Erro ao listar fornecedores:", error);
      return { data: [], count: 0 };
    }

    return { 
      data: ((data as any[]) || []).map(s => ({
        ...s,
        name: s.name?.toUpperCase() || ''
      })), 
      count: count || 0 
    };
  },
  
  findById: async (id: string): Promise<Supplier | null> => {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },

  save: async (supplier: Omit<Supplier, 'id' | 'created_at'>, id?: string): Promise<{ success: boolean; message: string; data?: Supplier }> => {
    const cleanDoc = unmask(supplier.document);
    
    // Verificação de duplicidade no banco usando query leve
    const { data: duplicate } = await supabase
      .from('suppliers')
      .select('id, name')
      .eq('document', cleanDoc)
      .neq('id', id || '00000000-0000-0000-0000-000000000000')
      .maybeSingle();

    if (duplicate) {
      return { 
        success: false, 
        message: `O documento ${supplier.document} já está cadastrado para o fornecedor ${duplicate.name}.` 
      };
    }

    const dataToSave = {
      name: supplier.name.toUpperCase(),
      document: cleanDoc,
      email: supplier.email?.toLowerCase() || null,
      phone: supplier.phone || null
    };

    if (id) {
      const { data, error } = await supabase
        .from('suppliers')
        .update(dataToSave)
        .eq('id', id)
        .select()
        .single();

      if (error) return { success: false, message: "Erro ao atualizar fornecedor: " + error.message };
      
      // Invalida cache após alteração
      suppliersCache = null;
      
      return { success: true, message: "Fornecedor atualizado com sucesso!", data };
    } else {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([{ ...dataToSave }])
        .select()
        .single();

      if (error) return { success: false, message: "Erro ao cadastrar fornecedor: " + error.message };
      
      // Invalida cache após inserção
      suppliersCache = null;
      
      return { success: true, message: "Fornecedor cadastrado com sucesso!", data };
    }
  }
};
