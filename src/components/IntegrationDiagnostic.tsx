import React, { useState, useEffect } from 'react';
import {
  Database,
  Zap,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Send,
  Clock,
  Search,
  Filter,
  Check,
  XCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import {
  getSupabaseCredentials,
  getSupabaseClient,
  fetchEmpreendedorismoResponsesFromSupabase,
  resendEmpreendedorismoToHubSpot,
  clearEmpreendedorismoLocalResponses,
  EmpreendedorismoResposta,
  testSupabaseConnection
} from '../lib/supabase';
import {
  getHubspotToken,
  testHubspotConnection,
  syncEmpreendedorismoRecordToHubspot
} from '../lib/hubspot';

export function IntegrationDiagnostic() {
  const [isCheckingConnections, setIsCheckingConnections] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  }>({ tested: false, success: false, message: 'Aguardando verificação...' });

  const [hubspotStatus, setHubspotStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    totalContacts?: number;
  }>({ tested: false, success: false, message: 'Aguardando verificação...' });

  const [records, setRecords] = useState<EmpreendedorismoResposta[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'error' | 'pending' | 'synced'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [resendingId, setResendingId] = useState<string | null>(null);
  const [isBulkResending, setIsBulkResending] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ success: number; failed: number } | null>(null);

  useEffect(() => {
    runDiagnostic();
  }, []);

  const runDiagnostic = async () => {
    setIsCheckingConnections(true);
    setBulkResult(null);

    // 1. Check Supabase
    const creds = getSupabaseCredentials();
    if (!creds.url || !creds.key) {
      setSupabaseStatus({
        tested: true,
        success: false,
        message: 'Supabase não possui URL ou Chave configurada no app.',
      });
    } else {
      const supaTest = await testSupabaseConnection(creds.url, creds.key);
      setSupabaseStatus({
        tested: true,
        success: supaTest.success,
        message: supaTest.message,
      });
    }

    // 2. Check HubSpot
    const token = getHubspotToken();
    if (!token) {
      setHubspotStatus({
        tested: true,
        success: false,
        message: 'Token de API do HubSpot não configurado nas Configurações.',
      });
    } else {
      const hubTest = await testHubspotConnection(token);
      setHubspotStatus({
        tested: true,
        success: hubTest.success,
        message: hubTest.message,
        totalContacts: hubTest.totalContacts,
      });
    }

    setIsCheckingConnections(false);

    // 3. Load records
    await loadRecords();
  };

  const loadRecords = async () => {
    setIsLoadingRecords(true);
    const result = await fetchEmpreendedorismoResponsesFromSupabase();
    if (result.data) {
      setRecords(result.data);
    }
    setIsLoadingRecords(false);
  };

  const handleResendRecord = async (record: EmpreendedorismoResposta) => {
    const id = record.id || '';
    if (!id) return;

    setResendingId(id);
    try {
      if (id.startsWith('local-')) {
        // Direct API resend for local items
        const res = await syncEmpreendedorismoRecordToHubspot(record);
        if (res.success) {
          setRecords((prev) =>
            prev.map((r) =>
              r.id === id
                ? {
                    ...r,
                    hubspot_sync_status: 'synced',
                    hubspot_contact_id: res.contactId,
                    hubspot_sync_error: undefined,
                  }
                : r
            )
          );
        } else {
          setRecords((prev) =>
            prev.map((r) =>
              r.id === id
                ? {
                    ...r,
                    hubspot_sync_status: 'error',
                    hubspot_sync_error: res.message,
                  }
                : r
            )
          );
        }
      } else {
        // Resend via backend/Supabase procedure
        const res = await resendEmpreendedorismoToHubSpot(id);
        if (res.success) {
          await loadRecords();
        } else {
          setRecords((prev) =>
            prev.map((r) =>
              r.id === id
                ? {
                    ...r,
                    hubspot_sync_status: 'error',
                    hubspot_sync_error: res.error,
                  }
                : r
            )
          );
        }
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setResendingId(null);
    }
  };

  const handleResendAllErrors = async () => {
    const errorRecords = records.filter(
      (r) => r.hubspot_sync_status === 'error' || r.hubspot_sync_status === 'pending'
    );

    if (errorRecords.length === 0) return;

    setIsBulkResending(true);
    setBulkResult(null);

    let successCount = 0;
    let failedCount = 0;

    for (const record of errorRecords) {
      try {
        const res = await syncEmpreendedorismoRecordToHubspot(record);
        if (res.success) {
          successCount++;
        } else {
          failedCount++;
        }
      } catch (e) {
        failedCount++;
      }
    }

    setBulkResult({ success: successCount, failed: failedCount });
    setIsBulkResending(false);
    await loadRecords();
  };

  // Filter logic
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const status = r.hubspot_sync_status || 'pending';
    if (filterStatus === 'error') return status === 'error';
    if (filterStatus === 'pending') return status === 'pending' || status === 'processing';
    if (filterStatus === 'synced') return status === 'synced';

    return true;
  });

  const totalCount = records.length;
  const syncedCount = records.filter((r) => r.hubspot_sync_status === 'synced').length;
  const errorCount = records.filter((r) => r.hubspot_sync_status === 'error').length;
  const pendingCount = records.filter(
    (r) => !r.hubspot_sync_status || r.hubspot_sync_status === 'pending' || r.hubspot_sync_status === 'processing'
  ).length;

  return (
    <div className="space-y-6 text-gray-800">
      {/* HEADER & REFRESH */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div>
          <h2 className="text-lg font-headline font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            <span>Diagnóstico de Integração: Supabase &amp; HubSpot</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Verificação do pipeline de dados, status dos conectores e sincronização da tabela{' '}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 font-mono">empreendedorismo_respostas</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm('Deseja limpar os registros locais em cache? Os registros salvos no banco de dados Supabase continuarão salvos.')) {
                clearEmpreendedorismoLocalResponses();
                loadRecords();
              }
            }}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-headline font-bold text-xs rounded-xl transition-all"
            title="Limpar apenas duplicatas ou cópias salvas no navegador local"
          >
            Limpar Cache Local
          </button>
          <button
            onClick={runDiagnostic}
            disabled={isCheckingConnections || isLoadingRecords}
            className="px-4 py-2.5 bg-gray-900 hover:bg-black disabled:opacity-50 text-white font-headline font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${(isCheckingConnections || isLoadingRecords) ? 'animate-spin' : ''}`} />
            <span>Executar Diagnóstico Completo</span>
          </button>
        </div>
      </div>

      {/* CONNECTION STATUS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SUPABASE CONNECTOR CARD */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            supabaseStatus.success
              ? 'bg-emerald-50/60 border-emerald-200'
              : 'bg-amber-50/60 border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-gray-900 text-sm">Supabase Database</h3>
                <p className="text-[11px] text-gray-500">Persistência Relacional de Respostas</p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                supabaseStatus.success
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}
            >
              {supabaseStatus.success ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Conectado
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Não Conectado / Local
                </>
              )}
            </span>
          </div>

          <p className="text-xs text-gray-700 bg-white/80 p-3 rounded-xl border border-gray-200/50 font-mono">
            {supabaseStatus.message}
          </p>
        </div>

        {/* HUBSPOT CONNECTOR CARD */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            hubspotStatus.success
              ? 'bg-orange-50/60 border-orange-200'
              : 'bg-rose-50/60 border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-orange-100 text-orange-800 rounded-xl">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-gray-900 text-sm">HubSpot CRM</h3>
                <p className="text-[11px] text-gray-500">API de Objetos Contacts (/crm/v3/contacts)</p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                hubspotStatus.success
                  ? 'bg-orange-100 text-orange-800 border-orange-300'
                  : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}
            >
              {hubspotStatus.success ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" /> Token Válido
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 text-rose-600" /> Token Não Configurado
                </>
              )}
            </span>
          </div>

          <p className="text-xs text-gray-700 bg-white/80 p-3 rounded-xl border border-gray-200/50 font-mono">
            {hubspotStatus.message}
          </p>
        </div>
      </div>

      {/* METRICS METERS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total na Tabela</p>
          <p className="text-2xl font-headline font-extrabold text-gray-900">{totalCount}</p>
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 shadow-2xs">
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Sincronizados</p>
          <p className="text-2xl font-headline font-extrabold text-emerald-700">{syncedCount}</p>
        </div>

        <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200 shadow-2xs">
          <p className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-1">Com Erro</p>
          <p className="text-2xl font-headline font-extrabold text-rose-700">{errorCount}</p>
        </div>

        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 shadow-2xs">
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Pendentes / Fila</p>
          <p className="text-2xl font-headline font-extrabold text-amber-700">{pendingCount}</p>
        </div>
      </div>

      {/* ACTIONS & BULK RESEND */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-headline font-bold text-gray-900 text-sm flex items-center gap-2">
              <Send className="w-4 h-4 text-orange-600" />
              <span>Gerenciamento da Fila de Sincronização</span>
            </h3>
            <p className="text-xs text-gray-500">
              Reenvie manualmente registros que falharam na primeira tentativa ou que estão pendentes.
            </p>
          </div>

          <button
            onClick={handleResendAllErrors}
            disabled={isBulkResending || (errorCount === 0 && pendingCount === 0)}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-headline font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-xs"
          >
            {isBulkResending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>Reenviar Todos com Erro/Pendente ({errorCount + pendingCount})</span>
          </button>
        </div>

        {bulkResult && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              Processo concluído: {bulkResult.success} registro(s) sincronizado(s) com sucesso com o HubSpot e {bulkResult.failed} falha(s).
            </span>
          </div>
        )}

        {/* SEARCH AND FILTER BAR */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterStatus === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos ({records.length})
            </button>
            <button
              onClick={() => setFilterStatus('error')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterStatus === 'error'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Erros ({errorCount})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Pendentes ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus('synced')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterStatus === 'synced'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              OK ({syncedCount})
            </button>
          </div>
        </div>

        {/* RECORDS TABLE */}
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
                <th className="p-3">Data / Aluno</th>
                <th className="p-3">E-mail</th>
                <th className="p-3">Status no HubSpot</th>
                <th className="p-3">Detalhe / Erro do HubSpot</th>
                <th className="p-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-400">
                    Nenhum registro encontrado para este filtro.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => {
                  const status = item.hubspot_sync_status || 'pending';
                  const isResending = resendingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3 font-medium text-gray-900">
                        <div className="font-bold">{item.nome_completo}</div>
                        <div className="text-[10px] text-gray-400">
                          {item.created_at ? new Date(item.created_at).toLocaleString('pt-BR') : 'Data recente'}
                        </div>
                      </td>

                      <td className="p-3 text-gray-600 font-mono text-[11px]">{item.email}</td>

                      <td className="p-3">
                        {status === 'synced' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sincronizado
                          </span>
                        )}
                        {status === 'error' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Falha no HubSpot
                          </span>
                        )}
                        {(status === 'pending' || status === 'processing') && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pendente
                          </span>
                        )}
                      </td>

                      <td className="p-3 max-w-xs truncate text-[11px]">
                        {status === 'synced' ? (
                          <span className="text-gray-500 font-mono">
                            HubSpot Contact ID: {item.hubspot_contact_id || 'OK'}
                          </span>
                        ) : item.hubspot_sync_error ? (
                          <span className="text-rose-600 font-mono">{item.hubspot_sync_error}</span>
                        ) : (
                          <span className="text-gray-400 italic">Aguardando disparo</span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleResendRecord(item)}
                          disabled={isResending}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ml-auto border ${
                            status === 'error'
                              ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700 shadow-xs'
                              : 'bg-white hover:bg-gray-100 text-gray-800 border-gray-300'
                          }`}
                        >
                          {isResending ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          <span>Reenviar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
