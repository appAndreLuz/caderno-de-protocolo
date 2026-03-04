
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yyyluvezzjnkeucwxoit.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SeX-iiZ1cLQGOyVTIkaJmQ_qw1dK4Ib';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
