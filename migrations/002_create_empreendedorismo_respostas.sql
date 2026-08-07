-- ====================================================================
-- MIGRATION: 002_create_empreendedorismo_respostas.sql
-- Tabela: empreendedorismo_respostas
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS empreendedorismo_respostas (
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

-- Habilitar RLS
ALTER TABLE empreendedorismo_respostas ENABLE ROW LEVEL SECURITY;

-- Política de Inserção Pública
DROP POLICY IF EXISTS "Permitir envio publico empreendedorismo" ON empreendedorismo_respostas;
CREATE POLICY "Permitir envio publico empreendedorismo"
    ON empreendedorismo_respostas
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Política de Leitura Autorizada
DROP POLICY IF EXISTS "Permitir leitura respostas empreendedorismo" ON empreendedorismo_respostas;
CREATE POLICY "Permitir leitura respostas empreendedorismo"
    ON empreendedorismo_respostas
    FOR SELECT
    TO public
    USING (true);
