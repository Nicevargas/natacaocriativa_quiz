import React from 'react';
import { TrendingUp, BarChart2, Calendar, Award, Zap } from 'lucide-react';
import { Cohort } from '../types';

interface GrowthTabProps {
  cohorts: Cohort[];
}

export const GrowthTab: React.FC<GrowthTabProps> = ({ cohorts }) => {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-[0px_10px_30px_rgba(0,123,255,0.06)] border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fabd00]/20 text-[#755700] mb-1">
            <Zap className="w-3.5 h-3.5" /> Métricas Globais & Crescimento
          </div>
          <h1 className="font-headline text-2xl font-bold text-[#191c1d]">
            Análise de Evolução & Growth
          </h1>
          <p className="font-body text-xs md:text-sm text-[#414754] mt-0.5">
            Comparativo de desempenho pedagógico e retenção entre as turmas de Natação Criativa.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#f3f4f5] p-1.5 rounded-xl text-xs font-semibold">
          <span className="px-3 py-1 rounded-lg bg-white shadow-xs text-[#0059bb]">2023 - 2024</span>
          <span className="px-3 py-1 text-gray-500">Últimos 12 meses</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-2">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Crescimento de Alunos</span>
          <p className="font-headline text-3xl font-extrabold text-[#0059bb]">+38.4%</p>
          <p className="text-xs text-emerald-600 font-semibold">↑ Expansão contínua em turmas híbridas</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-2">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Média de Satisfação</span>
          <p className="font-headline text-3xl font-extrabold text-[#b80049]">9.8 / 10</p>
          <p className="text-xs text-emerald-600 font-semibold">↑ Baseado em 1.248 avaliações</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-2">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Taxa de Conclusão do Quiz</span>
          <p className="font-headline text-3xl font-extrabold text-amber-600">84.2%</p>
          <p className="text-xs text-[#414754]">Engajamento alto no mapeamento inicial</p>
        </div>
      </div>

      {/* Cohort Comparison Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-headline text-lg font-bold text-[#191c1d]">
            Comparativo de Turmas
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f3f4f5] text-[#414754] font-headline text-xs border-b border-gray-200">
                <th className="p-4 font-semibold">Turma</th>
                <th className="p-4 font-semibold">Localização</th>
                <th className="p-4 font-semibold">Participantes</th>
                <th className="p-4 font-semibold">Taxa de Conclusão</th>
                <th className="p-4 font-semibold">Média Score</th>
                <th className="p-4 font-semibold">Receita / Impacto</th>
              </tr>
            </thead>
            <tbody className="font-body text-xs md:text-sm text-[#191c1d] divide-y divide-gray-100">
              {cohorts.map((c) => (
                <tr key={c.id} className="hover:bg-[#f8f9fa]">
                  <td className="p-4 font-bold text-[#0059bb]">{c.name}</td>
                  <td className="p-4 text-gray-600">{c.location}</td>
                  <td className="p-4 font-semibold">{c.totalParticipants}</td>
                  <td className="p-4">{c.quizCompletionRate}%</td>
                  <td className="p-4 font-bold">{c.avgScore}/100</td>
                  <td className="p-4 font-semibold text-emerald-700">{c.revenueGrowth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
