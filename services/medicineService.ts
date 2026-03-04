
import { Medicine } from '../types';
import { supabase } from './supabaseClient';

export const medicineService = {
  listPaginated: async (page: number, limit: number, search?: string): Promise<{ data: Medicine[], count: number }> => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Otimização: Seleciona apenas colunas necessárias
    let query = supabase
      .from('medicamentos')
      .select('id, codigo_medicamento, nome_medicamento, lote, data_validade', { count: 'exact' });

    if (search) {
      const term = search.trim();
      if (/^\d+$/.test(term)) {
        query = query.or(`codigo_medicamento.ilike.%${term}%,nome_medicamento.ilike.%${term}%`);
      } else {
        query = query.ilike('nome_medicamento', `%${term}%`);
      }
    }

    const { data, error, count } = await query
      .order('nome_medicamento', { ascending: true })
      .range(from, to);

    if (error) {
      console.error("Erro ao listar medicamentos:", error);
      return { data: [], count: 0 };
    }

    // Lógica de enriquecimento (Simulando processamento em Back-end)
    const enrichedData: Medicine[] = (data as any[] || []).map(medicine => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const expiry = new Date(medicine.data_validade + 'T00:00:00');
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let status: 'critico' | 'atencao' | 'em_dia' = 'em_dia';
      
      if (diffDays < 0) {
        status = 'critico'; // Vencido cai no critico visualmente
      } else if (diffDays < 30) {
        status = 'critico';
      } else if (diffDays >= 30 && diffDays <= 60) {
        status = 'atencao';
      } else {
        status = 'em_dia';
      }

      return {
        ...medicine,
        status_validade: status,
        dias_para_vencer: diffDays
      };
    });

    return { 
      data: enrichedData, 
      count: count || 0 
    };
  },

  /**
   * Verifica se existem medicamentos vencidos no banco de dados.
   */
  hasExpired: async (): Promise<boolean> => {
    const today = new Date().toISOString().split('T')[0];
    const { count, error } = await supabase
      .from('medicamentos')
      .select('*', { count: 'exact', head: true })
      .lt('data_validade', today);
    
    if (error) return false;
    return (count || 0) > 0;
  },

  /**
   * Exclui todos os medicamentos cuja data de validade é anterior a hoje.
   */
  deleteExpired: async (): Promise<{ success: boolean; message: string }> => {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase
      .from('medicamentos')
      .delete()
      .lt('data_validade', today);

    if (error) return { success: false, message: "Erro ao limpar vencidos: " + error.message };
    return { success: true, message: "Todos os medicamentos vencidos foram removidos." };
  },

  listExpiringSoon: async (days: number = 60): Promise<Medicine[]> => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const todayStr = today.toISOString().split('T')[0];
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('medicamentos')
      .select('*')
      .lte('data_validade', futureDateStr)
      .order('data_validade', { ascending: true });

    if (error) {
      console.error("Erro ao buscar medicamentos a vencer:", error);
      return [];
    }

    return (data || []).map(medicine => {
      const expiry = new Date(medicine.data_validade + 'T00:00:00');
      const todayZero = new Date();
      todayZero.setHours(0,0,0,0);
      const diffTime = expiry.getTime() - todayZero.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...medicine,
        dias_para_vencer: diffDays
      };
    });
  },

  save: async (medicine: Omit<Medicine, 'id' | 'created_at'>, id?: string): Promise<{ success: boolean; message: string }> => {
    const dataToSave = {
      codigo_medicamento: medicine.codigo_medicamento.trim(),
      nome_medicamento: medicine.nome_medicamento.trim().toUpperCase(),
      lote: medicine.lote.trim().toUpperCase(),
      data_validade: medicine.data_validade
    };

    if (id) {
      const { error } = await supabase
        .from('medicamentos')
        .update(dataToSave)
        .eq('id', id);

      if (error) return { success: false, message: "Erro ao atualizar medicamento: " + error.message };
      return { success: true, message: "Medicamento atualizado com sucesso!" };
    } else {
      const { error } = await supabase
        .from('medicamentos')
        .insert([dataToSave]);

      if (error) {
        if (error.code === '23505') {
          return { success: false, message: "Já existe um medicamento cadastrado com este Lote." };
        }
        return { success: false, message: "Erro ao cadastrar medicamento: " + error.message };
      }
      return { success: true, message: "Medicamento cadastrado com sucesso!" };
    }
  },

  delete: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const cleanLote = String(id || '').trim();
    const { error } = await supabase
      .from('medicamentos')
      .delete()
      .eq('lote', cleanLote);

    if (error) return { success: false, message: "Erro ao excluir: " + error.message };
    return { success: true };
  }
};
