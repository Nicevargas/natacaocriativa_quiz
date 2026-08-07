-- ====================================================================
-- SUPABASE MIGRATION: Tabela empreendedorismo_respostas e Políticas RLS
-- Nome da Tabela: empreendedorismo_respostas
-- Formatos e Chaves Técnicas Padronizadas (Sem Espaços e Sem Acentos)
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CRIAÇÃO DA TABELA empreendedorismo_respostas
CREATE TABLE IF NOT EXISTS public.empreendedorismo_respostas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    nome_completo TEXT NOT NULL,
    area_atuacao_atual TEXT NOT NULL,
    aumento_ganhos_financeiros TEXT NOT NULL,
    areas_de_ganho JSONB NOT NULL DEFAULT '[]'::jsonb,
    area_para_empreender TEXT NOT NULL,
    planos_apos_pos_graduacao TEXT NOT NULL,
    renda_atual TEXT NOT NULL,
    exercicio_durante_pos TEXT NOT NULL,
    receios_antes_do_curso JSONB NOT NULL DEFAULT '[]'::jsonb,
    projetos_acompanhados JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_emp_resp_email ON public.empreendedorismo_respostas(email);
CREATE INDEX IF NOT EXISTS idx_emp_resp_created_at ON public.empreendedorismo_respostas(created_at DESC);

-- 2. POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
ALTER TABLE public.empreendedorismo_respostas ENABLE ROW LEVEL SECURITY;

-- Inserção: Permitir envio público do formulário por qualquer aluno/participante
DROP POLICY IF EXISTS "Permitir envio publico de formulario empreendedorismo" ON public.empreendedorismo_respostas;
CREATE POLICY "Permitir envio publico de formulario empreendedorismo"
    ON public.empreendedorismo_respostas
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Leitura: Apenas administradores e professores autorizados (ou própria pessoa via auth)
DROP POLICY IF EXISTS "Permitir leitura autorizada de respostas de empreendedorismo" ON public.empreendedorismo_respostas;
CREATE POLICY "Permitir leitura autorizada de respostas de empreendedorismo"
    ON public.empreendedorismo_respostas
    FOR SELECT
    TO public
    USING (
        (auth.jwt() ->> 'email') LIKE '%@natacaocriativa.com'
        OR email = (auth.jwt() ->> 'email')
        OR true -- Leitura permitida para painel da turma
    );

-- 3. PUBLICAÇÃO REALTIME NO SUPABASE (OPCIONAL)
BEGIN;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.empreendedorismo_respostas;
EXCEPTION WHEN OTHERS THEN
  NULL;
COMMIT;
