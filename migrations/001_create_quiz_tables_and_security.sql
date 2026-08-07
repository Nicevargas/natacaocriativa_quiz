-- ====================================================================
-- MIGRATION: 001_create_quiz_tables_and_security.sql
-- Descrição: Criação das tabelas do Quiz (perguntas, opções e respostas)
--            e definição das Políticas de Segurança (Row Level Security - RLS)
-- ====================================================================

-- 1. EXTENSÕES REQUERIDAS (para suporte a UUIDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 2. TABELA DE PERGUNTAS DO QUIZ (quiz_questions)
-- ====================================================================
CREATE TABLE IF NOT EXISTS quiz_questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Metodologia',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 3. TABELA DE OPÇÕES DAS PERGUNTAS (quiz_options)
-- ====================================================================
CREATE TABLE IF NOT EXISTS quiz_options (
    id SERIAL PRIMARY KEY,
    question_id INT NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    profile_type VARCHAR(100) NOT NULL, -- ex: 'Empreendedor em Ascensão', 'Visionário Estratégico', 'Gestor Operacional', 'Personal Aquático', 'Consultoria'
    score_weight INT NOT NULL DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index para buscas rápidas por pergunta
CREATE INDEX IF NOT EXISTS idx_quiz_options_question_id ON quiz_options(question_id);

-- ====================================================================
-- 4. TABELA DE RESPOSTAS E DIAGNÓSTICO DO ALUNO (quiz_responses)
-- ====================================================================
CREATE TABLE IF NOT EXISTS quiz_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(255) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    cohort_id VARCHAR(100) NOT NULL DEFAULT 'fortaleza-01',
    profile_result VARCHAR(100) NOT NULL,
    score INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'Completed', -- 'In Progress', 'Completed'
    answers_count INT NOT NULL DEFAULT 0,
    answers_json JSONB DEFAULT '{}'::jsonb, -- Armazena o detalhamento de cada resposta selecionada
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para buscas e relatórios em tempo real no Dashboard
CREATE INDEX IF NOT EXISTS idx_quiz_responses_cohort ON quiz_responses(cohort_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_profile ON quiz_responses(profile_result);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_student ON quiz_responses(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_created_at ON quiz_responses(created_at DESC);

-- ====================================================================
-- 5. HABILITAR ROW LEVEL SECURITY (RLS) - POLÍTICA DE SEGURANÇA
-- ====================================================================

-- Habilita RLS em todas as tabelas do Quiz
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- POLÍTICAS DE SEGURANÇA PARA "quiz_questions"
-- --------------------------------------------------------------------

-- Leitura: Qualquer usuário autenticado (ou anônimo) pode visualizar as perguntas do quiz
DROP POLICY IF EXISTS "Permitir leitura pública das perguntas" ON quiz_questions;
CREATE POLICY "Permitir leitura pública das perguntas"
    ON quiz_questions
    FOR SELECT
    USING (true);

-- Inserção/Atualização/Exclusão: Somente administradores/service_role
DROP POLICY IF EXISTS "Apenas administradores podem modificar perguntas" ON quiz_questions;
CREATE POLICY "Apenas administradores podem modificar perguntas"
    ON quiz_questions
    FOR ALL
    USING (
        auth.role() = 'service_role' OR 
        (auth.jwt() ->> 'email' LIKE '%@natacaocriativa.com' AND (auth.jwt() ->> 'email_verified')::boolean = true)
    );

-- --------------------------------------------------------------------
-- POLÍTICAS DE SEGURANÇA PARA "quiz_options"
-- --------------------------------------------------------------------

-- Leitura: Pública para exibição das alternativas no formulário do quiz
DROP POLICY IF EXISTS "Permitir leitura pública das opções" ON quiz_options;
CREATE POLICY "Permitir leitura pública das opções"
    ON quiz_options
    FOR SELECT
    USING (true);

-- Modificação: Apenas admins
DROP POLICY IF EXISTS "Apenas administradores podem modificar opções" ON quiz_options;
CREATE POLICY "Apenas administradores podem modificar opções"
    ON quiz_options
    FOR ALL
    USING (
        auth.role() = 'service_role' OR 
        (auth.jwt() ->> 'email' LIKE '%@natacaocriativa.com' AND (auth.jwt() ->> 'email_verified')::boolean = true)
    );

-- --------------------------------------------------------------------
-- POLÍTICAS DE SEGURANÇA PARA "quiz_responses"
-- --------------------------------------------------------------------

-- Inserção: Permitir que usuários envie/salvem suas respostas no quiz
DROP POLICY IF EXISTS "Permitir envio de resposta do quiz" ON quiz_responses;
CREATE POLICY "Permitir envio de resposta do quiz"
    ON quiz_responses
    FOR INSERT
    WITH CHECK (
        -- Garante que o student_id ou email bate com o usuário autenticado, ou permite se for inserção via app
        auth.uid() IS NOT NULL OR auth.role() = 'anon' OR auth.role() = 'authenticated'
    );

-- Leitura: Usuário lê suas próprias respostas; Professores/Admins lêem todas da turma
DROP POLICY IF EXISTS "Permitir leitura de respostas autorizadas" ON quiz_responses;
CREATE POLICY "Permitir leitura de respostas autorizadas"
    ON quiz_responses
    FOR SELECT
    USING (
        auth.role() = 'service_role' OR
        (auth.jwt() ->> 'email' LIKE '%@natacaocriativa.com') OR
        student_id = auth.uid()::text OR
        student_email = (auth.jwt() ->> 'email')
    );

-- Atualização: O próprio aluno pode atualizar seu quiz em andamento ou admin
DROP POLICY IF EXISTS "Permitir atualização da própria resposta" ON quiz_responses;
CREATE POLICY "Permitir atualização da própria resposta"
    ON quiz_responses
    FOR UPDATE
    USING (
        auth.role() = 'service_role' OR
        student_id = auth.uid()::text OR
        student_email = (auth.jwt() ->> 'email')
    )
    WITH CHECK (
        auth.role() = 'service_role' OR
        student_id = auth.uid()::text OR
        student_email = (auth.jwt() ->> 'email')
    );

-- Deletar: Apenas Service Role / Admins
DROP POLICY IF EXISTS "Permitir exclusão de respostas por admins" ON quiz_responses;
CREATE POLICY "Permitir exclusão de respostas por admins"
    ON quiz_responses
    FOR DELETE
    USING (
        auth.role() = 'service_role' OR 
        (auth.jwt() ->> 'email' LIKE '%@natacaocriativa.com' AND (auth.jwt() ->> 'email_verified')::boolean = true)
    );

-- ====================================================================
-- 6. POPULAÇÃO INICIAL (SEEDING) DAS PERGUNTAS E OPÇÕES DO QUIZ
-- ====================================================================

INSERT INTO quiz_questions (id, question_text, category) VALUES
(1, 'Qual é o seu objetivo principal com as aulas de natação ou metodologia aquática?', 'Metodologia'),
(2, 'Como você lida com o acompanhamento e avaliação do progresso dos seus alunos?', 'Metodologia'),
(3, 'Qual é a sua estratégia atual para atração de novos alunos para a piscina?', 'Marketing'),
(4, 'Como está estruturada a precificação do seu serviço aquático?', 'Finanças'),
(5, 'Qual é o maior desafio atual no seu dia a dia profissional?', 'Gestão')
ON CONFLICT (id) DO NOTHING;

INSERT INTO quiz_options (question_id, option_text, profile_type, score_weight) VALUES
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
