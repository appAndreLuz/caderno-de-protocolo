
export const validateEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const validateCPF = (cpf: string) => {
  const strCPF = cpf.replace(/\D/g, "");
  if (strCPF.length !== 11 || !!strCPF.match(/^(.)\1{10}$/)) return false;
  let sum = 0;
  let rest;
  for (let i = 1; i <= 9; i++) sum = sum + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(strCPF.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum = sum + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(strCPF.substring(10, 11))) return false;
  return true;
};

export const validateCNPJ = (cnpj: string) => {
  const b = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const c = cnpj.replace(/\D/g, "");
  if (c.length !== 14 || /0{14}/.test(c)) return false;
  
  // Fix: Declaring 'n' outside of the loop to resolve block-scope errors
  let n = 0;
  for (let i = 0; i < 12; i++) {
    n += parseInt(c[i]) * b[i + 1];
  }
  n %= 11;
  if (parseInt(c[12]) !== (n < 2 ? 0 : 11 - n)) return false;

  n = 0;
  for (let i = 0; i <= 12; i++) {
    n += parseInt(c[i]) * b[i];
  }
  n %= 11;
  if (parseInt(c[13]) !== (n < 2 ? 0 : 11 - n)) return false;
  
  return true;
};

export const validateDocument = (doc: string) => {
  const clean = doc.replace(/\D/g, "");
  if (clean.length === 11) return validateCPF(clean);
  if (clean.length === 14) return validateCNPJ(clean);
  return false;
};
