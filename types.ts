
export interface Fornecedor {
  id: string;
  razao_social: string;
  documento: string; // CNPJ or CPF
  telefone: string;
  email: string;
  created_at?: string;
}

export interface NAF {
  id: string;
  data_entrada: string;
  data_cobranca?: string | null;
  numero_naf: string; // Up to 6 digits
  numero_subnaf: string; // Up to 2 digits
  fornecedor_id: string;
  valor: number;
  observacao: string;
  data_baixa?: string | null;
  created_at?: string;
  page_number?: number; // Calculated field
  fornecedor?: Fornecedor;
}

export interface Medicamento {
  id: string;
  codigo: string;
  nome: string;
  lote: string;
  validade: string;
  quantidade?: number;
  created_at?: string;
}

// Added Emprestimo interface to fix import error in pages/Emprestimos.tsx
export interface Emprestimo {
  id: string;
  numero_sequencial: number;
  fornecedor_nome: string;
  item_nome: string;
  data_emprestimo: string;
  observacoes?: string;
  created_at?: string;
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}

export interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  category: 'medicamento' | 'protocolo' | 'sistema';
  link: string;
}
