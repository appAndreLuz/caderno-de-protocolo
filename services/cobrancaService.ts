
import { NAF } from '../types';
import { supabase } from './supabaseClient';

export const cobrancaService = {
  /**
   * Lista NAFs paradas há mais de 10 dias seguindo as regras de negócio:
   * 1. Ignorar BAIXADAS (data_saida IS NOT NULL).
   * 2. Se PENDENTE e sem data_cobranca, usa entry_date.
   * 3. Se PENDENTE e com data_cobranca, usa data_cobranca.
   * 4. Ordenação FIFO (mais antiga primeiro).
   */
  listParadas: async (search?: string): Promise<NAF[]> => {
    let query = supabase
      .from('nafs')
      .select('*, suppliers(name)')
      .is('data_saida', null) // Cenário 1: Apenas PENDENTES
      .order('entry_date', { ascending: true }); // Ordem FIFO

    if (search) {
      query = query.ilike('naf_number', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[cobrancaService.listParadas] Erro:", error.message);
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = (data || []).map(naf => {
      const dataReferenciaStr = naf.data_cobranca || naf.entry_date;
      const dataReferencia = new Date(dataReferenciaStr + 'T00:00:00');
      
      const diffTime = today.getTime() - dataReferencia.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...naf,
        dias_parados: diffDays,
        pode_cobrar: diffDays > 10
      };
    }).filter(naf => naf.dias_parados! > 10); // Apenas os que excedem 10 dias

    return filtered;
  },

  /**
   * Registra ou altera a data de cobrança de uma NAF.
   */
  atualizarDataCobranca: async (id: string, date?: string): Promise<{ success: boolean; message: string }> => {
    const finalDate = date || new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from('nafs')
      .update({ data_cobranca: finalDate })
      .eq('id', id);

    if (error) return { success: false, message: "Erro ao atualizar cobrança: " + error.message };
    return { success: true, message: "Data de cobrança atualizada!" };
  }
};
