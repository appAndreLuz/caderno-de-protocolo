
import { LucideIcon } from 'lucide-react';

export interface Psalm {
  id: number;
  number: number;
  text: string;
}

export interface Supplier {
  id: string;
  name: string;
  document: string;
  email?: string;
  phone?: string;
  created_at: string;
}

export interface Medicine {
  id: string;
  codigo_medicamento: string;
  nome_medicamento: string;
  lote: string;
  data_validade: string;
  created_at: string;
  // Campos calculados no "back-end" (service)
  status_validade?: 'critico' | 'atencao' | 'em_dia';
  dias_para_vencer?: number;
}

export interface NAF {
  id: string;
  created_at: string;
  entry_date: string;
  data_saida?: string | null;
  data_cobranca?: string | null;
  naf_number: string;
  subnaf_number: string;
  supplier_id: string;
  value: number;
  observation?: string;
  page_number: number;
  line_number: number;
  is_cancelled?: boolean;
  // Virtual/Computed fields for UI
  dias_parados?: number;
  pode_cobrar?: boolean;
  // Join data
  suppliers?: {
    name: string;
  };
}

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  category?: string;
}

export enum ThemeColors {
  CREAM = '#F8F8EC',
  LIME = '#AEDD2B',
  BLUE_PRIMARY = '#066699',
  BLUE_DARK = '#0A5483',
  BLUE_DEEP = '#02416D',
}
