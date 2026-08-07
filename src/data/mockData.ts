import { Cohort, Student, QuizQuestion, ReportItem } from '../types';

export const LOGO_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuDy_8wdae91k90IR2BRBCUh7R6m26oEnf1_QqZDSQRvUPP3QcBPhicjl3rCN1NptUZIGmwWYD-EfVB7mgAmn3NZ1odrj1oJkzMQ9p23n7Q27Xzd6EUjAiU-lNftweAiJ-ij0dTTdyzz71cf2yK968iogELFnLzrA1nfAsJJBs5eWRrK_OGWjveIr8p_95Ag4LJlmvDAwHLbMaLFjwn9V9l8kM12-Su3xRM-gL4caVz_MDG5mv-lu8QXsFzYgVM9Xlu8Cw";

export const LOGO_SIDEBAR_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuA43tQyrqIxCCVvbr-Cpr9g-pEiSIknws9o4Et1faXTtbLF550YZcI0F7Vh5WQzyO3qc29ArFNFpk1Aona4twhnZJv27Zc8Skq-L3E3zYjPiB13Cp8bV5L_ofuQKMO-thji-mWQpEiQXKV8CYHDJRmBEkqIJul_BK9iuVjo8L4oFhpAqy-91p-r_p4Hjpc2B2hPgvHTz5SmERhY9GLLIbNS9co-Bw9wy5yy5wrJQBIhWUa9-AiMSfZiDaGdvRPd4Iv-CQ";

export const AVATAR_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuCj5Ev0yzu9C0yhGrG6eQ0OLpphsWZ9ZQp8c9qy3iA-NfEoWcYrLabJOiHmQgQhNJ3f39cyP377vFKskIsyosuHGHg2j4raF1xVw6fBOOKheML7QN8r8j6V7AA1FKN3DWsuzVfjQCtv64D-cbQhD9Hc_Z5WZ0CNKMcv-PQub4vDnz8SDS-i44JpAYYyB9APc58kpC84bBesYfV55QP9CKtWD0DiZJOKCfNMsD_I4Yq86ncYDP7Jna81";

