
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gopqqrqevwslzwukzulc.supabase.co';
// Mantendo a chave fornecida, mas garantindo que o cliente seja criado com configurações de persistência
const SUPABASE_ANON_KEY = 'sb_publishable_CYb_BPhFMPjgEhxuQmW9HQ_dGdJBfF7';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
