
-- ==========================================
-- 1. ESTRUTURA DA TABELA MEDICAMENTOS
-- ==========================================
CREATE TABLE IF NOT EXISTS medicamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_medicamento TEXT NOT NULL,
  nome_medicamento TEXT NOT NULL,
  lote TEXT NOT NULL,
  data_validade DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- CONSTRAINT: Unicidade do lote (requisito do sistema)
  CONSTRAINT unique_lote UNIQUE (lote)
);

-- ==========================================
-- 2. SEGURANÇA AVANÇADA (RLS)
-- ==========================================

-- Habilita o Row Level Security
ALTER TABLE medicamentos ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas que possam estar causando conflito
DROP POLICY IF EXISTS "Public Access" ON medicamentos;
DROP POLICY IF EXISTS "Enable select for all users" ON medicamentos;
DROP POLICY IF EXISTS "Enable insert for all users" ON medicamentos;
DROP POLICY IF EXISTS "Enable update for all users" ON medicamentos;
DROP POLICY IF EXISTS "Enable delete for all users" ON medicamentos;

-- Criação de Políticas Granulares (Best Practice)
-- Estas políticas garantem que cada operação tenha as permissões corretas no Supabase

-- 1. Permissão de Leitura
CREATE POLICY "Enable select for all users" 
ON medicamentos FOR SELECT 
USING (true);

-- 2. Permissão de Inserção
CREATE POLICY "Enable insert for all users" 
ON medicamentos FOR INSERT 
WITH CHECK (true);

-- 3. Permissão de Atualização
CREATE POLICY "Enable update for all users" 
ON medicamentos FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- 4. Permissão de Exclusão (FIX: Agora explícita e sem conflito de WITH CHECK)
CREATE POLICY "Enable delete for all users" 
ON medicamentos FOR DELETE 
USING (true);

-- ==========================================
-- 3. OTIMIZAÇÃO E PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_medicamentos_codigo ON medicamentos(codigo_medicamento);
CREATE INDEX IF NOT EXISTS idx_medicamentos_nome ON medicamentos(nome_medicamento);

-- Recarrega o esquema do PostgREST para aplicar as mudanças de permissão imediatamente
NOTIFY pgrst, 'reload schema';
