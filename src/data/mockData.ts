import { Cohort, Student, QuizQuestion, ReportItem } from '../types';

export const LOGO_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuDy_8wdae91k90IR2BRBCUh7R6m26oEnf1_QqZDSQRvUPP3QcBPhicjl3rCN1NptUZIGmwWYD-EfVB7mgAmn3NZ1odrj1oJkzMQ9p23n7Q27Xzd6EUjAiU-lNftweAiJ-ij0dTTdyzz71cf2yK968iogELFnLzrA1nfAsJJBs5eWRrK_OGWjveIr8p_95Ag4LJlmvDAwHLbMaLFjwn9V9l8kM12-Su3xRM-gL4caVz_MDG5mv-lu8QXsFzYgVM9Xlu8Cw";

export const LOGO_SIDEBAR_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuA43tQyrqIxCCVvbr-Cpr9g-pEiSIknws9o4Et1faXTtbLF550YZcI0F7Vh5WQzyO3qc29ArFNFpk1Aona4twhnZJv27Zc8Skq-L3E3zYjPiB13Cp8bV5L_ofuQKMO-thji-mWQpEiQXKV8CYHDJRmBEkqIJul_BK9iuVjo8L4oFhpAqy-91p-r_p4Hjpc2B2hPgvHTz5SmERhY9GLLIbNS9co-Bw9wy5yy5wrJQBIhWUa9-AiMSfZiDaGdvRPd4Iv-CQ";

export const AVATAR_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuCj5Ev0yzu9C0yhGrG6eQ0OLpphsWZ9ZQp8c9qy3iA-NfEoWcYrLabJOiHmQgQhNJ3f39cyP377vFKskIsyosuHGHg2j4raF1xVw6fBOOKheML7QN8r8j6V7AA1FKN3DWsuzVfjQCtv64D-cbQhD9Hc_Z5WZ0CNKMcv-PQub4vDnz8SDS-i44JpAYYyB9APc58kpC84bBesYfV55QP9CKtWD0DiZJOKCfNMsD_I4Yq86ncYDP7Jna81";

export const INITIAL_COHORTS: Cohort[] = [
  {
    id: 'all-cohorts',
    name: 'Visão Geral - Banco de Dados Real',
    subtitle: 'Consolidado Geral de Alunos e Participantes em Tempo Real',
    location: 'Brasil / Híbrido',
    totalParticipants: 0,
    quizCompletionRate: 0,
    avgScore: 0,
    revenueGrowth: 'R$ 0',
    revenueGrowthTrend: 'up',
    revenueGrowthPercent: 0,
    profileDistribution: [],
    activityAreas: []
  }
];

export const INITIAL_STUDENTS: Student[] = [];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Qual é o seu objetivo principal com as aulas de natação ou metodologia aquática?",
    category: "Metodologia",
    options: [
      { text: "Aumentar o valor percebido da hora/aula de personal e criar turmas premium.", profile: "Personal Aquático", scoreWeight: 10 },
      { text: "Licenciar minha própria metodologia para outras academias e profissionais.", profile: "Visionário Estratégico", scoreWeight: 10 },
      { text: "Estruturar processos de gestão, horário e atendimento na minha academia.", profile: "Gestor Operacional", scoreWeight: 10 },
      { text: "Aumentar faturamento e escalar captação de alunos recorrentes.", profile: "Empreendedor em Ascensão", scoreWeight: 10 }
    ]
  },
  {
    id: 2,
    question: "Como você lida com o acompanhamento e avaliação do progresso dos seus alunos?",
    category: "Metodologia",
    options: [
      { text: "Utilizo fichas pedagógicas dinâmicas com feedback semanal para os pais/alunos.", profile: "Empreendedor em Ascensão", scoreWeight: 10 },
      { text: "Criei um sistema exclusivo de níveis e selos com certificação personalizada.", profile: "Visionário Estratégico", scoreWeight: 10 },
      { text: "Padronizo planilhas e métricas operacionais para toda a equipe de professores.", profile: "Gestor Operacional", scoreWeight: 10 },
      { text: "Faço atendimento 100% individualizado com foco em metas específicas.", profile: "Personal Aquático", scoreWeight: 10 }
    ]
  },
  {
    id: 3,
    question: "Qual é a sua estratégia atual para atração de novos alunos para a piscina?",
    category: "Marketing",
    options: [
      { text: "Indicação boca a boca e divulgação forte das transformações dos alunos no Instagram.", profile: "Personal Aquático", scoreWeight: 10 },
      { text: "Anúncios estruturados com funil de vendas, WhatsApp rápido e teste grátis.", profile: "Empreendedor em Ascensão", scoreWeight: 10 },
      { text: "Eventos, festivais aquáticos e parcerias com escolas da região.", profile: "Gestor Operacional", scoreWeight: 10 },
      { text: "Posicionamento de marca nacional e franquia/licenciamento.", profile: "Visionário Estratégico", scoreWeight: 10 }
    ]
  },
  {
    id: 4,
    question: "Como está estruturada a precificação do seu serviço aquático?",
    category: "Finanças",
    options: [
      { text: "Cobrança mensal por planos trimestrais/semestrais com alta retenção.", profile: "Empreendedor em Ascensão", scoreWeight: 10 },
      { text: "Hora/aula individual com preço elevado pelo atendimento exclusivo.", profile: "Personal Aquático", scoreWeight: 10 },
      { text: "Tabela de preços proporcional à taxa de ocupação dos horários da piscina.", profile: "Gestor Operacional", scoreWeight: 10 },
      { text: "Royalties e taxa de adesão por licenciamento da metodologia.", profile: "Visionário Estratégico", scoreWeight: 10 }
    ]
  },
  {
    id: 5,
    question: "Qual é o maior desafio atual no seu dia a dia profissional?",
    category: "Gestão",
    options: [
      { text: "Conseguir tempo livre e parar de vender apenas a minha hora física na água.", profile: "Personal Aquático", scoreWeight: 10 },
      { text: "Manter a equipe motivada e treinada nos padrões de excelência.", profile: "Gestor Operacional", scoreWeight: 10 },
      { text: "Escalar a empresa para faturar mais sem perder a qualidade no atendimento.", profile: "Empreendedor em Ascensão", scoreWeight: 10 },
      { text: "Construir uma marca forte reconhecida em todo o mercado aquático.", profile: "Visionário Estratégico", scoreWeight: 10 }
    ]
  }
];

export const INITIAL_REPORTS: ReportItem[] = [];
