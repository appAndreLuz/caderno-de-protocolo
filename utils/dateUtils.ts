
export const getGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Bom dia";
  } else if (hour >= 12 && hour < 18) {
    return "Boa tarde";
  } else {
    return "Boa noite";
  }
};

export const getCurrentFormattedDate = (): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());
};

export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '---';
  
  // If it's a full ISO string (contains T), we strip the time part 
  // to treat it as a local date and avoid timezone shifts
  const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  
  // Parse YYYY-MM-DD
  const parts = cleanDate.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day).toLocaleDateString('pt-BR');
  }
  
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

export const getLocalDateISO = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
