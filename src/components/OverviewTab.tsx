import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Award,
  Plus,
  Filter,
  Eye,
  FileText,
  Search,
} from 'lucide-react';
import { Cohort, Student } from '../types';

interface OverviewTabProps {
  cohort: Cohort;
  students: Student[];
  onOpenStudentDetail: (student: Student) => void;
  onOpenNewReport: () => void;
  onNavigateToQuiz: () => void;
  onNavigateToLive: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  cohort,
  students,
  onOpenStudentDetail,
  onOpenNewReport,
  onNavigateToQuiz,
  onNavigateToLive,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter students by selected cohort or show all
  const cohortStudents = students.filter(
    (s) => cohort.id === 'all-cohorts' || s.cohortId === cohort.id
  );

  const filteredStudents = cohortStudents.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.profile.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto">
      {/* Banner / Header Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-[0px_10px_30px_rgba(0,123,255,0.06)] border border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0059bb]/10 text-[#0059bb]">
              {cohort.location}
            </span>
            <span className="text-xs text-gray-400">• Painel de Controle</span>
          </div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-[#191c1d] tracking-tight mt-1">
            {cohort.name}
          </h1>
          <p className="font-body text-sm md:text-base text-[#414754] mt-0.5">
            {cohort.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onNavigateToQuiz}
            className="flex-1 md:flex-initial bg-[#f3f4f5] hover:bg-[#e7e8e9] text-[#191c1d] font-headline font-semibold text-xs md:text-sm px-4 py-2.5 rounded-full transition-colors active:scale-95 flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 text-[#0059bb]" />
            <span>Simular Quiz</span>
          </button>
          <button
            onClick={onOpenNewReport}
            className="flex-1 md:flex-initial bg-[#0059bb] text-white font-headline font-bold text-xs md:text-sm px-5 py-2.5 rounded-full hover:bg-[#0070ea] transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Relatório</span>
          </button>
        </div>
      </div>

      {/* Featured Live Pie Presentation Mode Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> AO VIVO NO PROJETOR
            </span>
            <span className="text-xs text-blue-200 font-semibold">• Animação em Tempo Real</span>
          </div>
          <h2 className="font-headline font-extrabold text-xl md:text-2xl tracking-tight text-white">
            Dashboard de Pizza Animado em Tempo Real
          </h2>
          <p className="text-xs md:text-sm text-blue-100/90 leading-relaxed">
            Apresente os resultados do Quiz em tempo real na tela ou projetor. As fatias do gráfico de pizza giram e se expandem ao vivo conforme a turma vai votando e respondendo!
          </p>
        </div>

        <button
          onClick={onNavigateToLive}
          className="relative z-10 bg-rose-600 hover:bg-rose-500 text-white font-headline font-bold text-sm px-6 py-3.5 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2.5 whitespace-nowrap shrink-0"
        >
          <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
          <span>Abrir Pizza Ao Vivo</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Card 1: Total Participants */}
        <div className="bg-white rounded-2xl p-6 shadow-[0px_10px_30px_rgba(0,123,255,0.06)] border border-gray-100 flex flex-col gap-4 relative overflow-hidden group hover:border-[#0059bb]/30 transition-all">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#0059bb]"></div>
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-[#d8e2ff] flex items-center justify-center text-[#0059bb]">
              <Users className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 font-headline font-bold text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/50">
              <ArrowUp className="w-3.5 h-3.5" /> +12%
            </span>
          </div>
          <div>
            <h3 className="font-headline text-xs text-[#414754] font-semibold uppercase tracking-wider mb-1">
              Total de Participantes
            </h3>
            <p className="font-headline text-3xl md:text-4xl font-bold text-[#191c1d]">
              {cohort.totalParticipants.toLocaleString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Card 2: Quiz Completion */}
        <div className="bg-white rounded-2xl p-6 shadow-[0px_10px_30px_rgba(0,123,255,0.06)] border border-gray-100 flex flex-col gap-4 relative overflow-hidden group hover:border-[#b80049]/30 transition-all">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#e2165f]"></div>
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-[#ffd9de] flex items-center justify-center text-[#b80049]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 font-headline font-bold text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/50">
              <ArrowUp className="w-3.5 h-3.5" /> +5%
            </span>
          </div>
          <div>
            <h3 className="font-headline text-xs text-[#414754] font-semibold uppercase tracking-wider mb-1">
              Conclusão do Quiz
            </h3>
            <p className="font-headline text-3xl md:text-4xl font-bold text-[#191c1d]">
              {cohort.quizCompletionRate}%
            </p>
          </div>
        </div>

        {/* Card 3: Avg Score / Growth */}
        <div className="bg-white rounded-2xl p-6 shadow-[0px_10px_30px_rgba(0,123,255,0.06)] border border-gray-100 flex flex-col gap-4 relative overflow-hidden group hover:border-[#fabd00]/50 transition-all">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#fabd00]"></div>
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-[#ffdf9e] flex items-center justify-center text-[#755700]">
              <Award className="w-5 h-5" />
            </div>
            <span
              className={`inline-flex items-center gap-1 font-headline font-bold text-xs px-2.5 py-1 rounded-full border ${
                cohort.revenueGrowthTrend === 'down'
                  ? 'text-rose-700 bg-rose-50 border-rose-200/50'
                  : 'text-emerald-700 bg-emerald-50 border-emerald-200/50'
              }`}
            >
              {cohort.revenueGrowthTrend === 'down' ? (
                <ArrowDown className="w-3.5 h-3.5" />
              ) : (
                <ArrowUp className="w-3.5 h-3.5" />
              )}
              {cohort.revenueGrowthPercent}%
            </span>
          </div>
          <div>
            <h3 className="font-headline text-xs text-[#414754] font-semibold uppercase tracking-wider mb-1">
              Média de Pontuação / Growth
            </h3>
            <div className="flex items-baseline gap-2">
              <p className="font-headline text-3xl md:text-4xl font-bold text-[#191c1d]">
                {cohort.avgScore}/100
              </p>
              <span className="text-xs text-gray-500 font-semibold">({cohort.revenueGrowth})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Distribution & Student Activity Areas Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Distribution Card */}
        <section className="bg-white p-6 rounded-2xl shadow-[0px_10px_30px_rgba(0,123,255,0.06)] border border-gray-100 flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h2 className="font-headline text-lg font-bold text-[#191c1d]">
              Distribuição de Perfil / Profile Distribution
            </h2>
            <span className="text-xs text-[#0059bb] font-semibold bg-blue-50 px-2.5 py-1 rounded-full">
              Turma Ativa
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-5 justify-center">
            {cohort.profileDistribution.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-xs font-body">
                Nenhum perfil registrado ainda no banco de dados.
              </div>
            ) : (
              cohort.profileDistribution.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex justify-between font-headline text-xs md:text-sm">
                    <span className="text-[#191c1d] font-bold">{item.label}</span>
                    <span className="text-[#414754] font-semibold">
                      {item.percentage}% ({item.count} alunos)
                    </span>
                  </div>
                  <div className="w-full bg-[#e1e3e4] rounded-full h-3 overflow-hidden p-0.5">
                    <div
                      className={`${item.colorClass} h-full rounded-full transition-all duration-700`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Activity Areas Card */}
        <section className="bg-white p-6 rounded-2xl shadow-[0px_10px_30px_rgba(0,123,255,0.06)] border border-gray-100 flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h2 className="font-headline text-lg font-bold text-[#191c1d]">
              Áreas de Atuação dos Alunos
            </h2>
            <span className="text-xs text-[#414754] font-medium">
              Categorias Frequentes
            </span>
          </div>

          <p className="text-xs text-[#414754] leading-relaxed">
            Identificação do papel dos alunos no ecossistema aquático para direcionamento pedagógico e mentoria de negócios.
          </p>

          <div className="flex flex-wrap gap-2.5 pt-2">
            {cohort.activityAreas.length === 0 ? (
              <div className="w-full text-center py-6 text-gray-400 text-xs font-body">
                Aguardando respostas de formulários no banco para categorizar áreas.
              </div>
            ) : (
              cohort.activityAreas.map((area, idx) => (
                <span
                  key={idx}
                  className={`px-4 py-2.5 rounded-xl font-headline text-xs md:text-sm font-bold shadow-xs flex items-center gap-2 ${area.bgClass} ${area.textClass}`}
                >
                  <span>{area.area}</span>
                  <span className="opacity-80 text-[11px] font-normal bg-white/60 px-2 py-0.5 rounded-md">
                    {area.count}
                  </span>
                </span>
              ))
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
            <span>Metodologia Natação Criativa</span>
            <span className="text-[#0059bb] font-semibold">100% Validado</span>
          </div>
        </section>
      </div>

      {/* Recent Quiz Completions Table */}
      <section className="bg-white rounded-2xl shadow-[0px_10px_30px_rgba(0,123,255,0.06)] border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-headline text-lg font-bold text-[#191c1d]">
              Conclusões Recentes do Quiz
            </h2>
            <p className="text-xs text-gray-500">
              Resultados em tempo real dos participantes da {cohort.name}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar aluno ou perfil..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#f3f4f5] pl-9 pr-3 py-1.5 rounded-lg text-xs font-body focus:outline-none focus:ring-2 focus:ring-[#0059bb]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f3f4f5] text-[#414754] font-headline text-xs border-b border-gray-200">
                <th className="p-4 font-semibold">Nome do Aluno</th>
                <th className="p-4 font-semibold">Score / Pontuação</th>
                <th className="p-4 font-semibold">Perfil Diagnóstico</th>
                <th className="p-4 font-semibold">Área de Atuação</th>
                <th className="p-4 font-semibold">Data / Horário</th>
                <th className="p-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="font-body text-xs md:text-sm text-[#191c1d] divide-y divide-gray-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Nenhum aluno encontrado para os critérios selecionados.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const scoreBg =
                    student.score >= 90
                      ? 'bg-emerald-100 text-emerald-800'
                      : student.score >= 80
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800';

                  const badgeAvatarBg =
                    student.profile === 'Visionário Estratégico'
                      ? 'bg-[#b80049] text-white'
                      : student.profile === 'Empreendedor em Ascensão'
                      ? 'bg-[#0059bb] text-white'
                      : 'bg-[#fabd00] text-gray-900';

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-[#f8f9fa] transition-colors group cursor-pointer"
                      onClick={() => onOpenStudentDetail(student)}
                    >
                      <td className="p-4 flex items-center gap-3 font-semibold">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${badgeAvatarBg}`}
                        >
                          {student.avatarInitials}
                        </div>
                        <div>
                          <div className="text-gray-900 font-bold group-hover:text-[#0059bb] transition-colors">
                            {student.name}
                          </div>
                          <div className="text-[11px] text-gray-400 font-normal">
                            {student.city}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-md font-bold text-xs ${scoreBg}`}
                        >
                          {student.score} / 100
                        </span>
                      </td>
                      <td className="p-4 font-medium text-gray-800">
                        {student.profile}
                      </td>
                      <td className="p-4 text-gray-600">{student.roleArea}</td>
                      <td className="p-4 text-gray-500 text-xs">
                        {student.completedAt}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenStudentDetail(student);
                          }}
                          className="inline-flex items-center gap-1 bg-gray-100 hover:bg-[#0059bb] hover:text-white px-3 py-1 rounded-md text-xs font-semibold text-gray-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
