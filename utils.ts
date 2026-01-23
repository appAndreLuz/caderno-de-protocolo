
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const maskCurrency = (value: string): string => {
  // Remove tudo que não for dígito
  let cleanValue = value.replace(/\D/g, "");
  
  if (cleanValue === "") return "";
  
  // Converte para centavos
  let numberValue = (parseFloat(cleanValue) / 100).toFixed(2);
  const [integer, decimal] = numberValue.split(".");
  
  // Adiciona separadores de milhar
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  return `R$ ${formattedInteger},${decimal}`;
};

export const parseCurrency = (value: string): number => {
  if (!value) return 0;
  // Remove R$, pontos e espaços, mantém apenas os números e divide por 100 para pegar as casas decimais
  const cleanValue = value.replace(/[^\d]/g, "");
  return parseFloat(cleanValue) / 100;
};

export const maskDocument = (value: string): string => {
  const clean = value.replace(/\D/g, '');
  if (clean.length <= 11) {
    // CPF
    return clean
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .substring(0, 14);
  } else {
    // CNPJ
    return clean
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
  }
};

export const maskPhone = (value: string): string => {
  const clean = value.replace(/\D/g, '');
  if (clean.length <= 10) {
    // Fixed or mobile 10 digits
    return clean
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 14);
  } else {
    // Mobile 11 digits
    return clean
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15);
  }
};

export const calculateNafPage = (index: number): number => {
  // Cada página possui 31 linhas. O caderno começa salvar na página 2.
  return Math.floor(index / 31) + 2;
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  
  // Se for uma string pura YYYY-MM-DD, fazemos o parse manual para evitar UTC shift
  if (dateString.includes('-') && dateString.length <= 10) {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day).toLocaleDateString('pt-BR');
    }
  }
  
  const date = new Date(dateString);
  // Fallback se a data for inválida
  if (isNaN(date.getTime())) return '-';
  
  return date.toLocaleDateString('pt-BR');
};

export const getLocalDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
