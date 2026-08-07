export type StudentProfile = 
  | 'Empreendedor em Ascensão'
  | 'Visionário Estratégico'
  | 'Gestor Operacional'
  | 'Personal Aquático'
  | 'Consultoria';

export type RoleArea = 
  | 'Personal Aquático'
  | 'Professor de Natação'
  | 'Gestor de Academia'
  | 'Consultoria'
  | 'Dono de Metodologia';

export type QuizStatus = 'Completed' | 'In Progress' | 'Pending';

export interface Student {
  id: string;
  name: string;
  avatarInitials: string;
  email: string;
  phone: string;
  city: string;
  cohortId: string;
  profile: StudentProfile;
  roleArea: RoleArea;
  score: number;
  quizStatus: QuizStatus;
  completedAt: string;
  notes?: string;
  answersCount?: number;
}

export interface ProfilePercentage {
  label: StudentProfile | string;
  percentage: number;
  count: number;
  colorClass: string;
}

export interface ActivityAreaCount {
  area: RoleArea | string;
  count: number;
  bgClass: string;
  textClass: string;
}

export interface Cohort {
  id: string;
  name: string;
  subtitle: string;
  location: string;
  totalParticipants: number;
  quizCompletionRate: number;
  avgScore: number;
  revenueGrowth: string;
  revenueGrowthTrend: 'up' | 'down';
  revenueGrowthPercent: number;
  profileDistribution: ProfilePercentage[];
  activityAreas: ActivityAreaCount[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  category: 'Metodologia' | 'Gestão' | 'Marketing' | 'Finanças';
  options: {
    text: string;
    profile: StudentProfile;
    scoreWeight: number;
  }[];
}

export interface ReportItem {
  id: string;
  title: string;
  cohortName: string;
  generatedAt: string;
  type: string;
  author: string;
}
