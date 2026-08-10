import React, { useState, useEffect, useRef } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Sector
} from 'recharts';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sparkles,
  Zap,
  Radio,
  UserPlus,
  BarChart3,
  PieChart as PieIcon,
  HelpCircle,
  Activity,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QUIZ_QUESTIONS } from '../data/mockData';
import { StudentProfile } from '../types';
import {
  subscribeToRealtimeQuizResponses,
  isSupabaseConfigured,
  submitQuizResponseToSupabase,
  fetchQuizResponsesFromSupabase,
  fetchEmpreendedorismoResponsesFromSupabase,
} from '../lib/supabase';

interface LiveResponse {
  id: string;
  studentName: string;
  avatarInitials: string;
  profile: StudentProfile;
  questionId: number;
  optionText: string;
  timestamp: string;
}

const PROFILE_COLORS: Record<StudentProfile, string> = {
  'Empreendedor em Ascensão': '#0059bb',
  'Visionário Estratégico': '#e2165f',
  'Gestor Operacional': '#fabd00',
  'Personal Aquático': '#00a86b',
  'Consultoria': '#8b5cf6',
};

const RANDOM_NAMES = [
  'Fernanda Oliveira', 'Rodrigo Rocha', 'Juliana Santos', 'Marcelo Costa',
  'Aline Lima', 'Thiago Araujo', 'Camila Martins', 'Lucas Almeida',
  'Patrícia Duarte', 'Gustavo Pereira', 'Mariana Ribeiro', 'Gabriel Souza'
];

interface LivePieDashboardProps {
  cohortName?: string;
}

