import React, { useState } from 'react';
import {
  FileCheck,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  BarChart3,
  Award,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data/mockData';
import { StudentProfile } from '../types';
import { DynamicQuestionEditor } from './DynamicQuestionEditor';

interface QuizDataTabProps {
  onAddCompletedQuizStudent: (profileName: StudentProfile, score: number) => void;
}

export const QuizDataTab: React.FC<QuizDataTabProps> = ({
  onAddCompletedQuizStudent,
}) => {
  const [quizSubTab, setQuizSubTab] = useState<'simulator' | 'questions' | 'profiles' | 'editor'>('simulator');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [resultProfile, setResultProfile] = useState<StudentProfile | null>(null);
  const [finalScore, setFinalScore] = useState<number>(0);

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = () => {
    const profileCounts: Record<string, number> = {};
    let totalScore = 0;

    QUIZ_QUESTIONS.forEach((q) => {
      const selectedOptionIdx = selectedAnswers[q.id];
      if (selectedOptionIdx !== undefined) {
        const option = q.options[selectedOptionIdx];
        profileCounts[option.profile] = (profileCounts[option.profile] || 0) + 1;
        totalScore += option.scoreWeight;
      }
    });

    let topProfile: StudentProfile = 'Empreendedor em Ascensão';
    let maxCount = 0;
    Object.entries(profileCounts).forEach(([prof, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topProfile = prof as StudentProfile;
      }
    });

    const calculatedScore = Math.min(100, Math.max(70, Math.round((totalScore / (QUIZ_QUESTIONS.length * 10)) * 100)));

    setResultProfile(topProfile);
    setFinalScore(calculatedScore);
    setQuizFinished(true);

    onAddCompletedQuizStudent(topProfile, calculatedScore);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setQuizFinished(false);
    setResultProfile(null);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-[0px_10px_30px_rgba(0,123,255,0.06)] border border-gray-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#e2165f]/10 text-[#e2165f] mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Metodologia Natação Criativa
          </div>
          <h1 className="font-headline text-2xl font-bold text-[#191c1d]">
            Quiz Data & Mapeamento Diagnóstico
          </h1>
          <p className="font-body text-xs md:text-sm text-[#414754] mt-0.5">
            Simulação de avaliação, gabarito e regras de categorização pedagógica.
          </p>
        </div>

        {/* Subtabs Navigation */}
        <div className="flex items-center gap-1 bg-[#f3f4f5] p-1 rounded-xl">
          <button
            onClick={() => setQuizSubTab('simulator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all ${
              quizSubTab === 'simulator'
                ? 'bg-white text-[#0059bb] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Simular Quiz
          </button>

          <button
            onClick={() => setQuizSubTab('questions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all ${
              quizSubTab === 'questions'
                ? 'bg-white text-[#0059bb] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Perguntas ({QUIZ_QUESTIONS.length})
          </button>

          <button
            onClick={() => setQuizSubTab('profiles')}
            className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all ${
              quizSubTab === 'profiles'
                ? 'bg-white text-[#0059bb] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Perfis Diagnósticos
          </button>

          <button
            onClick={() => setQuizSubTab('editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all flex items-center gap-1.5 ${
              quizSubTab === 'editor'
                ? 'bg-[#0070ea] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Editor de Perguntas</span>
          </button>
        </div>
      </div>

      {/* Simulator Subtab */}
      {quizSubTab === 'simulator' && (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0px_10px_30px_rgba(0,123,255,0.06)] border border-gray-100 max-w-3xl mx-auto w-full">
          {!quizFinished ? (
            <div>
              {/* Progress bar */}
              <div className="flex justify-between items-center text-xs font-headline font-bold text-[#414754] mb-2">
                <span>Pergunta {currentQuestionIndex + 1} de {QUIZ_QUESTIONS.length}</span>
                <span className="text-[#0059bb]">
                  {Math.round(((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100)}% concluído
                </span>
              </div>

              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-6">
                <div
                  className="bg-[#0059bb] h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%`,
                  }}
                ></div>
              </div>

              {/* Question */}
              <div className="mb-6">
                <span className="text-[11px] font-bold text-[#0059bb] bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {QUIZ_QUESTIONS[currentQuestionIndex].category}
                </span>
                <h2 className="font-headline text-lg md:text-xl font-bold text-[#191c1d] mt-2 leading-snug">
                  {QUIZ_QUESTIONS[currentQuestionIndex].question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {QUIZ_QUESTIONS[currentQuestionIndex].options.map((option, idx) => {
                  const isSelected =
                    selectedAnswers[QUIZ_QUESTIONS[currentQuestionIndex].id] === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() =>
                        handleSelectOption(QUIZ_QUESTIONS[currentQuestionIndex].id, idx)
                      }
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 active:scale-[0.99] ${
                        isSelected
                          ? 'border-[#0059bb] bg-blue-50/50 ring-2 ring-[#0059bb]/20 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'border-[#0059bb] bg-[#0059bb] text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className="font-body text-xs md:text-sm text-[#191c1d] leading-relaxed">
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                >
                  Anterior
                </button>

                <button
                  disabled={selectedAnswers[QUIZ_QUESTIONS[currentQuestionIndex].id] === undefined}
                  onClick={handleNextQuestion}
                  className="bg-[#0059bb] hover:bg-[#0070ea] disabled:opacity-50 text-white font-headline font-bold text-xs md:text-sm px-6 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-sm"
                >
                  <span>
                    {currentQuestionIndex === QUIZ_QUESTIONS.length - 1
                      ? 'Ver Diagnóstico'
                      : 'Próxima'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Result Card */
            <div className="text-center py-4 space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-[#d8e2ff] text-[#0059bb] flex items-center justify-center mx-auto shadow-sm">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold text-[#b80049] bg-pink-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  Diagnóstico Concluído
                </span>
                <h2 className="font-headline text-2xl font-bold text-[#191c1d] mt-2">
                  Perfil: {resultProfile}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Pontuação Global de Maturidade Aquática: <strong className="text-[#0059bb] font-headline">{finalScore}/100</strong>
                </p>
              </div>

              <div className="bg-[#f8f9fa] p-5 rounded-xl border border-gray-200 text-left text-xs space-y-2 text-[#414754]">
                <p className="font-bold text-[#191c1d] text-sm">Resumo da Recomendação Pedagógica:</p>
                <p>
                  • Foco no desenvolvimento de liderança de equipe e padronização da metodologia de ensino.
                </p>
                <p>
                  • Recomendado módulo avançado de Precificação e Escala de Turmas em Natação Criativa.
                </p>
                <p>
                  • Participação confirmada no relatório consolidado da turma ativa.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={handleResetQuiz}
                  className="bg-gray-100 hover:bg-gray-200 text-[#191c1d] font-headline font-semibold text-xs px-5 py-2.5 rounded-full transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Refazer Simulação</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Questions Subtab */}
      {quizSubTab === 'questions' && (
        <div className="space-y-4">
          {QUIZ_QUESTIONS.map((q) => (
            <div
              key={q.id}
              className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0059bb] bg-blue-50 px-2.5 py-1 rounded-md">
                  Questão {q.id} • {q.category}
                </span>
              </div>
              <h3 className="font-headline font-bold text-base text-[#191c1d]">
                {q.question}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                {q.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#f8f9fa] border border-gray-200/80 text-xs text-[#414754]"
                  >
                    <p className="font-medium text-[#191c1d]">{opt.text}</p>
                    <span className="text-[10px] text-[#0059bb] font-bold mt-1 block">
                      Associa ao perfil: {opt.profile} (+{opt.scoreWeight} pts)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profiles Subtab */}
      {quizSubTab === 'profiles' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 border-t-4 border-[#0059bb] space-y-2">
            <h3 className="font-headline font-bold text-base text-[#0059bb]">
              Empreendedor em Ascensão
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Profissional focado no crescimento acelerado, estruturando planos recorrentes e captação ativa de novos alunos.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 border-t-4 border-[#b80049] space-y-2">
            <h3 className="font-headline font-bold text-base text-[#b80049]">
              Visionário Estratégico
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Foco no licenciamento de marca, expansão de metodologia própria e autoridade no mercado de natação.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 border-t-4 border-[#fabd00] space-y-2">
            <h3 className="font-headline font-bold text-base text-amber-700">
              Gestor Operacional
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Especialista em taxa de ocupação da piscina, otimização de horário de raias e processos pedagógicos.
            </p>
          </div>
        </div>
      )}

      {/* Editor Subtab */}
      {quizSubTab === 'editor' && (
        <DynamicQuestionEditor />
      )}
    </div>
  );
};
