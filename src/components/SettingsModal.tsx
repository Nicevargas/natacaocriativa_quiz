import React, { useState, useEffect } from 'react';
import { X, Settings, Database, Sliders, Shield, Save, Check, Key, RefreshCw, AlertCircle, Copy, CheckCircle2, Send, Zap } from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  testSupabaseConnection,
  EMPREENDEDORISMO_SQL_SCHEMA,
} from '../lib/supabase';
import {
  getHubspotToken,
  saveHubspotToken,
  testHubspotConnection,
  sendTestContactToHubspot,
} from '../lib/hubspot';
import { IntegrationDiagnostic } from './IntegrationDiagnostic';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const initialCreds = getSupabaseCredentials();
  const initialHubspotToken = getHubspotToken();

  const [methodologyName, setMethodologyName] = useState('Natação Criativa');
  const [passingScore, setPassingScore] = useState(80);
  const [autoEmail, setAutoEmail] = useState(true);
  const [supabaseUrl, setSupabaseUrl] = useState(initialCreds.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(initialCreds.key);
  const [hubspotToken, setHubspotToken] = useState(initialHubspotToken);

  const [isSaved, setIsSaved] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; code?: string } | null>(null);

  const [isTestingHubspot, setIsTestingHubspot] = useState(false);
  const [hubspotTestResult, setHubspotTestResult] = useState<{ success: boolean; message: string; totalContacts?: number } | null>(null);

  const [isSendingTestContact, setIsSendingTestContact] = useState(false);
  const [hubspotContactResult, setHubspotContactResult] = useState<{ success: boolean; message: string; contactId?: string } | null>(null);

  const [copiedSql, setCopiedSql] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'config' | 'diagnostic'>('config');

  useEffect(() => {
    const creds = getSupabaseCredentials();
    setSupabaseUrl(creds.url);
    setSupabaseAnonKey(creds.key);
    setHubspotToken(getHubspotToken());
  }, [isOpen]);

  const handleSave = () => {
    saveSupabaseCredentials(supabaseUrl, supabaseAnonKey);
    saveHubspotToken(hubspotToken);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
      window.location.reload();
    }, 1000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    saveSupabaseCredentials(supabaseUrl, supabaseAnonKey);
    const res = await testSupabaseConnection();
    setTestResult(res);
    setIsTesting(false);
  };

  const handleTestHubspot = async () => {
    setIsTestingHubspot(true);
    setHubspotTestResult(null);
    setHubspotContactResult(null);
    saveHubspotToken(hubspotToken);
    const res = await testHubspotConnection(hubspotToken);
    setHubspotTestResult(res);
    setIsTestingHubspot(false);
  };

  const handleSendTestContact = async () => {
    setIsSendingTestContact(true);
    setHubspotContactResult(null);
    saveHubspotToken(hubspotToken);
    const res = await sendTestContactToHubspot({
      email: `teste.natacao.${Date.now()}@exemplo.com`,
      firstname: 'Teste Natação Criativa',
      phone: '(85) 99999-8888',
    });
    setHubspotContactResult(res);
    setIsSendingTestContact(false);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(EMPREENDEDORISMO_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className={`bg-white rounded-2xl w-full p-6 shadow-2xl border border-gray-100 my-8 animate-in fade-in zoom-in duration-200 transition-all ${
        activeModalTab === 'diagnostic' ? 'max-w-4xl' : 'max-w-xl'
      }`}>
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#0059bb]" />
            <h2 className="font-headline font-bold text-lg text-[#191c1d]">Configurações da Plataforma</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex border-b border-gray-200 mt-3">
          <button
            onClick={() => setActiveModalTab('config')}
            className={`px-4 py-2.5 font-headline font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeModalTab === 'config'
                ? 'border-[#0059bb] text-[#0059bb]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Conexões e Chaves</span>
          </button>

          <button
            onClick={() => setActiveModalTab('diagnostic')}
            className={`px-4 py-2.5 font-headline font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeModalTab === 'diagnostic'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Zap className="w-4 h-4 text-orange-600" />
            <span>Diagnóstico de Integração (Supabase &amp; HubSpot)</span>
          </button>
        </div>

        {activeModalTab === 'diagnostic' ? (
          <div className="py-4">
            <IntegrationDiagnostic />
          </div>
        ) : (
          <div className="space-y-5 py-4 text-xs font-body">
          {/* SUPABASE CONNECTION SECTION */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#0059bb]" />
                <h3 className="font-headline font-bold text-slate-900 text-sm">Conexão Supabase Database</h3>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  supabaseUrl && supabaseAnonKey
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {supabaseUrl && supabaseAnonKey ? 'Configurado' : 'Não Configurado'}
              </span>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">URL do Projeto Supabase (VITE_SUPABASE_URL)</label>
              <input
                type="text"
                placeholder="https://seu-projeto.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full bg-white p-2.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0059bb] font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Chave Anônima Supabase (VITE_SUPABASE_ANON_KEY)</label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full bg-white p-2.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0059bb] font-mono"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !supabaseUrl || !supabaseAnonKey}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold rounded-lg transition-all flex items-center gap-1.5 text-xs"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                <span>Testar Conexão com a Tabela</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg text-xs border ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border-rose-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                  <span>{testResult.message}</span>
                </div>
                {testResult.code === '42P01' && (
                  <p className="mt-1 text-[11px] text-rose-800">
                    A tabela ainda não existe no seu projeto Supabase. Copie o script SQL abaixo e execute no SQL Editor do Supabase.
                  </p>
                )}
              </div>
            )}

            {/* SQL CODE SNIPPET HELPER */}
            <div className="pt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gray-700 text-[11px]">Script SQL para criar a Tabela e RLS no Supabase:</span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="text-[11px] text-[#0059bb] hover:underline font-bold flex items-center gap-1"
                >
                  {copiedSql ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSql ? 'Copiado!' : 'Copiar SQL'}</span>
                </button>
              </div>
              <pre className="bg-slate-900 text-slate-200 p-2.5 rounded-lg text-[10px] font-mono overflow-x-auto max-h-32 leading-relaxed">
                {EMPREENDEDORISMO_SQL_SCHEMA}
              </pre>
            </div>
          </div>

          {/* HUBSPOT CONNECTION SECTION */}
          <div className="p-4 bg-orange-50/70 rounded-xl border border-orange-200 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-600" />
                <h3 className="font-headline font-bold text-orange-950 text-sm">Integração com HubSpot CRM</h3>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  hubspotToken
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-orange-100 text-orange-800 border-orange-300'
                }`}
              >
                {hubspotToken ? 'Token Salvo' : 'Não Configurado'}
              </span>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Token de Aplicativo Privado do HubSpot (VITE_HUBSPOT_API_KEY)
              </label>
              <input
                type="password"
                placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={hubspotToken}
                onChange={(e) => setHubspotToken(e.target.value)}
                className="w-full bg-white p-2.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Obtenha em: <strong>HubSpot &gt; Configurações &gt; Integrações &gt; Aplicativos Privados</strong> (Private Apps).
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestHubspot}
                disabled={isTestingHubspot || !hubspotToken}
                className="px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold rounded-lg transition-all flex items-center gap-1.5 text-xs shadow-xs"
              >
                {isTestingHubspot ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Testar Token com HubSpot</span>
              </button>

              <button
                type="button"
                onClick={handleSendTestContact}
                disabled={isSendingTestContact || !hubspotToken}
                className="px-3 py-2 bg-white border border-orange-300 hover:bg-orange-100/50 disabled:opacity-50 text-orange-900 font-bold rounded-lg transition-all flex items-center gap-1.5 text-xs"
              >
                {isSendingTestContact ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-orange-600" />}
                <span>Enviar Contato de Teste</span>
              </button>
            </div>

            {hubspotTestResult && (
              <div
                className={`p-3 rounded-lg text-xs border ${
                  hubspotTestResult.success
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border-rose-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  {hubspotTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                  <span>{hubspotTestResult.message}</span>
                </div>
              </div>
            )}

            {hubspotContactResult && (
              <div
                className={`p-3 rounded-lg text-xs border ${
                  hubspotContactResult.success
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border-rose-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  {hubspotContactResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                  <span>{hubspotContactResult.message}</span>
                </div>
                {hubspotContactResult.contactId && (
                  <p className="text-[10px] font-mono text-emerald-800">
                    ID do Contato no HubSpot CRM: {hubspotContactResult.contactId}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Nome da Metodologia / Marca</label>
            <input
              type="text"
              value={methodologyName}
              onChange={(e) => setMethodologyName(e.target.value)}
              className="w-full bg-[#f3f4f5] p-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0059bb]"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Score Mínimo Recomendado ({passingScore}/100)</label>
            <input
              type="range"
              min="50"
              max="95"
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              className="w-full accent-[#0059bb]"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer bg-[#f8f9fa] p-3 rounded-xl border border-gray-200">
            <input
              type="checkbox"
              checked={autoEmail}
              onChange={(e) => setAutoEmail(e.target.checked)}
              className="rounded text-[#0059bb] focus:ring-[#0059bb] w-4 h-4"
            />
            <div>
              <span className="font-bold text-[#191c1d] block">Notificações Automáticas por Email</span>
              <span className="text-[11px] text-gray-500">Enviar relatório em PDF ao aluno ao concluir o quiz.</span>
            </div>
          </label>
        </div>
        )}

        <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#0059bb] text-white font-bold hover:bg-[#0070ea] flex items-center gap-1.5"
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Configurações Salvas!' : 'Salvar e Conectar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
