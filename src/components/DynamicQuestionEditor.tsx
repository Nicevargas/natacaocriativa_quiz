import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Copy,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  HelpCircle,
  ListPlus,
  Sparkles,
  Eye,
  SlidersHorizontal,
  Layers,
  Save,
  X,
  FileText,
  Tag,
  Hash,
} from 'lucide-react';
import { FormQuestion, QuestionType, FormQuestionOption } from '../types/question';
import { DEFAULT_EMPREENDEDORISMO_QUESTIONS } from '../data/defaultFormQuestions';

let inMemoryQuestionsCache: FormQuestion[] | null = null;

export function getStoredQuestions(): FormQuestion[] {
  try {
    localStorage.removeItem('natacao_criativa_custom_questions_v1');
  } catch (e) {}
  return inMemoryQuestionsCache || DEFAULT_EMPREENDEDORISMO_QUESTIONS;
}

export function saveStoredQuestions(questions: FormQuestion[]): void {
  inMemoryQuestionsCache = questions;
  try {
    localStorage.removeItem('natacao_criativa_custom_questions_v1');
  } catch (e) {}
}

interface DynamicQuestionEditorProps {
  onQuestionsUpdated?: (questions: FormQuestion[]) => void;
  onClose?: () => void;
}

export const DynamicQuestionEditor: React.FC<DynamicQuestionEditorProps> = ({
  onQuestionsUpdated,
  onClose,
}) => {
  const [questions, setQuestions] = useState<FormQuestion[]>(getStoredQuestions);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<FormQuestion | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Form Preview Test State
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});
  const [previewSubmitted, setPreviewSubmitted] = useState(false);

  useEffect(() => {
    saveStoredQuestions(questions);
    if (onQuestionsUpdated) {
      onQuestionsUpdated(questions);
    }
  }, [questions]);

  const categories = ['Todas', ...Array.from(new Set(questions.map((q) => q.category)))];

  const filteredQuestions = questions
    .filter((q) => selectedCategory === 'Todas' || q.category === selectedCategory)
    .filter(
      (q) =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.order - b.order);

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions].sort((a, b) => a.order - b.order);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;

    // Swap order
    const tempOrder = newQuestions[index].order;
    newQuestions[index].order = newQuestions[targetIndex].order;
    newQuestions[targetIndex].order = tempOrder;

    // Re-index cleanly
    const reindexed = newQuestions.map((q, idx) => ({ ...q, order: idx + 1 }));
    setQuestions(reindexed);
  };

  const handleDelete = (id: string) => {
    if (questions.length <= 1) {
      alert('O formulário precisa ter pelo menos 1 pergunta.');
      return;
    }
    if (confirm('Tem certeza que deseja excluir esta pergunta?')) {
      const remaining = questions.filter((q) => q.id !== id);
      const reindexed = remaining.map((q, idx) => ({ ...q, order: idx + 1 }));
      setQuestions(reindexed);
      showNotification('Pergunta excluída com sucesso.');
    }
  };

  const handleDuplicate = (question: FormQuestion) => {
    const newId = `q-custom-${Date.now()}`;
    const duplicated: FormQuestion = {
      ...question,
      id: newId,
      key: `${question.key}_copy_${Math.floor(Math.random() * 100)}`,
      title: `${question.title} (Cópia)`,
      order: questions.length + 1,
    };
    setQuestions((prev) => [...prev, duplicated]);
    showNotification('Pergunta duplicada!');
  };

  const handleResetToDefault = () => {
    if (confirm('Deseja restaurar as perguntas para o padrão original da Pós-Graduação?')) {
      setQuestions(DEFAULT_EMPREENDEDORISMO_QUESTIONS);
      saveStoredQuestions(DEFAULT_EMPREENDEDORISMO_QUESTIONS);
      showNotification('Perguntas restauradas para o padrão!');
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `formulario_perguntas_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
            setQuestions(parsed);
            showNotification('Perguntas importadas com sucesso!');
          } else {
            alert('Formato de arquivo JSON inválido.');
          }
        } catch (err) {
          alert('Erro ao processar o arquivo JSON.');
        }
      };
    }
  };

  const showNotification = (msg: string) => {
    setSavedSuccessMsg(msg);
    setTimeout(() => setSavedSuccessMsg(null), 3500);
  };

  const startCreateNew = () => {
    const newQuestion: FormQuestion = {
      id: `q-custom-${Date.now()}`,
      key: `pergunta_${Date.now()}`,
      title: '',
      description: '',
      type: 'text',
      required: true,
      category: 'Geral',
      order: questions.length + 1,
      placeholder: '',
      options: [
        { id: 'opt-1', label: 'Opção 1', value: 'Opção 1' },
        { id: 'opt-2', label: 'Opção 2', value: 'Opção 2' },
      ],
    };
    setEditingQuestion(newQuestion);
    setIsCreatingNew(true);
  };

  const saveQuestionForm = () => {
    if (!editingQuestion) return;

    if (!editingQuestion.title.trim()) {
      alert('Por favor, informe o título da pergunta.');
      return;
    }

    let updatedQuestions: FormQuestion[];
    if (isCreatingNew) {
      updatedQuestions = [...questions, editingQuestion];
    } else {
      updatedQuestions = questions.map((q) => (q.id === editingQuestion.id ? editingQuestion : q));
    }

    const reindexed = updatedQuestions.map((q, idx) => ({ ...q, order: idx + 1 }));
    setQuestions(reindexed);
    setEditingQuestion(null);
    setIsCreatingNew(false);
    showNotification('Pergunta salva com sucesso!');
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col max-w-6xl mx-auto my-2">
      {/* HEADER BAR */}
      <div className="bg-slate-900 text-white p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0070ea] text-white mb-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Editor Dinâmico
          </div>
          <h2 className="font-headline text-xl font-bold flex items-center gap-2">
            Gestão &amp; Criação de Perguntas do Formulário
          </h2>
          <p className="text-xs text-slate-300">
            Crie, reordene, edite e personalize o formulário de pesquisa em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* TAB TOGGLE */}
          <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'editor'
                  ? 'bg-[#0070ea] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Editor ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'preview'
                  ? 'bg-[#0070ea] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Pré-visualizar
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* NOTIFICATION BANNER */}
      {savedSuccessMsg && (
        <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 px-5 py-2.5 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* MAIN TAB CONTENT */}
      {activeTab === 'editor' ? (
        <div className="p-6 space-y-6">
          {/* TOP ACTIONS & FILTERS */}
          <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={startCreateNew}
                className="px-4 py-2 bg-[#0070ea] hover:bg-[#0059bb] text-white font-headline font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Pergunta</span>
              </button>

              <button
                onClick={handleResetToDefault}
                className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-headline font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                title="Restaurar padrão da Pós-Graduação"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Restaurar Padrão</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-headline font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                title="Exportar formulário em arquivo JSON"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Exportar JSON</span>
              </button>

              <label className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-headline font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Importar JSON</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportJSON}
                />
              </label>
            </div>

            {/* CATEGORY & SEARCH FILTER */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:border-[#0070ea]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'Todas' ? 'Todas as Categorias' : cat}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Buscar pergunta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 outline-none focus:border-[#0070ea] w-40 md:w-52"
              />
            </div>
          </div>

          {/* QUESTIONS LIST */}
          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500">
                <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p className="font-semibold text-sm">Nenhuma pergunta encontrada.</p>
                <p className="text-xs mt-1">Crie uma nova pergunta ou ajuste os filtros acima.</p>
              </div>
            ) : (
              filteredQuestions.map((q, idx) => {
                const globalIdx = questions.findIndex((item) => item.id === q.id);
                return (
                  <div
                    key={q.id}
                    className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      {/* ORDER BADGE */}
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-headline font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 mt-0.5">
                        #{q.order}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-headline font-bold text-sm text-slate-900">
                            {q.title || '(Sem Título)'}
                          </span>
                          {q.required ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                              Obrigatória
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                              Opcional
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />
                            {q.category}
                          </span>

                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            Tipo: {q.type}
                          </span>
                        </div>

                        {q.description && (
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {q.description}
                          </p>
                        )}

                        {/* PREVIEW OF OPTIONS */}
                        {q.options && q.options.length > 0 && (
                          <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-600 flex-wrap">
                            <span className="font-semibold text-slate-500">Opções ({q.options.length}):</span>
                            {q.options.slice(0, 4).map((opt) => (
                              <span
                                key={opt.id}
                                className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px]"
                              >
                                {opt.label}
                              </span>
                            ))}
                            {q.options.length > 4 && (
                              <span className="text-[10px] text-slate-400 font-semibold">
                                +{q.options.length - 4} mais
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleMove(globalIdx, 'up')}
                        disabled={globalIdx === 0}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 rounded-lg transition-all"
                        title="Mover para cima"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleMove(globalIdx, 'down')}
                        disabled={globalIdx === questions.length - 1}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 rounded-lg transition-all"
                        title="Mover para baixo"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDuplicate(q)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Duplicar pergunta"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setEditingQuestion(q);
                          setIsCreatingNew(false);
                        }}
                        className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all font-semibold flex items-center gap-1 text-xs px-2.5 bg-slate-100"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Excluir pergunta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* LIVE FORM PREVIEW */
        <div className="p-6 bg-slate-50 min-h-[400px]">
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Modo de Teste Interativo
              </div>
              <h3 className="font-headline text-xl font-bold text-slate-900">
                Pesquisa de Empreendedorismo - Pós-Graduação
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Visualização dinâmica de como os alunos e participantes verão este formulário.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPreviewSubmitted(true);
              }}
              className="space-y-5"
            >
              {questions.map((q) => (
                <div key={q.id} className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 font-headline">
                    {q.title}
                    {q.required && <span className="text-rose-600 ml-1">*</span>}
                  </label>

                  {q.description && (
                    <p className="text-[11px] text-slate-500 mb-1">{q.description}</p>
                  )}

                  {q.type === 'text' && (
                    <input
                      type="text"
                      placeholder={q.placeholder || 'Sua resposta...'}
                      value={previewValues[q.key] || ''}
                      onChange={(e) =>
                        setPreviewValues({ ...previewValues, [q.key]: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0070ea] outline-none"
                    />
                  )}

                  {q.type === 'textarea' && (
                    <textarea
                      rows={3}
                      placeholder={q.placeholder || 'Digite em detalhes...'}
                      value={previewValues[q.key] || ''}
                      onChange={(e) =>
                        setPreviewValues({ ...previewValues, [q.key]: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0070ea] outline-none"
                    />
                  )}

                  {q.type === 'select' && (
                    <select
                      value={previewValues[q.key] || ''}
                      onChange={(e) =>
                        setPreviewValues({ ...previewValues, [q.key]: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0070ea] outline-none bg-white"
                    >
                      <option value="">Selecione uma opção...</option>
                      {q.options?.map((opt) => (
                        <option key={opt.id} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {q.type === 'radio' && (
                    <div className="space-y-1.5">
                      {q.options?.map((opt) => (
                        <label
                          key={opt.id}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 border border-slate-100 cursor-pointer text-xs"
                        >
                          <input
                            type="radio"
                            name={`preview_${q.id}`}
                            value={opt.value}
                            checked={previewValues[q.key] === opt.value}
                            onChange={(e) =>
                              setPreviewValues({ ...previewValues, [q.key]: e.target.value })
                            }
                            className="text-[#0070ea]"
                          />
                          <span className="text-slate-700">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === 'checkbox' && (
                    <div className="space-y-1.5">
                      {q.options?.map((opt) => {
                        const currentList: string[] = previewValues[q.key] || [];
                        const isChecked = currentList.includes(opt.value);
                        return (
                          <label
                            key={opt.id}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 border border-slate-100 cursor-pointer text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const nextList = e.target.checked
                                  ? [...currentList, opt.value]
                                  : currentList.filter((v) => v !== opt.value);
                                setPreviewValues({ ...previewValues, [q.key]: nextList });
                              }}
                              className="rounded text-[#0070ea]"
                            />
                            <span className="text-slate-700">{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {q.type === 'scale' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <span>{q.minScaleLabel || 'Mínimo'}</span>
                        <span>{q.maxScaleLabel || 'Máximo'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {Array.from({ length: (q.maxScale || 10) - (q.minScale || 1) + 1 }).map(
                          (_, idx) => {
                            const val = (q.minScale || 1) + idx;
                            const isSelected = previewValues[q.key] === val;
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setPreviewValues({ ...previewValues, [q.key]: val })}
                                className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${
                                  isSelected
                                    ? 'bg-[#0070ea] text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                {val}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewValues({});
                    setPreviewSubmitted(false);
                  }}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Limpar Respostas de Teste
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0070ea] hover:bg-[#0059bb] text-white font-headline font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Testar Envio
                </button>
              </div>
            </form>

            {previewSubmitted && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Envio de Teste Simulado com Sucesso!</span>
                </div>
                <pre className="p-3 bg-white border border-emerald-200 rounded-lg text-[10px] text-slate-800 overflow-x-auto">
                  {JSON.stringify(previewValues, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QUESTION EDITING MODAL / DRAWER */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#0070ea]" />
                <h3 className="font-headline font-bold text-base text-slate-900">
                  {isCreatingNew ? 'Criar Nova Pergunta' : 'Editar Pergunta'}
                </h3>
              </div>
              <button
                onClick={() => setEditingQuestion(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-body">
              {/* TITLE */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Título da Pergunta *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Qual o seu maior objetivo no mercado aquático?"
                  value={editingQuestion.title}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      title: e.target.value,
                      key: editingQuestion.key || e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, ''),
                    })
                  }
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl outline-none focus:border-[#0070ea]"
                />
              </div>

              {/* DESCRIPTION / HELP TEXT */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Texto de Ajuda / Subtítulo (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Selecione a opção que melhor se encaixa no seu perfil."
                  value={editingQuestion.description || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl outline-none focus:border-[#0070ea]"
                />
              </div>

              {/* CATEGORY & TYPE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Categoria / Seção
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Identificação, Perfil, Financeiro..."
                    value={editingQuestion.category}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, category: e.target.value })
                    }
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl outline-none focus:border-[#0070ea]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tipo de Pergunta
                  </label>
                  <select
                    value={editingQuestion.type}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        type: e.target.value as QuestionType,
                      })
                    }
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl outline-none focus:border-[#0070ea] bg-white font-semibold"
                  >
                    <option value="text">Texto Curto</option>
                    <option value="textarea">Texto Longo (Parágrafo)</option>
                    <option value="select">Lista de Seleção (Dropdown)</option>
                    <option value="radio">Escolha Única (Radio)</option>
                    <option value="checkbox">Múltipla Escolha (Checkbox)</option>
                    <option value="scale">Escala Numérica (1-10)</option>
                    <option value="number">Número</option>
                    <option value="date">Data</option>
                  </select>
                </div>
              </div>

              {/* REQUIRED TOGGLE */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk_required"
                  checked={editingQuestion.required}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, required: e.target.checked })
                  }
                  className="rounded text-[#0070ea] w-4 h-4"
                />
                <label htmlFor="chk_required" className="font-bold text-slate-700 cursor-pointer">
                  Campo Obrigatório
                </label>
              </div>

              {/* OPTIONS EDITOR FOR CHOICE TYPES */}
              {['radio', 'checkbox', 'select'].includes(editingQuestion.type) && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-800">
                      Opções da Pergunta ({editingQuestion.options?.length || 0})
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const currentOpts = editingQuestion.options || [];
                        const newOpt: FormQuestionOption = {
                          id: `opt-${Date.now()}`,
                          label: `Nova Opção ${currentOpts.length + 1}`,
                          value: `Nova Opção ${currentOpts.length + 1}`,
                        };
                        setEditingQuestion({
                          ...editingQuestion,
                          options: [...currentOpts, newOpt],
                        });
                      }}
                      className="text-xs text-[#0070ea] font-bold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar Opção
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {editingQuestion.options?.map((opt, optIdx) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold w-4">
                          #{optIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => {
                            const updatedOpts = [...(editingQuestion.options || [])];
                            updatedOpts[optIdx] = {
                              ...opt,
                              label: e.target.value,
                              value: e.target.value,
                            };
                            setEditingQuestion({ ...editingQuestion, options: updatedOpts });
                          }}
                          className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0070ea]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedOpts = (editingQuestion.options || []).filter(
                              (_, i) => i !== optIdx
                            );
                            setEditingQuestion({ ...editingQuestion, options: updatedOpts });
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SCALE CONFIG */}
              {editingQuestion.type === 'scale' && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Valor Mínimo</label>
                    <input
                      type="number"
                      value={editingQuestion.minScale || 1}
                      onChange={(e) =>
                        setEditingQuestion({
                          ...editingQuestion,
                          minScale: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Valor Máximo</label>
                    <input
                      type="number"
                      value={editingQuestion.maxScale || 10}
                      onChange={(e) =>
                        setEditingQuestion({
                          ...editingQuestion,
                          maxScale: parseInt(e.target.value) || 10,
                        })
                      }
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveQuestionForm}
                className="px-5 py-2 rounded-xl bg-[#0070ea] hover:bg-[#0059bb] text-white font-bold shadow-sm"
              >
                Salvar Pergunta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
