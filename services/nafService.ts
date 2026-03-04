
import { NAF } from '../types';
import { supabase } from './supabaseClient';

export const nafService = {
  listPaginated: async (page: number, limit: number, search?: string): Promise<{ data: NAF[], count: number }> => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Otimização: Seleciona apenas colunas necessárias e usa join eficiente
    let query = supabase
      .from('nafs')
      .select('id, entry_date, data_saida, data_cobranca, naf_number, subnaf_number, value, suppliers(name)', { count: 'exact' });

    if (search) {
      const term = search.trim();
      query = query.ilike('naf_number', `%${term}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error("[nafService.listPaginated] Erro:", error);
      return { data: [], count: 0 };
    }

    return { data: (data as any[]) || [], count: count || 0 };
  },

  /**
   * Busca NAFs em um intervalo de páginas para a visão de caderno.
   */
  listByPageRange: async (startPage: number, endPage: number): Promise<NAF[]> => {
    const { data, error } = await supabase
      .from('nafs')
      .select('*, suppliers(name)')
      .gte('page_number', startPage)
      .lte('page_number', endPage);

    if (error) {
      console.error("[nafService.listByPageRange] Erro:", error);
      return [];
    }
    return data || [];
  },

  verificarDuplicidade: async (nafNumber: string, subnafNumber: string, idAtual: string | null = null): Promise<boolean> => {
    const valNaf = String(nafNumber).trim();
    const valSub = String(subnafNumber).trim();
    if (!valNaf || !valSub) return false;

    const { data, error } = await supabase
      .from('nafs')
      .select('id')
      .eq('naf_number', valNaf)
      .eq('subnaf_number', valSub)
      .neq('id', idAtual || '00000000-0000-0000-0000-000000000000')
      .maybeSingle();

    if (error) return false;
    return !!data;
  },

  findByNumber: async (nafNumber: string): Promise<NAF[]> => {
    const term = nafNumber.trim();
    if (!term) return [];

    const { data, error } = await supabase
      .from('nafs')
      .select('*, suppliers(name)')
      .eq('naf_number', term);

    if (error) {
      console.error("[nafService.findByNumber] Erro:", error);
      return [];
    }
    return data || [];
  },

  findPageByNumbers: async (nafNumber: string, subnafNumber: string): Promise<number | null> => {
    const { data, error } = await supabase
      .from('nafs')
      .select('page_number')
      .eq('naf_number', nafNumber.trim())
      .eq('subnaf_number', subnafNumber.trim())
      .maybeSingle();

    if (error || !data) return null;
    return data.page_number;
  },

  quickSearch: async (nafNumber: string, subnafNumber?: string): Promise<NAF[]> => {
    const cleanNaf = nafNumber.trim();
    const cleanSub = subnafNumber?.trim();

    if (!cleanNaf) return [];

    let query = supabase
      .from('nafs')
      .select('*, suppliers(name)')
      .eq('naf_number', cleanNaf);

    if (cleanSub) {
      query = query.eq('subnaf_number', cleanSub);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error("[nafService.quickSearch] Erro:", error);
      return [];
    }

    return data || [];
  },

  registerWithdrawal: async (id: string): Promise<{ success: boolean; message: string }> => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const localDate = `${year}-${month}-${day}`;

    const { error } = await supabase
      .from('nafs')
      .update({ data_saida: localDate })
      .eq('id', id);

    if (error) return { success: false, message: "Erro: " + error.message };
    return { success: true, message: "Baixa registrada com sucesso!" };
  },

  revertWithdrawal: async (nafId: string): Promise<{ success: boolean; message: string }> => {
    const { error } = await supabase
      .from('nafs')
      .update({ data_saida: null })
      .eq('id', nafId);

    if (error) return { success: false, message: "Erro ao estornar: " + error.message };
    return { success: true, message: "Baixa estornada com sucesso!" };
  },

  registerBilling: async (id: string, date?: string): Promise<{ success: boolean; message: string }> => {
    let billingDate = date;
    if (!billingDate) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      billingDate = `${year}-${month}-${day}`;
    }

    const { error } = await supabase
      .from('nafs')
      .update({ data_cobranca: billingDate })
      .eq('id', id);

    if (error) return { success: false, message: "Erro ao registrar cobrança: " + error.message };
    return { success: true, message: "Cobrança registrada com sucesso!" };
  },

  clearBilling: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { error } = await supabase
      .from('nafs')
      .update({ data_cobranca: null })
      .eq('id', id);

    if (error) return { success: false, message: "Erro ao excluir data de cobrança: " + error.message };
    return { success: true, message: "Data de cobrança removida com sucesso!" };
  },

  listForBilling: async (search?: string): Promise<NAF[]> => {
    let query = supabase
      .from('nafs')
      .select('*, suppliers(name)')
      .is('data_saida', null);

    if (search) {
      query = query.ilike('naf_number', `%${search}%`);
    }

    const { data, error } = await query.order('entry_date', { ascending: true });

    if (error) {
      console.error("[nafService.listForBilling] Erro:", error);
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (data || []).map(naf => {
      const baseDateStr = naf.data_cobranca || naf.entry_date;
      const baseDate = new Date(baseDateStr + 'T00:00:00');
      baseDate.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - baseDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      const isBaixada = !!naf.data_saida;
      const podeCobrar = !isBaixada && diffDays >= 10;

      return {
        ...naf,
        dias_parados: diffDays,
        pode_cobrar: podeCobrar
      };
    });
  },

  listInFolder: async (): Promise<NAF[]> => {
    const { data, error } = await supabase
      .from('nafs')
      .select('*, suppliers(name)')
      .is('data_saida', null);

    if (error) {
      console.error("[nafService.listInFolder] Erro:", error);
      return [];
    }

    // Sort in memory by supplier name to ensure alphabetical order
    const sortedData = (data || []).sort((a, b) => {
      const nameA = a.suppliers?.name || '';
      const nameB = b.suppliers?.name || '';
      return nameA.localeCompare(nameB, 'pt-BR');
    });

    return sortedData;
  },

  getNextPosition: async (): Promise<{ page_number: number, line_number: number, isBlocked: boolean }> => {
    const { count, error } = await supabase
      .from('nafs')
      .select('*', { count: 'exact', head: true });

    if (error) return { page_number: 2, line_number: 1, isBlocked: false };

    const total = count || 0;
    const MAX_RECORDS = 100 * 31;
    if (total >= MAX_RECORDS) return { page_number: 101, line_number: 31, isBlocked: true };

    const page_number = Math.floor(total / 31) + 2;
    const line_number = (total % 31) + 1;
    return { page_number, line_number, isBlocked: false };
  },

  getDashboardStats: async (alertDays: number = 10): Promise<{ 
    total: number, 
    naPasta: number, 
    alertas: number,
    aberta: number,
    emCobranca: number,
    baixada: number,
    cancelada: number
  }> => {
    const today = new Date();
    const limitDate = new Date(today);
    limitDate.setDate(today.getDate() - alertDays);
    const limitDateStr = limitDate.toISOString().split('T')[0];

    // Queries paralelas para melhor performance
    const [totalRes, naPastaRes, alertasRes, abertaRes, emCobrancaRes, baixadaRes] = await Promise.all([
      supabase.from('nafs').select('*', { count: 'exact', head: true }),
      supabase.from('nafs').select('*', { count: 'exact', head: true }).is('data_saida', null),
      supabase.from('nafs').select('*', { count: 'exact', head: true }).is('data_saida', null).lte('entry_date', limitDateStr),
      supabase.from('nafs').select('*', { count: 'exact', head: true }).is('data_saida', null).is('data_cobranca', null),
      supabase.from('nafs').select('*', { count: 'exact', head: true }).is('data_saida', null).not('data_cobranca', 'is', null),
      supabase.from('nafs').select('*', { count: 'exact', head: true }).not('data_saida', 'is', null)
    ]);

    return {
      total: totalRes.count || 0,
      naPasta: naPastaRes.count || 0,
      alertas: alertasRes.count || 0,
      aberta: abertaRes.count || 0,
      emCobranca: emCobrancaRes.count || 0,
      baixada: baixadaRes.count || 0,
      cancelada: 0 // Não implementado no esquema atual
    };
  },

  save: async (naf: Omit<NAF, 'id' | 'created_at' | 'page_number' | 'line_number'>, id?: string): Promise<{ success: boolean; message: string }> => {
    const cleanNaf = String(naf.naf_number).trim();
    const cleanSub = String(naf.subnaf_number).trim();

    const dataToSave = {
      entry_date: naf.entry_date,
      naf_number: cleanNaf,
      subnaf_number: cleanSub,
      supplier_id: naf.supplier_id,
      value: naf.value,
      observation: naf.observation?.toUpperCase()
    };

    if (id) {
      const { error } = await supabase
        .from('nafs')
        .update(dataToSave)
        .eq('id', id);

      if (error) {
        if (error.code === '23505') {
          return { success: false, message: "Já existe um cadastro com este NAF e SUBNAF." };
        }
        return { success: false, message: "Erro ao atualizar: " + error.message };
      }
      return { success: true, message: "NAF atualizada com sucesso!" };
    } else {
      const pos = await nafService.getNextPosition();
      if (pos.isBlocked) return { success: false, message: "Limite do caderno atingido." };

      const { error } = await supabase
        .from('nafs')
        .insert([{
          ...dataToSave,
          page_number: pos.page_number,
          line_number: pos.line_number
        }]);

      if (error) {
        if (error.code === '23505') {
          return { success: false, message: "Já existe um cadastro com este NAF e SUBNAF." };
        }
        return { success: false, message: "Erro ao cadastrar: " + error.message };
      }
      return { success: true, message: "NAF cadastrada com sucesso!" };
    }
  }
};
