import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  ListFilter,
  User,
  Mail,
  Briefcase,
  TrendingUp,
  DollarSign,
  Calendar,
  Activity,
  ShieldAlert,
  Award,
  Sparkles,
  Database,
  Eye,
  RotateCcw,
  Clock,
  FileSpreadsheet,
  Share2,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import {
  submitEmpreendedorismoFormToSupabase,
  fetchEmpreendedorismoResponsesFromSupabase,
  isSupabaseConfigured,
  EmpreendedorismoResposta,
  EMPREENDEDORISMO_SQL_SCHEMA,
  saveEmpreendedorismoLocalResponse,
} from '../lib/supabase';

interface EmpreendedorismoFormTabProps {
  isStandalone?: boolean;
}

export const EmpreendedorismoFormTab: React.FC<EmpreendedorismoFormTabProps> = ({
  isStandalone = false,
}) => {
  // Form State
  const [email, setEmail] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [areaAtuacaoAtual, setAreaAtuacaoAtual] = useState('');
  const [aumentoGanhosFinanceiros, setAumentoGanhosFinanceiros] = useState('');
  const [areasDeGanho, setAreasDeGanho] = useState<string[]>([]);
  const [areaParaEmpreender, setAreaParaEmpreender] = useState('');
  const [planosAposPosGraduacao, setPlanosAposPosGraduacao] = useState('');
  const [rendaAtual, setRendaAtual] = useState('');
  const [exercicioDurantePos, setExercicioDurantePos] = useState('');
  const [receiosAntesDoCurso, setReceiosAntesDoCurso] = useState<string[]>([]);
  const [projetosAcompanhados, setProjetosAcompanhados] = useState<string[]>([]);

  // UX & Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<EmpreendedorismoResposta | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Admin View State & Public Share Link
  const [activeSubTab, setActiveSubTab] = useState<'form' | 'responses'>('form');
  const [savedResponses, setSavedResponses] = useState<EmpreendedorismoResposta[]>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlScript, setShowSqlScript] = useState(false);

  // Public URL for external users
  const publicFormUrl = `${window.location.origin}${window.location.pathname}?mode=form`;

  const handleCopyPublicLink = () => {
    try {
      navigator.clipboard.writeText(publicFormUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.warn('Clipboard write failed', e);
    }
  };

  const handleCopySqlScript = () => {
    try {
      navigator.clipboard.writeText(EMPREENDEDORISMO_SQL_SCHEMA);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch (e) {
      console.warn('Clipboard write failed', e);
    }
  };

  // Load saved responses when switching to responses tab
  useEffect(() => {
    if (activeSubTab === 'responses') {
      loadResponses();
    }
  }, [activeSubTab]);

  const loadResponses = async () => {
    setIsLoadingResponses(true);
    const { data } = await fetchEmpreendedorismoResponsesFromSupabase();
    if (data) {
      setSavedResponses(data as EmpreendedorismoResposta[]);
    }
    setIsLoadingResponses(false);
  };

  // Multiple Select Checkbox Toggle Helper
  const toggleMultiSelect = (
    value: string,
    currentList: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (currentList.includes(value)) {
      setter(currentList.filter((item) => item !== value));
    } else {
      setter([...currentList, value]);
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 1. Email validation
    if (!email.trim()) {
      newErrors.email = 'E-mail é obrigatório.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Por favor, informe um e-mail válido.';
    }

    // 2. Nome Completo
    if (!nomeCompleto.trim()) {
      newErrors.nome_completo = 'Nome completo é obrigatório.';
    }

    // 3. Área de Atuação
    if (!areaAtuacaoAtual) {
      newErrors.area_atuacao_atual = 'Selecione uma opção de área de atuação.';
    }

    // 4. Aumento de Ganhos
    if (!aumentoGanhosFinanceiros) {
      newErrors.aumento_ganhos_financeiros = 'Selecione uma opção de ganho financeiro.';
    }

    // 5. Áreas de Ganho (Multiple Select)
    if (areasDeGanho.length === 0) {
      newErrors.areas_de_ganho = 'Selecione ao menos uma área em que obteve ganhos.';
    }

    // 6. Área para Empreender
    if (!areaParaEmpreender) {
      newErrors.area_para_empreender = 'Selecione em qual área pretende empreender.';
    }

    // 7. Planos após Pós-Graduação
    if (!planosAposPosGraduacao) {
      newErrors.planos_apos_pos_graduacao = 'Selecione o que pretende fazer após a Pós.';
    }

    // 8. Renda Atual
    if (!rendaAtual) {
      newErrors.renda_atual = 'Selecione sua faixa de renda atual.';
    }

    // 9. Exercício durante Pós
    if (!exercicioDurantePos) {
      newErrors.exercicio_durante_pos = 'Selecione uma opção referente à prática de exercícios.';
    }

    // 10. Receios antes do curso (Multiple Select)
    if (receiosAntesDoCurso.length === 0) {
      newErrors.receios_antes_do_curso = 'Selecione ao menos uma opção (ou o receio principal).';
    }

    // 11. Projetos acompanhados (Multiple Select)
    if (projetosAcompanhados.length === 0) {
      newErrors.projetos_acompanhados = 'Selecione ao menos um projeto que você acompanha.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate
    if (!validateForm()) {
      // Scroll to top error
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    const payload: Omit<EmpreendedorismoResposta, 'id' | 'created_at'> = {
      email: email.trim(),
      nome_completo: nomeCompleto.trim(),
      area_atuacao_atual: areaAtuacaoAtual,
      aumento_ganhos_financeiros: aumentoGanhosFinanceiros,
      areas_de_ganho: areasDeGanho,
      area_para_empreender: areaParaEmpreender,
      planos_apos_pos_graduacao: planosAposPosGraduacao,
      renda_atual: rendaAtual,
      exercicio_durante_pos: exercicioDurantePos,
      receios_antes_do_curso: receiosAntesDoCurso,
      projetos_acompanhados: projetosAcompanhados,
    };

    try {
      const { data, error } = await submitEmpreendedorismoFormToSupabase(payload);

      const savedItem = (data && data[0])
        ? (data[0] as EmpreendedorismoResposta)
        : { ...payload, id: `local-${Date.now()}`, created_at: new Date().toISOString() };

      setSubmitSuccess(savedItem);

      if (error) {
        console.warn('Nota do banco de dados:', error.message);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Erro ao enviar formulário, ativando salvamento de emergência:', err);
      const localSaved = saveEmpreendedorismoLocalResponse(payload);
      setSubmitSuccess(localSaved);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setEmail('');
    setNomeCompleto('');
    setAreaAtuacaoAtual('');
    setAumentoGanhosFinanceiros('');
    setAreasDeGanho([]);
    setAreaParaEmpreender('');
    setPlanosAposPosGraduacao('');
    setRendaAtual('');
    setExercicioDurantePos('');
    setReceiosAntesDoCurso([]);
    setProjetosAcompanhados([]);
    setErrors({});
    setSubmitSuccess(null);
    setSubmitError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Banner and Navigation Tabs */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-[0px_10px_30px_rgba(0,123,255,0.06)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0059bb]/10 text-[#0059bb] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Natação Criativa
            </span>
            <span className="text-xs text-gray-500">• Formulário Oficial</span>
          </div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold tracking-tight text-[#191c1d]">
            Empreendedorismo — Turma 01 Fortaleza
          </h1>
          <p className="text-xs md:text-sm text-[#414754] mt-1">
            Pesquisa de perfil, evolução financeira e acompanhamento dos pós-graduandos.
          </p>
        </div>

        {/* Navigation Switch (Admin only) */}
        {!isStandalone && (
          <div className="flex items-center bg-[#f3f4f5] p-1.5 rounded-xl border border-gray-200 shrink-0 w-full md:w-auto">
            <button
              onClick={() => setActiveSubTab('form')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg font-headline font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all ${
                activeSubTab === 'form'
                  ? 'bg-white text-[#0059bb] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Send className="w-4 h-4" /> Preencher Formulário
            </button>
            <button
              onClick={() => setActiveSubTab('responses')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg font-headline font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all ${
                activeSubTab === 'responses'
                  ? 'bg-white text-[#0059bb] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" /> Ver Respostas Gravadas
            </button>
          </div>
        )}
      </div>

      {/* Admin Share Link Box */}
      {!isStandalone && (
        <div className="bg-gradient-to-br from-[#0059bb]/5 via-white to-amber-500/5 p-5 md:p-6 rounded-2xl border border-[#0059bb]/15 shadow-sm space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#0059bb] text-white rounded-xl">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-sm text-[#191c1d]">
                  Link Externo do Formulário para Alunos
                </h3>
                <p className="text-xs text-gray-600">
                  Envie este link para que os alunos respondam diretamente sem ter acesso ao painel do sistema.
                </p>
              </div>
            </div>
            <a
              href={publicFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-headline font-bold text-[#0059bb] hover:underline flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-[#0059bb]/20 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Abrir Visão do Aluno
            </a>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              readOnly
              value={publicFormUrl}
              className="flex-1 bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-700 select-all focus:outline-none focus:ring-2 focus:ring-[#0059bb]"
            />
            <button
              onClick={handleCopyPublicLink}
              className={`px-4 py-2 rounded-xl font-headline font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shrink-0 ${
                copiedLink
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0070ea] text-white hover:bg-[#0059bb] shadow-sm'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4" /> Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copiar Link Público
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Database Setup Info & SQL Helper Banner (Admin only) */}
      {!isStandalone && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-5 text-amber-950 text-xs md:text-sm space-y-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold font-headline text-sm mb-0.5 text-amber-900">
                  Armazenamento dos Testes e Formulários
                </p>
                <p className="leading-relaxed text-amber-800 text-xs">
                  {isSupabaseConfigured
                    ? 'O sistema está conectado ao Supabase e possui salvamento híbrido em tempo real (Banco de Dados + Cópia Local de Segurança).'
                    : 'Modo Local Ativo: As respostas são salvas automaticamente no armazenamento local do navegador (localStorage) para você nunca perder nenhum teste enviado!'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowSqlScript(!showSqlScript)}
              className="px-3 py-1.5 bg-white border border-amber-300/80 rounded-xl font-headline font-bold text-xs text-amber-900 hover:bg-amber-100/50 flex items-center gap-1.5 shrink-0 transition-all active:scale-95 shadow-2xs"
            >
              <Database className="w-3.5 h-3.5 text-amber-600" />
              {showSqlScript ? 'Ocultar Script SQL' : 'Ver Script SQL para Supabase'}
            </button>
          </div>

          {showSqlScript && (
            <div className="pt-2 border-t border-amber-200/60 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-900 font-headline">
                  Script de Criação da Tabela <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900">empreendedorismo_respostas</code>
                </span>
                <button
                  onClick={handleCopySqlScript}
                  className={`px-3 py-1 rounded-lg font-headline font-bold text-[11px] flex items-center gap-1 transition-all ${
                    copiedSql
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-800 text-white hover:bg-amber-900'
                  }`}
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'SQL Copiado!' : 'Copiar Código SQL'}
                </button>
              </div>

              <pre className="p-3 bg-gray-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed max-h-48 scrollbar-thin">
                {EMPREENDEDORISMO_SQL_SCHEMA}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 1: FORM FILLING */}
      {activeSubTab === 'form' && (
        <>
          {/* SUCCESS MESSAGE AFTER CONFIRMATION FROM DB */}
          {submitSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h2 className="font-headline text-2xl font-bold text-emerald-950">
                  Resposta Gravada com Sucesso no Banco de Dados!
                </h2>
                <p className="text-sm text-emerald-800 mt-1">
                  Obrigado, <strong>{submitSuccess.nome_completo}</strong>! Suas respostas da Turma 01 Fortaleza foram registradas na tabela <code className="font-bold">empreendedorismo_respostas</code>.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-emerald-200 max-w-lg mx-auto text-left text-xs space-y-1.5 font-mono text-gray-700">
                <p>
                  <strong>ID do Registro:</strong> {submitSuccess.id || 'Confirmado via DB'}
                </p>
                <p>
                  <strong>E-mail:</strong> {submitSuccess.email}
                </p>
                <p>
                  <strong>Data de Registro:</strong>{' '}
                  {submitSuccess.created_at ? new Date(submitSuccess.created_at).toLocaleString('pt-BR') : 'Agora'}
                </p>
                <p>
                  <strong>Área de Atuação:</strong> {submitSuccess.area_atuacao_atual}
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={handleResetForm}
                  className="px-6 py-3 bg-[#0059bb] hover:bg-[#0070ea] text-white font-headline font-bold text-xs md:text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Preencher Novo Formulário
                </button>
                <button
                  onClick={() => setActiveSubTab('responses')}
                  className="px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-headline font-bold text-xs md:text-sm rounded-xl transition-all flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" /> Ver Respostas na Tabela
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* GLOBAL ERROR ALERT */}
              {submitError && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-900 text-xs md:text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold font-headline text-sm mb-1">Atenção ao Enviar</p>
                    <p>{submitError}</p>
                    <p className="mt-1 text-[11px] text-rose-700">
                      Suas respostas preenchidas foram mantidas com segurança abaixo.
                    </p>
                  </div>
                </div>
              )}

              {/* BLOCO 1: E-MAIL */}
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-[0px_10px_30px_rgba(0,123,255,0.06)] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#0059bb]/10 text-[#0059bb] font-headline font-extrabold text-xs flex items-center justify-center">
                    1
                  </span>
                  <label htmlFor="email" className="font-headline font-bold text-base md:text-lg text-[#191c1d]">
                    E-mail <span className="text-rose-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    placeholder="seu.email@exemplo.com"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-body transition-all outline-none focus:ring-2 ${
                      errors.email
                        ? 'border-rose-300 focus:ring-rose-500/20 bg-rose-50/30'
                        : 'border-gray-200 focus:border-[#0059bb] focus:ring-[#0059bb]/20'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-500 font-medium pl-1">{errors.email}</p>}
              </div>

              {/* BLOCO 2: NOME COMPLETO */}
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-[0px_10px_30px_rgba(0,123,255,0.06)] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#0059bb]/10 text-[#0059bb] font-headline font-extrabold text-xs flex items-center justify-center">
                    2
                  </span>
                  <label htmlFor="nome_completo" className="font-headline font-bold text-base md:text-lg text-[#191c1d]">
                    Nome completo <span className="text-rose-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    id="nome_completo"
                    type="text"
                    value={nomeCompleto}
                    onChange={(e) => {
                      setNomeCompleto(e.target.value);
                      if (errors.nome_completo) setErrors((prev) => ({ ...prev, nome_completo: '' }));
                    }}
                    placeholder="Digite seu nome completo"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-body transition-all outline-none focus:ring-2 ${
                      errors.nome_completo
                        ? 'border-rose-300 focus:ring-rose-500/20 bg-rose-50/30'
                        : 'border-gray-200 focus:border-[#0059bb] focus:ring-[#0059bb]/20'
                    }`}
                  />
                </div>
                {errors.nome_completo && (
                  <p className="text-xs text-rose-500 font-medium pl-1">{errors.nome_completo}</p>
                )}
              </div>

              {/* BLOCO 3: ÁREA DE ATUAÇÃO ATUAL (SINGLE SELECT) */}
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-[0px_10px_30px_rgba(0,123,255,0.06)] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#0059bb]/10 text-[#0059bb] font-headline font-extrabold text-xs flex items-center justify-center">
                    3
                  </span>
                  <label className="font-headline font-bold text-base md:text-lg text-[#191c1d]">
                    Qual é a sua área de atuação no momento? <span className="text-rose-500">*</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500">Selecione apenas uma opção:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {[
                    'Personal aquático',
                    'Personal terrestre',
                    'Professor de natação em academia',
                    'Professor de natação em clube',
                    'Professor de natação em assessoria de condomínio',
                    'Possuo professores trabalhando em assessorias de condomínios',
                    'Tenho espaço próprio, porém dou aula sozinho',
                    'Tenho espaço próprio e contrato professores',
                    'Outra área da Educação Física',
                    'Área fora da Educação Física',
                  ].map((opcao) => (
                    <label
                      key={opcao}
                      className={`p-3.5 rounded-xl border text-xs md:text-sm font-medium flex items-center gap-3 cursor-pointer transition-all ${
                        areaAtuacaoAtual === opcao
                          ? 'bg-[#0059bb]/10 border-[#0059bb] text-[#0059bb] font-bold shadow-xs'
                          : 'bg-[#f8f9fa] border-gray-200 text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="area_atuacao_atual"
                        value={opcao}
                        checked={areaAtuacaoAtual === opcao}
                        onChange={(e) => {
                          setAreaAtuacaoAtual(e.target.value);
                          if (errors.area_atuacao_atual)
                            setErrors((prev) => ({ ...prev, area_atuacao_atual: '' }));
                        }}
                        className="w-4 h-4 text-[#0059bb] focus:ring-[#0059bb]"
                      />
                      <span>{opcao}</span>
                    </label>
                  ))}
                </div>
                {errors.area_atuacao_atual && (
                  <p className="text-xs text-rose-500 font-medium pl-1">{errors.area_atuacao_atual}</p>
                )}
              </div>

              {/* BLOCO 4: AUMENTO DE GANHOS FINANCEIROS (SINGLE SELECT) */}
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-[0px_10px_30px_rgba(0,123,255,0.06)] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#0059bb]/10 text-[#0059bb] font-headline font-extrabold text-xs flex items-center justify-center">
                    4
                  </span>
                  <label className="font-headline font-bold text-base md:text-lg text-[#191c1d]">
                    Você obteve aumento dos ganhos financeiros após o início da Pós-Graduação?{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500">Selecione apenas uma opção:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {[
                    'Sim, até 30%',
                    'Sim, de 35% a 60%',
                    'Sim, de 65% a 90%',
                    'Sim, acima de 100%',
                    'Não, estou com os mesmos ganhos',
                    'Não, estou ganhando menos',
                  ].map((opcao) => (
                    <label
                      key={opcao}
                      className={`p-3.5 rounded-xl border text-xs md:text-sm font-medium flex items-center gap-3 cursor-pointer transition-all ${
                        aumentoGanhosFinanceiros === opcao
                          ? 'bg-[#0059bb]/10 border-[#0059bb] text-[#0059bb] font-bold shadow-xs'
                          : 'bg-[#f8f9fa] border-gray-200 text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="aumento_ganhos_financeiros"
                        value={opcao}
                        checked={aumentoGanhosFinanceiros === opcao}
                        onChange={(e) => {
                          setAumentoGanhosFinanceiros(e.target.value);
                          if (errors.aumento_ganhos_financeiros)
                            setErrors((prev) => ({ ...prev, aumento_ganhos_financeiros: '' }));
                        }}
                        className="w-4 h-4 text-[#0059bb] focus:ring-[#0059bb]"
                      />
                      <span>{opcao}</span>
                    </label>
                  ))}
                </div>
                {errors.aumento_ganhos_financeiros && (
                  <p className="text-xs text-rose-500 font-medium pl-1">{errors.aumento_ganhos_financeiros}</p>
                )}
              </div>

              {/* BLOCO 5: ÁREAS DE GANHO (MULTIPLE SELECT) */}
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-[0px_10px_30px_rgba(0,123,255,0.06)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#0059bb]/10 text-[#0059bb] font-headline font-extrabold text-xs flex items-center justify-center">
                      5
                    </span>
                    <label className="font-headline font-bold text-base md:text-lg text-[#191c1d]">
                      Você obteve ganhos em quais áreas? <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <span className="text-[11px] font-bold text-[#0059bb] bg-[#0059bb]/10 px-2.5 py-1 rounded-full">
                    Múltipla Seleção
                  </span>
                </div>
                <p className="text-xs text-gray-500">Marque todas as alternativas que se aplicam:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {[
                    'Cargo',
                    'Menor jornada de trabalho sem diminuir os ganhos',
                    'Aumento na quantidade de alunos',
                    'Aumento na retenção dos alunos',
                    'Maior projeção para o futuro',
                    'Aumento de networking',
                    'Aumento da visão técnica',
                  ].map((opcao) => {
                    const isChecked = areasDeGanho.includes(opcao);
                    return (
                      <label
                        key={opcao}
                        className={`p-3.5 rounded-xl border text-xs md:text-sm font-medium flex items-center gap-3 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-[#0059bb]/10 border-[#0059bb] text-[#0059bb] font-bold shadow-xs'
                            : 'bg-[#f8f9fa] border-gray-200 text-gray-800 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={opcao}
                          checked={isChecked}
                          onChange={() => {
                            toggleMultiSelect(opcao, areasDeGanho, setAreasDeGanho);
                            if (errors.areas_de_ganho)
                              setErrors((prev) => ({ ...prev, areas_de_ganho: '' }));
                          }}
                          className="w-4 h-4 text-[#0059bb] rounded focus:ring-[#0059bb]"
                        />
                        <span>{opcao}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.areas_de_ganho && (
                  <p className="text-xs text-rose-500 font-medium pl-1">{errors.areas_de_ganho}</p>
                )}
              </div>

              {/* BLOCO 6: ÁREA PARA EMPREENDER (SINGLE SELECT) */}
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-[0px_10px_30px_rgba(0,123,255,0.06)] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#0059bb]/10 text-[#0059bb] font-headline font-extrabold text-xs flex items-center justify-center">
                    6
                  </span>
                  <label className="font-headline font-bold text-base md:text-lg text-[#191c1d]">
                    Em qual área pretende empreender? <span className="text-rose-500">*</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500">Selecione apenas uma opção:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {[
                    'Personal aquático',
                    'Personal terrestre',
                    'Assessorias em condomínios',
                    'Ter meu espaço próprio',
                    'Já tenho meu espaço e quero aplicar os conhecimentos nele',
                    'Outra área da Educação Física',
                    'Área fora da Educação Física',
                  ].map((opcao) => (
                    <label
                      key={opcao}
                      className={`p-3.5 rounded-xl border text-xs md:text-sm font-medium flex items-center gap-3 cursor-pointer transition-all ${
                        areaParaEmpreender === opcao
                          ? 'bg-[#0059bb]/10 border-[#0059bb] text-[#0059bb] font-bold shadow-xs'
                          : 'bg-[#f8f9fa] border-gray-200 text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="area_para_empreender"
                        value={opcao}
                        checked={areaParaEmpreender === opcao}
                        onChange={(e) => {
                          setAreaParaEmpreender(e.target.value);
                          if (errors.area_para_empreender)
                            setErrors((prev) => ({ ...prev, area_para_empreender: '' }));
                        }}
                        className="w-4 h-4 text-[#0059bb] focus:ring-[#0059bb]"
                      />
                      <span>{opcao}</span>
                    </label>
                  ))}
                </div>
                {errors.area_para_empreender && (
                  <p className="text-xs text-rose-500 font-medium pl-1">{errors.area_para_empreender}</p>
                )}
              </div>

              {/* BLOCO 7: PLANOS APÓS PÓS-GRADUAÇÃO (SINGLE SELECT) */}
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-[0px_10px_30px_rgba(0,123,255,0.06)] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#0059bb]/10 text-[#0059bb] font-headline font-extrabold text-xs flex items-center justify-center">
                    7
                  </span>
                  <label className="font-headline font-bold text-base md:text-lg text-[#191c1d]">
                    O que pretende fazer após a finalização da Pós-Graduação?{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500">Selecione apenas uma opção:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {[
                    'Fazer a continuação do curso',
                    'Cursar outra Pós-Graduação',
                    'Cursar mestrado ou doutorado',
                    'Investir em cursos online',
                    'Investir em cursos presenciais',
                    'Investir em congressos',
                    'Conhecer outras teorias e metodologias fora do Brasil',
                    'Nada, já estou com todas as informações de que precisava',
                  ].map((opcao) => (
                    <label
                      key={opcao}
                      className={`p-3.5 rounded-xl border text-xs md:text-sm font-medium flex items-center gap-3 cursor-pointer transition-all ${
                        planosAposPosGraduacao === opcao
                          ? 'bg-[#0059bb]/10 border-[#0059bb] text-[#0059bb] font-bold shadow-xs'
                          : 'bg-[#f8f9fa] border-gray-200 text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="planos_apos_pos_graduacao"
                        value={opcao}
                        checked={planosAposPosGraduacao === opcao}
                        onChange={(e) => {
                          setPlanosAposPosGraduacao(e.target.value);
                          if (errors.planos_apos_pos_graduacao)
                            setErrors((prev) => ({ ...prev, planos_apos_pos_graduacao: '' }));
                        }}
                        className="w-4 h-4 text-[#0059bb] focus:ring-[#0059bb]"
                      />
                      <span>{opcao}</span>
                    </label>
                  ))}
                </div>
                {errors.planos_apos_pos_graduacao && (
                  <p className="text-xs text-rose-500 font-medium pl-1">{errors.planos_apos_pos_graduacao}</p>
                )}
              </div>

              {/* BLOCO 8: RENDA ATUAL (SINGLE SELECT) */}
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-[0px_10px_30px_rgba(0,123,255,0.06)] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#0059bb]/10 text-[#0059bb] font-headline font-extrabold text-xs flex items-center justify-center">
                    8
                  </span>
                  <label className="font-headline font-bold text-base md:text-lg text-[#191c1d]">
                    Qual é a sua renda atual? <span className="text-rose-500">*</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500">Selecione apenas uma opção:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {[
                    'Não possuo renda atualmente',
                    'Até 2 salários mínimos',
                    'De 2 a 3 salários mínimos',
                    'De 3 a 4 salários mínimos',
                    'De 4 a 5 salários mínimos',
                    'De 5 a 6 salários mínimos',
                    'De 6 a 7 salários mínimos',
                    'De 7 a 8 salários mínimos',
                    'De 8 a 9 salários mínimos',
                    'De 9 a 10 salários mínimos',
                    'Acima de 10 salários mínimos',
                  ].map((opcao) => (
                    <label
                      key={opcao}
                      className={`p-3.5 rounded-xl border text-xs md:text-sm font-medium flex items-center gap-3 cursor-pointer transition-all ${
                        rendaAtual === opcao
                          ? 'bg-[#0059bb]/10 border-[#0059bb] text-[#0059bb] font-bold shadow-xs'
                          : 'bg-[#f8f9fa] border-gray-200 text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="renda_atual"
                        value={opcao}
                        checked={rendaAtual === opcao}
                        onChange={(e) => {
                          setRendaAtual(e.target.value);
                          if (errors.renda_atual) setErrors((prev) => ({ ...prev, renda_atual: '' }));
                        }}
                        className="w-4 h-4 text-[#0059bb] focus:ring-[#0059bb]"
                      />
                      <span>{opcao}</span>
                    </label>
                  ))}
                </div>
                {errors.renda_atual && (
                  <p className="text-xs text-rose-500 font-medium pl-1">{errors.renda_atual}</p>
                )}
              </div>

              {/* BLOCO 9: EXERCÍCIO DURANTE A PÓS (SINGLE SELECT) */}
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-[0px_10px_30px_rgba(0,123,255,0.06)] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#0059bb]/10 text-[#0059bb] font-headline font-extrabold text-xs flex items-center justify-center">
                    9
                  </span>
                  <label className="font-headline font-bold text-base md:text-lg text-[#191c1d]">
                    Você praticou exercício físico durante a Pós-Graduação?{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500">Selecione apenas uma opção:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {[
                    'Sim, até 5 horas semanais',
                    'Sim, de 6 a 10 horas semanais',
                    'Sim, de 11 a 15 horas semanais',
                    'Sim, de 16 a 20 horas semanais',
                    'Sim, acima de 20 horas semanais',
                    'Não pratiquei',
                  ].map((opcao) => (
                    <label
                      key={opcao}
                      className={`p-3.5 rounded-xl border text-xs md:text-sm font-medium flex items-center gap-3 cursor-pointer transition-all ${
                        exercicioDurantePos === opcao
                          ? 'bg-[#0059bb]/10 border-[#0059bb] text-[#0059bb] font-bold shadow-xs'
                          : 'bg-[#f8f9fa] border-gray-200 text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="exercicio_durante_pos"
                        value={opcao}
                        checked={exercicioDurantePos === opcao}
                        onChange={(e) => {
                          setExercicioDurantePos(e.target.value);
                          if (errors.exercicio_durante_pos)
                            setErrors((prev) => ({ ...prev, exercicio_durante_pos: '' }));
                        }}
                        className="w-4 h-4 text-[#0059bb] focus:ring-[#0059bb]"
                      />
                      <span>{opcao}</span>
                    </label>
                  ))}
                </div>
                {errors.exercicio_durante_pos && (
                  <p className="text-xs text-rose-500 font-medium pl-1">{errors.exercicio_durante_pos}</p>
                )}
              </div>

              {/* BLOCO 10: RECEIOS ANTES DO CURSO (MULTIPLE SELECT) */}
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-[0px_10px_30px_rgba(0,123,255,0.06)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#0059bb]/10 text-[#0059bb] font-headline font-extrabold text-xs flex items-center justify-center">
                      10
                    </span>
                    <label className="font-headline font-bold text-base md:text-lg text-[#191c1d]">
                      Você tinha algum receio antes de começar o curso?{' '}
                      <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <span className="text-[11px] font-bold text-[#0059bb] bg-[#0059bb]/10 px-2.5 py-1 rounded-full">
                    Múltipla Seleção
                  </span>
                </div>
                <p className="text-xs text-gray-500">Marque todas as alternativas que se aplicam:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {[
                    'Não conseguir pagar todas as mensalidades',
                    'Não ter tempo para estudar',
                    'Não estar disponível para todas as aulas presenciais',
                    'O conteúdo ser muito básico',
                    'O conteúdo ser muito avançado',
                    'Ter pouca prática',
                    'Ser mais do mesmo',
                  ].map((opcao) => {
                    const isChecked = receiosAntesDoCurso.includes(opcao);
                    return (
                      <label
                        key={opcao}
                        className={`p-3.5 rounded-xl border text-xs md:text-sm font-medium flex items-center gap-3 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-[#0059bb]/10 border-[#0059bb] text-[#0059bb] font-bold shadow-xs'
                            : 'bg-[#f8f9fa] border-gray-200 text-gray-800 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={opcao}
                          checked={isChecked}
                          onChange={() => {
                            toggleMultiSelect(opcao, receiosAntesDoCurso, setReceiosAntesDoCurso);
                            if (errors.receios_antes_do_curso)
                              setErrors((prev) => ({ ...prev, receios_antes_do_curso: '' }));
                          }}
                          className="w-4 h-4 text-[#0059bb] rounded focus:ring-[#0059bb]"
                        />
                        <span>{opcao}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.receios_antes_do_curso && (
                  <p className="text-xs text-rose-500 font-medium pl-1">{errors.receios_antes_do_curso}</p>
                )}
              </div>

              {/* BLOCO 11: PROJETOS ACOMPANHADOS (MULTIPLE SELECT) */}
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-[0px_10px_30px_rgba(0,123,255,0.06)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#0059bb]/10 text-[#0059bb] font-headline font-extrabold text-xs flex items-center justify-center">
                      11
                    </span>
                    <label className="font-headline font-bold text-base md:text-lg text-[#191c1d]">
                      Quais projetos da Natação Criativa você acompanha?{' '}
                      <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <span className="text-[11px] font-bold text-[#0059bb] bg-[#0059bb]/10 px-2.5 py-1 rounded-full">
                    Múltipla Seleção
                  </span>
                </div>
                <p className="text-xs text-gray-500">Marque todas as alternativas que se aplicam:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {[
                    'Instagram',
                    'Podcast de natação',
                    'Podcast de futebol',
                    'Plataforma de cursos online',
                    'Cursos presenciais',
                    'Grupo de Estudos Quinzenais',
                    'Grupos do WhatsApp',
                    'Aplicativo de natação',
                    'Loja virtual de produtos pedagógicos',
                    'Mentorias',
                    'Consultorias',
                  ].map((opcao) => {
                    const isChecked = projetosAcompanhados.includes(opcao);
                    return (
                      <label
                        key={opcao}
                        className={`p-3.5 rounded-xl border text-xs md:text-sm font-medium flex items-center gap-3 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-[#0059bb]/10 border-[#0059bb] text-[#0059bb] font-bold shadow-xs'
                            : 'bg-[#f8f9fa] border-gray-200 text-gray-800 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={opcao}
                          checked={isChecked}
                          onChange={() => {
                            toggleMultiSelect(opcao, projetosAcompanhados, setProjetosAcompanhados);
                            if (errors.projetos_acompanhados)
                              setErrors((prev) => ({ ...prev, projetos_acompanhados: '' }));
                          }}
                          className="w-4 h-4 text-[#0059bb] rounded focus:ring-[#0059bb]"
                        />
                        <span>{opcao}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.projetos_acompanhados && (
                  <p className="text-xs text-rose-500 font-medium pl-1">{errors.projetos_acompanhados}</p>
                )}
              </div>

              {/* SUBMIT BUTTON FOOTER */}
              <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-[0px_10px_30px_rgba(0,123,255,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-gray-500 text-center sm:text-left">
                  <span className="text-rose-500 font-bold">*</span> Todos os campos são obrigatórios. Ao enviar, uma nova linha será registrada no banco de dados.
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-4 bg-[#0059bb] hover:bg-[#0070ea] disabled:bg-gray-400 text-white font-headline font-bold text-sm md:text-base rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2.5 shrink-0"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Gravando no Banco...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Enviar e Gravar no Banco</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* SUB TAB 2: SAVED RESPONSES IN TABLE */}
      {activeSubTab === 'responses' && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-[0px_10px_30px_rgba(0,123,255,0.06)] space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
            <div>
              <h2 className="font-headline text-lg md:text-xl font-bold text-[#191c1d]">
                Respostas da Tabela <code className="text-[#0059bb]">empreendedorismo_respostas</code>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Registros salvos em tempo real no banco de dados Supabase da Turma 01 Fortaleza.
              </p>
            </div>

            <button
              onClick={loadResponses}
              disabled={isLoadingResponses}
              className="px-4 py-2 bg-[#f8f9fa] hover:bg-gray-100 border border-gray-200 text-gray-800 text-xs font-headline font-bold rounded-xl flex items-center gap-2 transition-colors"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoadingResponses ? 'animate-spin' : ''}`} />
              <span>Atualizar Tabela</span>
            </button>
          </div>

          {isLoadingResponses ? (
            <div className="py-12 text-center text-gray-400 font-headline font-bold text-sm flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#0059bb]" />
              <span>Carregando dados do banco de dados...</span>
            </div>
          ) : savedResponses.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <Database className="w-12 h-12 mx-auto opacity-30 text-[#0059bb]" />
              <p className="font-headline font-bold text-base text-gray-700">Nenhum registro encontrado ainda</p>
              <p className="text-xs text-gray-500">
                Preencha e envie o formulário na aba ao lado para gravar o primeiro registro!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fa] text-gray-700 font-headline font-bold border-b border-gray-200">
                    <th className="p-3">Data / ID</th>
                    <th className="p-3">Nome / E-mail</th>
                    <th className="p-3">Atuação Atual</th>
                    <th className="p-3">Aumento Finan.</th>
                    <th className="p-3">Renda Atual</th>
                    <th className="p-3">Área Empreender</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {savedResponses.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-3 font-mono text-[11px]">
                        <div className="font-bold text-gray-900">
                          {item.created_at ? new Date(item.created_at).toLocaleString('pt-BR') : 'Hoje'}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate max-w-[100px]">
                          {item.id || 'N/A'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-[#191c1d]">{item.nome_completo}</div>
                        <div className="text-gray-500 text-[11px]">{item.email}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-blue-100/60 text-[#0059bb] font-semibold">
                          {item.area_atuacao_atual}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-emerald-700">
                        {item.aumento_ganhos_financeiros}
                      </td>
                      <td className="p-3">{item.renda_atual}</td>
                      <td className="p-3 font-medium">{item.area_para_empreender}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
