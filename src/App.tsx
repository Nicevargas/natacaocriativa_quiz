import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { OverviewTab } from './components/OverviewTab';
import { LivePieDashboard } from './components/LivePieDashboard';
import { StudentsTab } from './components/StudentsTab';
import { QuizDataTab } from './components/QuizDataTab';
import { GrowthTab } from './components/GrowthTab';
import { EmpreendedorismoFormTab } from './components/EmpreendedorismoFormTab';
import { AdminLoginModal } from './components/AdminLoginModal';
import { StudentDetailModal } from './components/StudentDetailModal';
import { NewReportModal } from './components/NewReportModal';
import { SettingsModal } from './components/SettingsModal';
import { SupportModal } from './components/SupportModal';
import { ShieldCheck, LogIn } from 'lucide-react';

import { INITIAL_COHORTS, LOGO_SIDEBAR_URL } from './data/mockData';
import { Cohort, Student, StudentProfile } from './types';
import {
  fetchEmpreendedorismoResponsesFromSupabase,
  fetchQuizResponsesFromSupabase,
  EmpreendedorismoResposta,
  SupabaseQuizResponse,
} from './lib/supabase';

function mapDatabaseResponsesToStudents(
  empResponses: EmpreendedorismoResposta[],
  quizResponses: SupabaseQuizResponse[]
): Student[] {
  const result: Student[] = [];

  quizResponses.forEach((q) => {
    const name = q.student_name || 'Participante';
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'AL';

    result.push({
      id: q.id || `q-${Math.random()}`,
      name,
      avatarInitials: initials,
      email: q.student_email || '',
      phone: '',
      city: 'Fortaleza / CE',
      cohortId: q.cohort_id || 'all-cohorts',
      profile: (q.profile_result as StudentProfile) || 'Empreendedor em Ascensão',
      roleArea: 'Personal Aquático',
      score: q.score || 85,
      quizStatus: (q.status as any) || 'Completed',
      completedAt: q.created_at ? new Date(q.created_at).toLocaleString('pt-BR') : 'Recentemente',
      notes: q.notes || 'Resposta de Quiz do Banco de Dados',
      answersCount: q.answers_count || 10,
    });
  });

  empResponses.forEach((emp) => {
    const exists = result.some((s) => s.email && s.email.toLowerCase() === emp.email?.toLowerCase());
    if (!exists) {
      const name = emp.nome_completo || 'Participante';
      const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || 'AL';

      result.push({
        id: emp.id || `emp-${Math.random()}`,
        name,
        avatarInitials: initials,
        email: emp.email || '',
        phone: emp.telefone || '',
        city: 'Fortaleza / CE',
        cohortId: 'all-cohorts',
        profile: (emp.area_para_empreender as StudentProfile) || 'Empreendedor em Ascensão',
        roleArea: (emp.area_atuacao_atual as any) || 'Professor de Natação',
        score: 90,
        quizStatus: 'Completed',
        completedAt: emp.created_at ? new Date(emp.created_at).toLocaleString('pt-BR') : 'Hoje',
        notes: `Renda: ${emp.renda_atual || 'N/A'}. Planos: ${emp.planos_apos_pos_graduacao || 'N/A'}`,
        answersCount: 10,
      });
    }
  });

  return result;
}