export const INITIAL_COHORTS: Cohort[] = [
  {
    id: 'fortaleza-01',
    name: 'Empreendedorismo Turma 01 Fortaleza',
    subtitle: 'Empreendedorismo Aquático - Turma 01 Overview',
    location: 'Fortaleza / CE',
    totalParticipants: 150,
    quizCompletionRate: 85,
    avgScore: 92,
    revenueGrowth: 'R$ 45K',
    revenueGrowthTrend: 'down',
    revenueGrowthPercent: 2,
    profileDistribution: [
      { label: 'Empreendedor em Ascensão', percentage: 45, count: 67, colorClass: 'bg-[#0059bb]' },
      { label: 'Visionário Estratégico', percentage: 35, count: 52, colorClass: 'bg-[#b80049]' },
      { label: 'Gestor Operacional', percentage: 20, count: 31, colorClass: 'bg-[#fabd00]' },
    ],
    activityAreas: [
      { area: 'Personal Aquático', count: 40, bgClass: 'bg-[#d8e2ff]', textClass: 'text-[#001a41]' },
      { area: 'Professor de Natação', count: 65, bgClass: 'bg-[#ffd9de]', textClass: 'text-[#400014]' },
      { area: 'Gestor de Academia', count: 25, bgClass: 'bg-[#ffdf9e]', textClass: 'text-[#261a00]' },
      { area: 'Consultoria', count: 20, bgClass: 'bg-[#e7e8e9]', textClass: 'text-[#191c1d]' },
    ]
  },
  {
    id: 'sp-02',
    name: 'Turma 02 São Paulo - Gestão Aquática',
    subtitle: 'Metodologia e Gestão de Escolas de Natação',
    location: 'São Paulo / SP',
    totalParticipants: 320,
    quizCompletionRate: 89.5,
    avgScore: 88,
    revenueGrowth: 'R$ 112K',
    revenueGrowthTrend: 'up',
    revenueGrowthPercent: 12,
    profileDistribution: [
      { label: 'Personal Aquático', percentage: 50, count: 160, colorClass: 'bg-[#0059bb]' },
      { label: 'Dono de Metodologia', percentage: 30, count: 96, colorClass: 'bg-[#e2165f]' },
      { label: 'Gestor de Escola', percentage: 20, count: 64, colorClass: 'bg-[#fabd00]' },
    ],
    activityAreas: [
      { area: 'Personal Aquático', count: 120, bgClass: 'bg-[#d8e2ff]', textClass: 'text-[#001a41]' },
      { area: 'Professor de Natação', count: 110, bgClass: 'bg-[#ffd9de]', textClass: 'text-[#400014]' },
      { area: 'Gestor de Academia', count: 60, bgClass: 'bg-[#ffdf9e]', textClass: 'text-[#261a00]' },
      { area: 'Consultoria', count: 30, bgClass: 'bg-[#e7e8e9]', textClass: 'text-[#191c1d]' },
    ]
  },
  {
    id: 'all-cohorts',
    name: 'Visão Geral - Todas as Turmas',
    subtitle: 'Consolidado Geral de Alunos e Participantes',
    location: 'Brasil / Híbrido',
    totalParticipants: 1248,
    quizCompletionRate: 84.2,
    avgScore: 89,
    revenueGrowth: 'R$ 380K',
    revenueGrowthTrend: 'up',
    revenueGrowthPercent: 15,
    profileDistribution: [
      { label: 'Personal Aquático', percentage: 60, count: 748, colorClass: 'bg-[#0059bb]' },
      { label: 'Dono de Metodologia', percentage: 25, count: 312, colorClass: 'bg-[#e2165f]' },
      { label: 'Gestor de Escola', percentage: 15, count: 188, colorClass: 'bg-[#fabd00]' },
    ],
    activityAreas: [
      { area: 'Personal Aquático', count: 520, bgClass: 'bg-[#d8e2ff]', textClass: 'text-[#001a41]' },
      { area: 'Professor de Natação', count: 430, bgClass: 'bg-[#ffd9de]', textClass: 'text-[#400014]' },
      { area: 'Gestor de Academia', count: 180, bgClass: 'bg-[#ffdf9e]', textClass: 'text-[#261a00]' },
      { area: 'Consultoria', count: 118, bgClass: 'bg-[#e7e8e9]', textClass: 'text-[#191c1d]' },
    ]
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 's-01',
    name: 'Maria José',
    avatarInitials: 'MJ',
    email: 'mariajose@natacaocriativa.com',
    phone: '(85) 99823-1122',
    city: 'Fortaleza - CE',
    cohortId: 'fortaleza-01',
    profile: 'Visionário Estratégico',
    roleArea: 'Professor de Natação',
    score: 95,
    quizStatus: 'Completed',
    completedAt: 'Hoje, 10:30',
    answersCount: 10,
    notes: 'Excelente visão de expansão de turmas infantis. Busca criar metodologia própria.'
  },
  {
    id: 's-02',
    name: 'Carlos Silva',
    avatarInitials: 'CS',
    email: 'carlos.silva@aquasport.com.br',
    phone: '(85) 98744-3321',
    city: 'Fortaleza - CE',
    cohortId: 'fortaleza-01',
    profile: 'Empreendedor em Ascensão',
    roleArea: 'Personal Aquático',
    score: 88,
    quizStatus: 'Completed',
    completedAt: 'Ontem, 14:15',
    answersCount: 10,
    notes: 'Personal de alto rendimento querendo estruturar turmas VIPs.'
  },
  {
    id: 's-03',
    name: 'Ana Paula',
    avatarInitials: 'AP',
    email: 'ana.paula@natacaoinfantil.com',
    phone: '(85) 99112-9876',
    city: 'Caucaia - CE',
    cohortId: 'fortaleza-01',
    profile: 'Gestor Operacional',
    roleArea: 'Gestor de Academia',
    score: 76,
    quizStatus: 'Completed',
    completedAt: '24 Out, 2023',
    answersCount: 10,
    notes: 'Focada na otimização da retenção de alunos e horários de piscina.'
  },
  {
    id: 's-04',
    name: 'Roberto Lima',
    avatarInitials: 'RL',
    email: 'roberto.lima@piscinafitness.com',
    phone: '(85) 98833-2211',
    city: 'Fortaleza - CE',
    cohortId: 'fortaleza-01',
    profile: 'Personal Aquático',
    roleArea: 'Personal Aquático',
    score: 91,
    quizStatus: 'Completed',
    completedAt: '22 Out, 2023',
    answersCount: 10,
    notes: 'Atende adultos com medo de água e reabilitação aquática.'
  },
  {
    id: 's-05',
    name: 'Juliana Costa',
    avatarInitials: 'JC',
    email: 'juliana.costa@swimkids.com',
    phone: '(11) 97722-5544',
    city: 'São Paulo - SP',
    cohortId: 'sp-02',
    profile: 'Visionário Estratégico',
    roleArea: 'Dono de Metodologia',
    score: 94,
    quizStatus: 'Completed',
    completedAt: 'Há 2 horas',
    answersCount: 10,
    notes: 'Proprietária de rede com 3 unidades em SP.'
  },
  {
    id: 's-06',
    name: 'Lucas Mendes',
    avatarInitials: 'LM',
    email: 'lucas.mendes@natacao.edu.br',
    phone: '(11) 98112-3344',
    city: 'Campinas - SP',
    cohortId: 'sp-02',
    profile: 'Empreendedor em Ascensão',
    roleArea: 'Professor de Natação',
    score: 82,
    quizStatus: 'Completed',
    completedAt: 'Ontem, 18:00',
    answersCount: 10
  },
  {
    id: 's-07',
    name: 'Camila Rocha',
    avatarInitials: 'CR',
    email: 'camila.rocha@aquatraining.com',
    phone: '(85) 99445-6677',
    city: 'Eusébio - CE',
    cohortId: 'fortaleza-01',
    profile: 'Consultoria',
    roleArea: 'Consultoria',
    score: 96,
    quizStatus: 'Completed',
    completedAt: '20 Out, 2023',
    answersCount: 10
  },
  {
    id: 's-08',
    name: 'Fernando Alves',
    avatarInitials: 'FA',
    email: 'fernando.alves@piscina.com',
    phone: '(85) 98122-9988',
    city: 'Fortaleza - CE',
    cohortId: 'fortaleza-01',
    profile: 'Gestor Operacional',
    roleArea: 'Gestor de Academia',
    score: 65,
    quizStatus: 'In Progress',
    completedAt: 'Em andamento',
    answersCount: 6
  }
];

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

export const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 'rep-01',
    title: 'Relatório Consolidado Turma 01 Fortaleza',
    cohortName: 'Empreendedorismo Turma 01 Fortaleza',
    generatedAt: '05/11/2023',
    type: 'Perfil e Diagnóstico',
    author: 'Equipe Natação Criativa'
  },
  {
    id: 'rep-02',
    title: 'Análise de Desempenho e Engajamento do Quiz',
    cohortName: 'Turma 02 São Paulo',
    generatedAt: '01/11/2023',
    type: 'Estatísticas',
    author: 'Gestão Pedagógica'
  }
];
