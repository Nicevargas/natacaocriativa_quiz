-- ====================================================================
-- SUPABASE MIGRATION: Quiz Tables, Row Level Security (RLS) & Realtime
-- Executar no SQL Editor do Supabase ou via Supabase CLI
-- ====================================================================

-- 1. HABILITAR EXTENSÃO DE UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 2. CRIAÇÃO DAS TABELAS
-- ====================================================================

-- 2.1 Tabela de Perguntas (quiz_questions)
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Metodologia',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Tabela de Opções/Alternativas por Pergunta (quiz_options)
CREATE TABLE IF NOT EXISTS public.quiz_options (
    id SERIAL PRIMARY KEY,
    question_id INT NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    profile_type VARCHAR(100) NOT NULL, -- Ex: 'Empreendedor em Ascensão', 'Visionário Estratégico', 'Gestor Operacional', 'Personal Aquático', 'Consultoria'
    score_weight INT NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index de performance para opções por pergunta
CREATE INDEX IF NOT EXISTS idx_quiz_options_question_id ON public.quiz_options(question_id);

-- 2.3 Tabela de Respostas e Diagnósticos Enviados (quiz_responses)
CREATE TABLE IF NOT EXISTS public.quiz_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(255) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    cohort_id VARCHAR(100) NOT NULL DEFAULT 'fortaleza-01',
    profile_result VARCHAR(100) NOT NULL,
    score INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'Completed', -- 'In Progress', 'Completed'
    answers_count INT NOT NULL DEFAULT 0,
    answers_json JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices otimizados para dashboards de alta performance e agregação no Supabase
CREATE INDEX IF NOT EXISTS idx_quiz_responses_cohort ON public.quiz_responses(cohort_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_profile ON public.quiz_responses(profile_result);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_created ON public.quiz_responses(created_at DESC);

-- ====================================================================
-- 3. SEGURANÇA: ROW LEVEL SECURITY (RLS) NO SUPABASE
-- ====================================================================

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- Políticas RLS para quiz_questions (Perguntas)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir leitura publica de perguntas" ON public.quiz_questions;
CREATE POLICY "Permitir leitura publica de perguntas"
    ON public.quiz_questions
    FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS "Apenas admins alteram perguntas" ON public.quiz_questions;
CREATE POLICY "Apenas admins alteram perguntas"
    ON public.quiz_questions
    FOR ALL
    TO authenticated
    USING (
        (auth.jwt() ->> 'email') LIKE '%@natacaocriativa.com'
    );

-- --------------------------------------------------------------------
-- Políticas RLS para quiz_options (Alternativas)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir leitura publica de opcoes" ON public.quiz_options;
CREATE POLICY "Permitir leitura publica de opcoes"
    ON public.quiz_options
    FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS "Apenas admins alteram opcoes" ON public.quiz_options;
CREATE POLICY "Apenas admins alteram opcoes"
    ON public.quiz_options
    FOR ALL
    TO authenticated
    USING (
        (auth.jwt() ->> 'email') LIKE '%@natacaocriativa.com'
    );

-- --------------------------------------------------------------------
-- Políticas RLS para quiz_responses (Respostas dos Alunos)
-- --------------------------------------------------------------------

-- Permitir que alunos/participantes insiram respostas (anon ou autenticados)
DROP POLICY IF EXISTS "Permitir insercao de respostas por alunos" ON public.quiz_responses;
CREATE POLICY "Permitir insercao de respostas por alunos"
    ON public.quiz_responses
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Leitura das respostas: O próprio participante ou a equipe admin da Natação Criativa
DROP POLICY IF EXISTS "Permitir leitura de respostas" ON public.quiz_responses;
CREATE POLICY "Permitir leitura de respostas"
    ON public.quiz_responses
    FOR SELECT
    TO public
    USING (
        (auth.jwt() ->> 'email') LIKE '%@natacaocriativa.com'
        OR student_id = auth.uid()::text
        OR student_email = (auth.jwt() ->> 'email')
        OR true -- Habilita exibição pública consolidada no dashboard da sala de aula
    );

-- Atualização: Aluno ou Admin
DROP POLICY IF EXISTS "Permitir edicao de propria resposta" ON public.quiz_responses;
CREATE POLICY "Permitir edicao de propria resposta"
    ON public.quiz_responses
    FOR UPDATE
    TO authenticated
    USING (
        (auth.jwt() ->> 'email') LIKE '%@natacaocriativa.com'
        OR student_id = auth.uid()::text
    );

-- ====================================================================
-- 4. HABILITAR SUPABASE REALTIME (Para animação na tela em tempo real)
-- ====================================================================

-- Adiciona a tabela de respostas à publicação realtime do Supabase
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.quiz_responses, public.quiz_questions;
COMMIT;

-- ====================================================================
-- 5. SEED DATA INICIAL
-- ====================================================================

INSERT INTO public.quiz_questions (id, question_text, category) VALUES
(1, 'Qual é o seu objetivo principal com as aulas de natação ou metodologia aquática?', 'Metodologia'),
(2, 'Como você lida com o acompanhamento e avaliação do progresso dos seus alunos?', 'Metodologia'),
(3, 'Qual é a sua estratégia atual para atração de novos alunos para a piscina?', 'Marketing'),
(4, 'Como está estruturada a precificação do seu serviço aquático?', 'Finanças'),
(5, 'Qual é o maior desafio atual no seu dia a dia profissional?', 'Gestão')
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text;

INSERT INTO public.quiz_options (question_id, option_text, profile_type, score_weight) VALUES
(1, 'Aumentar o valor percebido da hora/aula de personal e criar turmas premium.', 'Personal Aquático', 10),
(1, 'Licenciar minha própria metodologia para outras academias e profissionais.', 'Visionário Estratégico', 10),
(1, 'Estruturar processos de gestão, horário e atendimento na minha academia.', 'Gestor Operacional', 10),
(1, 'Aumentar faturamento e escalar captação de alunos recorrentes.', 'Empreendedor em Ascensão', 10),

(2, 'Utilizo fichas pedagógicas dinâmicas com feedback semanal para os pais/alunos.', 'Empreendedor em Ascensão', 10),
(2, 'Criei um sistema exclusivo de níveis e selos com certificação personalizada.', 'Visionário Estratégico', 10),
(2, 'Padronizo planilhas e métricas operacionais para toda a equipe de professores.', 'Gestor Operacional', 10),
(2, 'Faço atendimento 100% individualizado com foco em metas específicas.', 'Personal Aquático', 10),

(3, 'Indicação boca a boca e divulgação forte das transformações dos alunos no Instagram.', 'Personal Aquático', 10),
(3, 'Anúncios estruturados com funil de vendas, WhatsApp rápido e teste grátis.', 'Empreendedor em Ascensão', 10),
(3, 'Eventos, festivais aquáticos e parcerias com escolas da região.', 'Gestor Operacional', 10),
(3, 'Posicionamento de marca nacional e franquia/licenciamento.', 'Visionário Estratégico', 10),

(4, 'Cobrança mensal por planos trimestrais/semestrais com alta retenção.', 'Empreendedor em Ascensão', 10),
(4, 'Hora/aula individual com preço elevado pelo atendimento exclusivo.', 'Personal Aquático', 10),
(4, 'Tabela de preços proporcional à taxa de ocupação dos horários da piscina.', 'Gestor Operacional', 10),
(4, 'Royalties e taxa de adesão por licenciamento da metodologia.', 'Visionário Estratégico', 10),

(5, 'Conseguir tempo livre e parar de vender apenas a minha hora física na água.', 'Personal Aquático', 10),
(5, 'Manter a equipe motivada e treinada nos padrões de excelência.', 'Gestor Operacional', 10),
(5, 'Escalar a empresa para faturar mais sem perder a qualidade no atendimento.', 'Empreendedor em Ascensão', 10),
(5, 'Construir uma marca forte reconhecida em todo o mercado aquático.', 'Visionário Estratégico', 10)
ON CONFLICT DO NOTHING;