function calculateCohortsFromStudents(baseCohorts: Cohort[], allStudents: Student[]): Cohort[] {
  return baseCohorts.map((cohort) => {
    const filtered = allStudents.filter(
      (s) => cohort.id === 'all-cohorts' || s.cohortId === cohort.id
    );

    const count = filtered.length;
    const avgScore = count > 0 ? Math.round(filtered.reduce((acc, s) => acc + (s.score || 0), 0) / count) : 0;
    const completedCount = filtered.filter((s) => s.quizStatus === 'Completed').length;
    const quizCompletionRate = count > 0 ? Math.round((completedCount / count) * 100) : 0;

    const profileCounts: Record<string, number> = {};
    filtered.forEach((s) => {
      if (s.profile) {
        profileCounts[s.profile] = (profileCounts[s.profile] || 0) + 1;
      }
    });

    const colors: Record<string, string> = {
      'Empreendedor em Ascensão': 'bg-[#0059bb]',
      'Visionário Estratégico': 'bg-[#b80049]',
      'Gestor Operacional': 'bg-[#fabd00]',
      'Personal Aquático': 'bg-emerald-600',
      'Consultoria': 'bg-purple-600',
    };

    const profileDistribution = Object.entries(profileCounts).map(([label, cnt]) => ({
      label,
      count: cnt,
      percentage: count > 0 ? Math.round((cnt / count) * 100) : 0,
      colorClass: colors[label] || 'bg-blue-500',
    }));

    const areaCounts: Record<string, number> = {};
    filtered.forEach((s) => {
      if (s.roleArea) {
        areaCounts[s.roleArea] = (areaCounts[s.roleArea] || 0) + 1;
      }
    });

    const activityAreas = Object.entries(areaCounts).map(([area, cnt]) => ({
      area,
      count: cnt,
      bgClass: 'bg-[#d8e2ff]',
      textClass: 'text-[#001a41]',
    }));

    return {
      ...cohort,
      totalParticipants: count,
      quizCompletionRate,
      avgScore,
      profileDistribution,
      activityAreas,
    };
  });
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [cohorts, setCohorts] = useState<Cohort[]>(INITIAL_COHORTS);
  const [selectedCohort, setSelectedCohort] = useState<Cohort>(INITIAL_COHORTS[0]);
  const [students, setStudents] = useState<Student[]>([]);

  // Load database data
  const loadDatabaseData = async () => {
    const [empRes, quizRes] = await Promise.all([
      fetchEmpreendedorismoResponsesFromSupabase(),
      fetchQuizResponsesFromSupabase(),
    ]);

    const mappedStudents = mapDatabaseResponsesToStudents(empRes.data || [], quizRes || []);
    setStudents(mappedStudents);

    const updatedCohorts = calculateCohortsFromStudents(INITIAL_COHORTS, mappedStudents);
    setCohorts(updatedCohorts);

    const currentSelected = updatedCohorts.find((c) => c.id === selectedCohort.id) || updatedCohorts[0];
    setSelectedCohort(currentSelected);
  };

  useEffect(() => {
    loadDatabaseData();
    const interval = setInterval(loadDatabaseData, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // Admin Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('admin_authenticated') === 'true';
  });
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Standalone Mode Detection for Public Link Access
  const [isStandalone, setIsStandalone] = useState(() => {
    const search = window.location.search;
    const hash = window.location.hash;
    return (
      search.includes('mode=form') ||
      search.includes('form=') ||
      hash.includes('form')
    );
  });

  useEffect(() => {
    const checkStandalone = () => {
      const search = window.location.search;
      const hash = window.location.hash;
      setIsStandalone(
        search.includes('mode=form') ||
        search.includes('form=') ||
        hash.includes('form')
      );
    };
    window.addEventListener('popstate', checkStandalone);
    window.addEventListener('hashchange', checkStandalone);
    return () => {
      window.removeEventListener('popstate', checkStandalone);
      window.removeEventListener('hashchange', checkStandalone);
    };
  }, []);

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setShowLoginModal(false);
    setIsStandalone(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    setIsAdminLoggedIn(false);
  };

  // Modals
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [isNewReportOpen, setIsNewReportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  // Add new student
  const handleAddStudent = (newStudentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...newStudentData,
      id: `s-${Date.now()}`,
    };

    setStudents((prev) => [newStudent, ...prev]);

    // Update cohort count
    setCohorts((prev) =>
      prev.map((c) =>
        c.id === selectedCohort.id || c.id === 'all-cohorts'
          ? { ...c, totalParticipants: c.totalParticipants + 1 }
          : c
      )
    );

    setSelectedCohort((prev) => ({
      ...prev,
      totalParticipants: prev.totalParticipants + 1,
    }));
  };

  // Delete student
  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
  };

  // Update student notes
  const handleUpdateStudentNotes = (studentId: string, notes: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, notes } : s))
    );
    if (selectedStudentForDetail && selectedStudentForDetail.id === studentId) {
      setSelectedStudentForDetail((prev) => (prev ? { ...prev, notes } : null));
    }
  };

  // Callback when a user completes the quiz simulator
  const handleAddCompletedQuizStudent = (
    profileName: StudentProfile,
    score: number
  ) => {
    const newSimulatedStudent: Student = {
      id: `sim-${Date.now()}`,
      name: 'Simulação - Novo Participante',
      avatarInitials: 'NP',
      email: 'participante.simulado@natacaocriativa.com',
      phone: '(85) 99000-1122',
      city: selectedCohort.location,
      cohortId: selectedCohort.id,
      profile: profileName,
      roleArea: 'Personal Aquático',
      score,
      quizStatus: 'Completed',
      completedAt: 'Agora mesmo',
      answersCount: 10,
      notes: 'Resultado gerado via Simulação do Quiz no Painel.',
    };

    setStudents((prev) => [newSimulatedStudent, ...prev]);
  };

  // Standalone Mode View (External Public Link for Students)
  if (isStandalone) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] font-body antialiased py-6 px-4">
        {/* Public Header */}
        <header className="max-w-4xl mx-auto mb-6 bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-[#0059bb]">
            <img
              src={LOGO_SIDEBAR_URL}
              alt="Natação Criativa"
              className="h-9 md:h-10 w-auto object-contain"
            />
            <div>
              <h1 className="font-headline font-bold text-sm md:text-base text-[#191c1d]">
                Natação Criativa
              </h1>
              <p className="text-[11px] md:text-xs text-gray-500">
                Formulário Oficial — Turma 01 Fortaleza
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#0059bb]/10 text-[#0059bb]">
              Acesso do Aluno
            </span>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-headline font-bold bg-gray-100 hover:bg-[#0059bb] hover:text-white text-gray-700 transition-all flex items-center gap-1.5 active:scale-95 border border-gray-200"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#0059bb] group-hover:text-white" />
              <span>Login Admin</span>
            </button>
          </div>
        </header>

        {/* Main Standalone Form */}
        <main className="max-w-4xl mx-auto">
          <EmpreendedorismoFormTab isStandalone={true} />
        </main>

        <footer className="max-w-4xl mx-auto mt-10 text-center text-xs text-gray-400 py-4 border-t border-gray-200">
          <p>© {new Date().getFullYear()} Natação Criativa — Pós-Graduação em Empreendedorismo Aquático.</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Todos os direitos reservados.</p>
        </footer>

        {/* Admin Login Modal overlay if clicked from Standalone mode */}
        <AdminLoginModal
          isOpen={showLoginModal}
          onLoginSuccess={handleLoginSuccess}
          onGoToPublicForm={() => setShowLoginModal(false)}
        />
      </div>
    );
  }

  // If trying to access admin system without being logged in
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <AdminLoginModal
          isOpen={true}
          onLoginSuccess={handleLoginSuccess}
          onGoToPublicForm={() => setIsStandalone(true)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] flex flex-col font-body antialiased pb-20 md:pb-8">
      {/* Top Fixed Header */}
      <Header
        selectedCohort={selectedCohort}
        cohorts={cohorts}
        onSelectCohort={(cohort) => setSelectedCohort(cohort)}
        onOpenNewReport={() => setIsNewReportOpen(true)}
        onLogout={handleLogout}
      />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          onOpenNewReport={() => setIsNewReportOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenSupport={() => setIsSupportOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 md:ml-60 p-4 md:p-8 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <OverviewTab
              cohort={selectedCohort}
              students={students}
              onOpenStudentDetail={(student) => setSelectedStudentForDetail(student)}
              onOpenNewReport={() => setIsNewReportOpen(true)}
              onNavigateToQuiz={() => setActiveTab('quiz')}
              onNavigateToLive={() => setActiveTab('live')}
            />
          )}

          {activeTab === 'empreendedorismo' && (
            <EmpreendedorismoFormTab />
          )}

          {activeTab === 'live' && (
            <LivePieDashboard cohortName={selectedCohort.name} />
          )}

          {activeTab === 'students' && (
            <StudentsTab
              students={students.filter(
                (s) => selectedCohort.id === 'all-cohorts' || s.cohortId === selectedCohort.id
              )}
              onAddStudent={handleAddStudent}
              onOpenStudentDetail={(student) => setSelectedStudentForDetail(student)}
              onDeleteStudent={handleDeleteStudent}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizDataTab
              onAddCompletedQuizStudent={handleAddCompletedQuizStudent}
            />
          )}

          {activeTab === 'growth' && (
            <GrowthTab cohorts={cohorts} />
          )}
        </main>
      </div>

      {/* Mobile Bottom Docked Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

      {/* Modals & Drawers */}
      <StudentDetailModal
        student={selectedStudentForDetail}
        onClose={() => setSelectedStudentForDetail(null)}
        onUpdateNotes={handleUpdateStudentNotes}
      />

      <NewReportModal
        isOpen={isNewReportOpen}
        onClose={() => setIsNewReportOpen(false)}
        cohort={selectedCohort}
        students={students}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </div>
  );
}
