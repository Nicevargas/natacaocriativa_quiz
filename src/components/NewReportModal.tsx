import React, { useState } from 'react';
import { X, FileText, Download, Printer, Sparkles, Check } from 'lucide-react';
import { Cohort, Student } from '../types';

interface NewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  cohort: Cohort;
  students: Student[];
}

export const NewReportModal: React.FC<NewReportModalProps> = ({
  isOpen,
  onClose,
  cohort,
  students,
}) => {
  if (!isOpen) return null;

  const [reportType, setReportType] = useState('Consolidado Turma');
  const [includeProfileChart, setIncludeProfileChart] = useState(true);
  const [includeStudentList, setIncludeStudentList] = useState(true);
  const [isGenerated, setIsGenerated] = useState(false);

  const cohortStudents = students.filter(
    (s) => cohort.id === 'all-cohorts' || s.cohortId === cohort.id
  );

  const handleGenerate = () => {
    setIsGenerated(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const headers = 'Nome,Email,Cidade,Perfil,Area,Score,Status,ConcluidoEm\n';
    const rows = cohortStudents
      .map(
        (s) =>
          `"${s.name}","${s.email}","${s.city}","${s.profile}","${s.roleArea}",${s.score},"${s.quizStatus}","${s.completedAt}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_${cohort.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#0059bb]/10 text-[#0059bb]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-lg text-[#191c1d]">
                Gerar Novo Relatório Pedagógico
              </h2>
              <p className="text-xs text-gray-500">{cohort.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        {!isGenerated ? (
          <div className="space-y-4 py-4 text-xs">
            <div>
              <label className="block font-headline font-bold text-gray-700 mb-1">
                Tipo de Relatório
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-[#f3f4f5] p-3 rounded-xl text-xs font-body focus:outline-none focus:ring-2 focus:ring-[#0059bb]"
              >
                <option value="Consolidado Turma">Relatório Consolidado de Turma</option>
                <option value="Perfil e Diagnostico">Análise de Perfis & Maturidade Aquática</option>
                <option value="Engajamento Quiz">Relatório de Engajamento do Quiz</option>
              </select>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block font-headline font-bold text-gray-700">
                Seções do Documento
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer bg-[#f8f9fa] p-3 rounded-xl border border-gray-200/60">
                <input
                  type="checkbox"
                  checked={includeProfileChart}
                  onChange={(e) => setIncludeProfileChart(e.target.checked)}
                  className="rounded text-[#0059bb] focus:ring-[#0059bb] w-4 h-4"
                />
                <div>
                  <span className="font-bold text-[#191c1d] block">Gráfico de Distribuição de Perfis</span>
                  <span className="text-[11px] text-gray-500">
                    Inclui porcentagens de Personal Aquático, Visionário Estratégico e Gestor Operacional.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer bg-[#f8f9fa] p-3 rounded-xl border border-gray-200/60">
                <input
                  type="checkbox"
                  checked={includeStudentList}
                  onChange={(e) => setIncludeStudentList(e.target.checked)}
                  className="rounded text-[#0059bb] focus:ring-[#0059bb] w-4 h-4"
                />
                <div>
                  <span className="font-bold text-[#191c1d] block">Listagem de Alunos e Scores</span>
                  <span className="text-[11px] text-gray-500">
                    Inclui dados individuais de {cohortStudents.length} alunos cadastrados nesta visão.
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                className="px-6 py-2.5 rounded-full bg-[#0059bb] hover:bg-[#0070ea] text-white font-headline font-bold shadow-sm transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Gerar Prévia do Relatório</span>
              </button>
            </div>
          </div>
        ) : (
          /* Report Preview Output */
          <div className="py-4 space-y-4">
            <div className="bg-[#f8f9fa] p-5 rounded-2xl border border-gray-200 font-body text-xs text-[#191c1d] space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="font-headline font-bold text-sm text-[#0059bb]">
                  {reportType} - {cohort.name}
                </span>
                <span className="text-[11px] text-gray-500">
                  Gerado em {new Date().toLocaleDateString('pt-BR')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1 text-center">
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  <span className="text-[10px] text-gray-400 block font-bold">Participantes</span>
                  <span className="font-headline font-bold text-sm">{cohort.totalParticipants}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  <span className="text-[10px] text-gray-400 block font-bold">Taxa Conclusão</span>
                  <span className="font-headline font-bold text-sm">{cohort.quizCompletionRate}%</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  <span className="text-[10px] text-gray-400 block font-bold">Média Score</span>
                  <span className="font-headline font-bold text-sm">{cohort.avgScore}/100</span>
                </div>
              </div>

              {includeProfileChart && (
                <div className="space-y-1.5 pt-2">
                  <span className="font-bold text-gray-700 block">Distribuição do Diagnóstico:</span>
                  {cohort.profileDistribution.map((p, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span>{p.label}</span>
                      <span className="font-bold">{p.percentage}% ({p.count} alunos)</span>
                    </div>
                  ))}
                </div>
              )}

              {includeStudentList && (
                <div className="pt-2">
                  <span className="font-bold text-gray-700 block mb-1">Alunos em destaque:</span>
                  <div className="space-y-1">
                    {cohortStudents.slice(0, 4).map((s) => (
                      <div key={s.id} className="flex justify-between text-[11px] bg-white p-1.5 rounded border border-gray-100">
                        <span>{s.name} ({s.city})</span>
                        <span className="font-bold text-[#0059bb]">{s.profile} - {s.score} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
              <button
                onClick={() => setIsGenerated(false)}
                className="text-xs text-gray-500 hover:underline"
              >
                ← Voltar às opções
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCSV}
                  className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-headline font-semibold text-xs flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Exportar CSV
                </button>

                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-[#0059bb] text-white hover:bg-[#0070ea] font-headline font-semibold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" /> Imprimir / PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