export const LivePieDashboard: React.FC<LivePieDashboardProps> = ({
  cohortName = 'Empreendedorismo Turma 01 Fortaleza',
}) => {
  // Selected metric mode: 'profiles' or question id
  const [metricCategory, setMetricCategory] = useState<'profiles' | number>('profiles');
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  // Live aggregated counts (Start at 0 for real database data)
  const [profileCounts, setProfileCounts] = useState<Record<StudentProfile, number>>({
    'Empreendedor em Ascensão': 0,
    'Visionário Estratégico': 0,
    'Gestor Operacional': 0,
    'Personal Aquático': 0,
    'Consultoria': 0,
  });

  // Question specific options count
  const [questionCounts, setQuestionCounts] = useState<Record<number, number[]>>({
    1: [0, 0, 0, 0],
    2: [0, 0, 0, 0],
    3: [0, 0, 0, 0],
    4: [0, 0, 0, 0],
    5: [0, 0, 0, 0],
  });

  // Stream of incoming live responses (Start empty for real database data)
  const [recentResponses, setRecentResponses] = useState<LiveResponse[]>([]);
  const [totalVotes, setTotalVotes] = useState<number>(0);

  // Initial load of real database responses
  useEffect(() => {
    const loadRealData = async () => {
      const [quizRes, empRes] = await Promise.all([
        fetchQuizResponsesFromSupabase(),
        fetchEmpreendedorismoResponsesFromSupabase(),
      ]);

      const counts: Record<StudentProfile, number> = {
        'Empreendedor em Ascensão': 0,
        'Visionário Estratégico': 0,
        'Gestor Operacional': 0,
        'Personal Aquático': 0,
        'Consultoria': 0,
      };

      const responsesList: LiveResponse[] = [];

      (quizRes || []).forEach((item) => {
        const prof = (item.profile_result as StudentProfile) || 'Empreendedor em Ascensão';
        if (counts[prof] !== undefined) counts[prof] += 1;
        else counts['Empreendedor em Ascensão'] += 1;

        const initials = (item.student_name || 'AL')
          .split(' ')
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();

        responsesList.push({
          id: item.id || `q-${Math.random()}`,
          studentName: item.student_name || 'Participante',
          avatarInitials: initials,
          profile: prof,
          questionId: 1,
          optionText: `Perfil identificado: ${prof}`,
          timestamp: item.created_at ? new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Recente',
        });
      });

      (empRes.data || []).forEach((emp) => {
        const prof = (emp.area_para_empreender as StudentProfile) || 'Empreendedor em Ascensão';
        if (counts[prof] !== undefined) counts[prof] += 1;

        const initials = (emp.nome_completo || 'AL')
          .split(' ')
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();

        responsesList.push({
          id: emp.id || `emp-${Math.random()}`,
          studentName: emp.nome_completo || 'Participante',
          avatarInitials: initials,
          profile: prof,
          questionId: 1,
          optionText: `Formulário Pós: ${emp.area_atuacao_atual || prof}`,
          timestamp: emp.created_at ? new Date(emp.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Hoje',
        });
      });

      setProfileCounts(counts);
      setRecentResponses(responsesList.slice(0, 10));
      setTotalVotes(responsesList.length);
    };

    loadRealData();
  }, []);

  // Supabase Realtime listener
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const unsubscribe = subscribeToRealtimeQuizResponses((newRes) => {
      const prof = (newRes.profile_result as StudentProfile) || 'Empreendedor em Ascensão';
      
      setProfileCounts((prev) => ({
        ...prev,
        [prof]: (prev[prof] || 0) + 1,
      }));

      setTotalVotes((prev) => prev + 1);

      const initials = (newRes.student_name || 'Aluno')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2);

      const resItem: LiveResponse = {
        id: newRes.id || `sp-${Date.now()}`,
        studentName: newRes.student_name,
        avatarInitials: initials,
        profile: prof,
        questionId: 1,
        optionText: `Votou ao vivo no Supabase: ${prof}`,
        timestamp: 'Agora mesmo',
      };

      setRecentResponses((prev) => [resItem, ...prev.slice(0, 5)]);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Auto simulation ticker
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isAutoSimulating) {
      interval = setInterval(() => {
        simulateIncomingVote();
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoSimulating, profileCounts, questionCounts]);

  // Simulate single vote helper
  const simulateIncomingVote = (forcedProfile?: StudentProfile, questionIdNum?: number, optionIdx?: number) => {
    const profiles: StudentProfile[] = [
      'Empreendedor em Ascensão',
      'Visionário Estratégico',
      'Gestor Operacional',
      'Personal Aquático',
      'Consultoria',
    ];

    const chosenProfile = forcedProfile || profiles[Math.floor(Math.random() * profiles.length)];
    const chosenName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const initials = chosenName.split(' ').map((n) => n[0]).join('').substring(0, 2);

    // Update profile counts
    setProfileCounts((prev) => ({
      ...prev,
      [chosenProfile]: prev[chosenProfile] + 1,
    }));

    // Update question options counts
    setQuestionCounts((prev) => {
      const qId = questionIdNum || 1;
      const currentQ = prev[qId] || [10, 10, 10, 10];
      const optIdx = optionIdx !== undefined ? optionIdx : Math.floor(Math.random() * currentQ.length);
      const newQ = [...currentQ];
      newQ[optIdx] = newQ[optIdx] + 1;
      return { ...prev, [qId]: newQ };
    });

    setTotalVotes((prev) => prev + 1);

    // Add to recent feed
    const newRes: LiveResponse = {
      id: `live-${Date.now()}`,
      studentName: chosenName,
      avatarInitials: initials,
      profile: chosenProfile,
      questionId: questionIdNum || 1,
      optionText: forcedProfile
        ? `Votou no perfil: ${forcedProfile}`
        : 'Respondeu à avaliação de Natação Criativa ao vivo',
      timestamp: 'Agora mesmo',
    };

    setRecentResponses((prev) => [newRes, ...prev.slice(0, 5)]);
  };

  const handleResetVotes = () => {
    setProfileCounts({
      'Empreendedor em Ascensão': 0,
      'Visionário Estratégico': 0,
      'Gestor Operacional': 0,
      'Personal Aquático': 0,
      'Consultoria': 0,
    });
    setTotalVotes(0);
    setRecentResponses([]);
  };

  // Prepare chart data based on active metric
  const getChartData = () => {
    if (metricCategory === 'profiles') {
      return Object.entries(profileCounts).map(([name, value]) => {
        const valNum = Number(value);
        return {
          name,
          value: valNum,
          color: PROFILE_COLORS[name as StudentProfile] || '#0059bb',
          percentage: totalVotes > 0 ? Math.round((valNum / totalVotes) * 100) : 0,
        };
      });
    } else {
      const q = QUIZ_QUESTIONS.find((item) => item.id === metricCategory);
      if (!q) return [];
      const counts = questionCounts[metricCategory] || [0, 0, 0, 0];
      const qTotal = counts.reduce((a, b) => a + b, 0);

      const colors = ['#0059bb', '#e2165f', '#fabd00', '#00a86b'];

      return q.options.map((opt, idx) => ({
        name: opt.text.length > 35 ? opt.text.substring(0, 35) + '...' : opt.text,
        fullText: opt.text,
        profile: opt.profile,
        value: counts[idx] || 0,
        color: colors[idx % colors.length],
        percentage: qTotal > 0 ? Math.round(((counts[idx] || 0) / qTotal) * 100) : 0,
      }));
    }
  };

  const chartData = getChartData();
  const leaderItem = [...chartData].sort((a, b) => b.value - a.value)[0];

  // Render custom active shape for Pie Chart
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    return (
      <g>
        <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#191c1d" className="font-headline font-extrabold text-lg md:text-xl">
          {payload.name}
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" fill="#0059bb" className="font-headline font-bold text-base md:text-lg">
          {`${value} votos (${(percent * 100).toFixed(1)}%)`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 10}
          outerRadius={outerRadius + 14}
          fill={fill}
        />
      </g>
    );
  };

  return (
    <div
      className={`transition-all duration-300 ${
        isFullscreenMode
          ? 'fixed inset-0 z-50 bg-[#111827] text-white p-6 overflow-y-auto flex flex-col justify-between'
          : 'flex flex-col gap-6 max-w-7xl mx-auto'
      }`}
    >
      {/* Top Banner / Controls */}
      <div
        className={`p-6 rounded-2xl border transition-colors ${
          isFullscreenMode
            ? 'bg-[#1f2937] border-gray-700 shadow-2xl'
            : 'bg-white shadow-[0px_10px_30px_rgba(0,123,255,0.06)] border-gray-100'
        } flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-500 animate-pulse">
              <Radio className="w-3.5 h-3.5" /> AO VIVO
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                isSupabaseConfigured
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
              }`}
            >
              {isSupabaseConfigured ? '⚡ Supabase Realtime Conectado' : '⚡ Supabase SQL + RLS Pronto'}
            </span>
            <span className={`text-xs ${isFullscreenMode ? 'text-gray-400' : 'text-gray-500'}`}>
              • Apresentação em Tempo Real
            </span>
          </div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold tracking-tight">
            Dashboard de Pizza Animado em Tempo Real
          </h1>
          <p className={`text-xs md:text-sm ${isFullscreenMode ? 'text-gray-300' : 'text-[#414754]'}`}>
            Projeção ao vivo dos resultados do Quiz de Natação Criativa - {cohortName}
          </p>
        </div>

        {/* Live Simulation Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Toggle Auto Simulation */}
          <button
            onClick={() => setIsAutoSimulating(!isAutoSimulating)}
            className={`px-4 py-2.5 rounded-full font-headline font-bold text-xs md:text-sm flex items-center gap-2 transition-all shadow-sm ${
              isAutoSimulating
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                : 'bg-[#0059bb] hover:bg-[#0070ea] text-white'
            }`}
          >
            {isAutoSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isAutoSimulating ? 'Pausar Simulação Ao Vivo' : 'Simular Respostas Automáticas'}</span>
          </button>

          {/* Reset button */}
          <button
            onClick={handleResetVotes}
            className={`p-2.5 rounded-full border transition-colors ${
              isFullscreenMode
                ? 'border-gray-600 hover:bg-gray-800 text-gray-200'
                : 'border-gray-200 hover:bg-gray-100 text-gray-700'
            }`}
            title="Zerar Contagem Ao Vivo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Fullscreen Projection Mode button */}
          <button
            onClick={() => setIsFullscreenMode(!isFullscreenMode)}
            className={`px-4 py-2.5 rounded-full font-headline font-bold text-xs md:text-sm border flex items-center gap-2 transition-all ${
              isFullscreenMode
                ? 'bg-white text-gray-900 border-white hover:bg-gray-200'
                : 'bg-[#f3f4f5] text-[#191c1d] border-gray-200 hover:bg-[#e7e8e9]'
            }`}
          >
            {isFullscreenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{isFullscreenMode ? 'Sair da Tela Cheia' : 'Modo Projetor'}</span>
          </button>
        </div>
      </div>

      {/* Selector of Question/Metric */}
      <div
        className={`p-3 rounded-2xl border flex flex-wrap items-center gap-2 ${
          isFullscreenMode ? 'bg-[#1f2937] border-gray-700' : 'bg-white border-gray-100 shadow-xs'
        }`}
      >
        <span className="text-xs font-headline font-bold px-3 py-1 text-[#0059bb] flex items-center gap-1">
          <PieIcon className="w-4 h-4" /> Visão:
        </span>

        <button
          onClick={() => setMetricCategory('profiles')}
          className={`px-3 py-1.5 rounded-xl font-headline font-bold text-xs transition-all ${
            metricCategory === 'profiles'
              ? 'bg-[#0059bb] text-white shadow-xs'
              : isFullscreenMode
              ? 'text-gray-300 hover:bg-gray-800'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Perfil Diagnóstico Geral
        </button>

        {QUIZ_QUESTIONS.map((q) => (
          <button
            key={q.id}
            onClick={() => setMetricCategory(q.id)}
            className={`px-3 py-1.5 rounded-xl font-headline font-bold text-xs transition-all ${
              metricCategory === q.id
                ? 'bg-[#0059bb] text-white shadow-xs'
                : isFullscreenMode
                ? 'text-gray-300 hover:bg-gray-800'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Q{q.id}: {q.category}
          </button>
        ))}
      </div>

      {/* Main Grid: Left Animated Pie Chart, Right Live Feed & Quick Vote Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Animated Pie Chart Container */}
        <div
          className={`lg:col-span-8 p-6 md:p-8 rounded-2xl border flex flex-col justify-between ${
            isFullscreenMode ? 'bg-[#1f2937] border-gray-700 shadow-xl' : 'bg-white border-gray-100 shadow-[0px_10px_30px_rgba(0,123,255,0.06)]'
          }`}
        >
          {/* Chart Title and Header metrics */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-gray-200/20">
            <div>
              <h2 className="font-headline text-lg md:text-xl font-bold">
                {metricCategory === 'profiles'
                  ? 'Distribuição dos Perfis em Tempo Real'
                  : `Questão ${metricCategory}: ${QUIZ_QUESTIONS.find((q) => q.id === metricCategory)?.question}`}
              </h2>
              <p className={`text-xs mt-0.5 ${isFullscreenMode ? 'text-gray-400' : 'text-gray-500'}`}>
                As fatias da pizza se ajustam dinamicamente a cada nova resposta enviada.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`px-4 py-2 rounded-xl text-center border ${
                  isFullscreenMode ? 'bg-gray-800 border-gray-700' : 'bg-[#f8f9fa] border-gray-200'
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Total de Votos</span>
                <span className="font-headline font-extrabold text-xl text-[#0059bb]">{totalVotes}</span>
              </div>

              {leaderItem && (
                <div
                  className={`px-4 py-2 rounded-xl text-center border ${
                    isFullscreenMode ? 'bg-gray-800 border-gray-700' : 'bg-[#f8f9fa] border-gray-200'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Perfil Líder</span>
                  <span className="font-headline font-bold text-sm text-[#e2165f] truncate max-w-[120px] block">
                    {leaderItem.name} ({leaderItem.percentage}%)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Animated Recharts Pie Chart Canvas */}
          <div className="w-full h-[380px] md:h-[440px] relative flex items-center justify-center">
            {totalVotes === 0 ? (
              <div className="text-center p-8 text-gray-400">
                <PieIcon className="w-16 h-16 mx-auto mb-3 opacity-40 animate-spin" />
                <p className="font-headline font-bold text-base">Aguardando primeiras respostas ao vivo...</p>
                <p className="text-xs mt-1">Clique em "Simular Voto" ao lado para ver a pizza animar!</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isFullscreenMode ? 90 : 80}
                    outerRadius={isFullscreenMode ? 140 : 130}
                    paddingAngle={4}
                    dataKey="value"
                    animationDuration={800}
                    animationEasing="ease-out"
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(undefined)}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={isFullscreenMode ? '#1f2937' : '#ffffff'}
                        strokeWidth={3}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl border border-gray-800 text-xs space-y-1">
                            <p className="font-headline font-bold text-sm" style={{ color: data.color }}>
                              {data.name}
                            </p>
                            <p>
                              Votos registrados: <strong>{data.value}</strong>
                            </p>
                            <p>
                              Proporção: <strong>{data.percentage}%</strong>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={48}
                    formatter={(value, entry: any) => (
                      <span
                        className={`text-xs font-headline font-semibold mx-2 ${
                          isFullscreenMode ? 'text-gray-200' : 'text-gray-800'
                        }`}
                      >
                        {value}: {entry.payload?.value} ({entry.payload?.percentage}%)
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Breakdown Slices Bar below Pie */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-4 border-t border-gray-200/20">
            {chartData.map((item, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isFullscreenMode ? 'bg-gray-800/80 border-gray-700' : 'bg-[#f8f9fa] border-gray-200/80'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-[11px] font-bold truncate max-w-[100px]">{item.name}</span>
                </div>
                <div className="font-headline font-extrabold text-sm md:text-base">{item.percentage}%</div>
                <div className="text-[10px] text-gray-400 font-semibold">{item.value} votos</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Feed & Simulator Control Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Quick Vote Simulator Panel */}
          <div
            className={`p-6 rounded-2xl border ${
              isFullscreenMode ? 'bg-[#1f2937] border-gray-700' : 'bg-white border-gray-100 shadow-[0px_10px_30px_rgba(0,123,255,0.06)]'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-rose-500" />
              <h3 className="font-headline font-bold text-base">Simulador de Respostas</h3>
            </div>
            <p className={`text-xs mb-4 ${isFullscreenMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Clique para injetar votos instantâneos no gráfico de pizza e testar a animação ao vivo:
            </p>

            <div className="space-y-2">
              {Object.keys(PROFILE_COLORS).map((prof) => (
                <button
                  key={prof}
                  onClick={() => simulateIncomingVote(prof as StudentProfile)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs font-headline font-bold flex items-center justify-between transition-all active:scale-95 ${
                    isFullscreenMode
                      ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-white'
                      : 'bg-[#f8f9fa] hover:bg-[#d8e2ff]/50 border-gray-200 text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: PROFILE_COLORS[prof as StudentProfile] }}
                    ></span>
                    <span>+1 Voto: {prof}</span>
                  </div>
                  <UserPlus className="w-3.5 h-3.5 opacity-60" />
                </button>
              ))}
            </div>
          </div>

          {/* Live Feed Stream */}
          <div
            className={`p-6 rounded-2xl border flex-1 ${
              isFullscreenMode ? 'bg-[#1f2937] border-gray-700' : 'bg-white border-gray-100 shadow-[0px_10px_30px_rgba(0,123,255,0.06)]'
            }`}
          >
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200/20">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0059bb]" />
                <h3 className="font-headline font-bold text-sm">Feed de Respostas Ao Vivo</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Streaming
              </span>
            </div>

            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {recentResponses.map((res) => (
                  <motion.div
                    key={res.id}
                    initial={{ opacity: 0, y: -12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      isFullscreenMode
                        ? 'bg-gray-800/60 border-gray-700 text-gray-200'
                        : 'bg-[#f8f9fa] border-gray-200/80 text-gray-800'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#0059bb] text-white font-bold text-[10px] flex items-center justify-center">
                          {res.avatarInitials}
                        </div>
                        <span className="font-bold">{res.studentName}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{res.timestamp}</span>
                    </div>

                    <p className="text-[11px] text-gray-500 pl-8">{res.optionText}</p>

                    <div className="pl-8 pt-1">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white"
                        style={{
                          backgroundColor: PROFILE_COLORS[res.profile] || '#0059bb',
                        }}
                      >
                        {res.profile}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
