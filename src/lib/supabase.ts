import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function getSupabaseCredentials(): { url: string; key: string } {
  const env = (import.meta as any).env || {};
  let url = (typeof window !== 'undefined' ? localStorage.getItem('CUSTOM_SUPABASE_URL') : null) || env.VITE_SUPABASE_URL || '';
  let key = (typeof window !== 'undefined' ? localStorage.getItem('CUSTOM_SUPABASE_ANON_KEY') : null) || env.VITE_SUPABASE_ANON_KEY || '';

  // Clean up placeholders
  if (url.includes('your-project.supabase.co')) url = '';
  if (key === 'your-anon-key') key = '';

  return { url: url.trim(), key: key.trim() };
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem('CUSTOM_SUPABASE_URL', url.trim());
    else localStorage.removeItem('CUSTOM_SUPABASE_URL');

    if (key) localStorage.setItem('CUSTOM_SUPABASE_ANON_KEY', key.trim());
    else localStorage.removeItem('CUSTOM_SUPABASE_ANON_KEY');
  }
}

export function isSupabaseReady(): boolean {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key);
}

// Global cached client instance
let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) return null;

  if (cachedClient && lastUrl === url && lastKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key);
    lastUrl = url;
    lastKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Erro ao instanciar cliente do Supabase:', err);
    return null;
  }
}

export const isSupabaseConfigured = isSupabaseReady();
export const supabase = getSupabaseClient();

export async function testSupabaseConnection(
  urlInput?: string,
  keyInput?: string
): Promise<{
  success: boolean;
  message: string;
  code?: string;
}> {
  if (urlInput && keyInput) {
    saveSupabaseCredentials(urlInput, keyInput);
  }
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não configuradas.',
    };
  }

  try {
    const { data, error } = await client
      .from('empreendedorismo_respostas')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        return {
          success: false,
          code: '42P01',
          message: 'Tabela public.empreendedorismo_respostas não existe no Supabase. Execute o script SQL fornecido.',
        };
      }
      if (error.code === '42501') {
        return {
          success: false,
          code: '42501',
          message: 'Permissão negada (RLS). Execute a política CREATE POLICY para permitir acesso anônimo.',
        };
      }
      return {
        success: false,
        code: error.code,
        message: `Erro do Supabase (${error.code}): ${error.message}`,
      };
    }

    return {
      success: true,
      message: `Conexão bem-sucedida com o Supabase! Tabela 'empreendedorismo_respostas' acessível. (${data.length} registros encontrados)`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao conectar: ${err.message || 'Verifique a URL e a Chave'}`,
    };
  }
}

export interface SupabaseQuizResponse {
  id?: string;
  student_id: string;
  student_name: string;
  student_email: string;
  cohort_id: string;
  profile_result: string;
  score: number;
  status: string;
  answers_count: number;
  answers_json?: Record<string, any>;
  notes?: string;
  created_at?: string;
}

// Function to submit a response to Supabase
export async function submitQuizResponseToSupabase(responseData: Omit<SupabaseQuizResponse, 'id' | 'created_at'>) {
  const client = getSupabaseClient();
  if (!client) {
    console.warn('Supabase não está configurado. Usando modo de simulação local.');
    return { data: null, error: null };
  }

  const { data, error } = await client
    .from('quiz_responses')
    .insert([responseData])
    .select();

  return { data, error };
}

// Function to subscribe to realtime response inserts
export function subscribeToRealtimeQuizResponses(onNewResponse: (response: SupabaseQuizResponse) => void) {
  const client = getSupabaseClient();
  if (!client) return () => {};

  const channel = client
    .channel('public:quiz_responses')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'quiz_responses',
      },
      (payload) => {
        if (payload.new) {
          onNewResponse(payload.new as SupabaseQuizResponse);
        }
      }
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}

export interface EmpreendedorismoResposta {
  id?: string;
  email: string;
  nome_completo: string;
  telefone?: string;
  area_atuacao_atual: string;
  aumento_ganhos_financeiros: string;
  areas_de_ganho: string[];
  area_para_empreender: string;
  planos_apos_pos_graduacao: string;
  renda_atual: string;
  exercicio_durante_pos: string;
  receios_antes_do_curso: string[];
  projetos_acompanhados: string[];
  tipo_de_form?: string;
  created_at?: string;

  // Colunas de Sincronização HubSpot
  hubspot_sync_status?: 'pending' | 'processing' | 'synced' | 'error';
  hubspot_contact_id?: string;
  hubspot_synced_at?: string;
  hubspot_sync_error?: string;
  hubspot_sync_attempts?: number;
}

export const EMPREENDEDORISMO_SQL_SCHEMA = `-- Copie e cole este script no Editor SQL do seu projeto Supabase:
CREATE TABLE IF NOT EXISTS public.empreendedorismo_respostas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  nome_completo TEXT NOT NULL,
  telefone TEXT,
  area_atuacao_atual TEXT,
  aumento_ganhos_financeiros TEXT,
  areas_de_ganho TEXT[],
  area_para_empreender TEXT,
  planos_apos_pos_graduacao TEXT,
  renda_atual TEXT,
  exercicio_durante_pos TEXT,
  receios_antes_do_curso TEXT[],
  projetos_acompanhados TEXT[],
  tipo_de_form TEXT DEFAULT 'Pesquisa de Empreendedorismo - Pós-Graduação',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Colunas de Controle e Sincronização HubSpot
  hubspot_sync_status TEXT DEFAULT 'pending' CHECK (hubspot_sync_status IN ('pending', 'processing', 'synced', 'error')),
  hubspot_contact_id TEXT,
  hubspot_synced_at TIMESTAMPTZ,
  hubspot_sync_error TEXT,
  hubspot_sync_attempts INTEGER DEFAULT 0
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.empreendedorismo_respostas ENABLE ROW LEVEL SECURITY;

-- Politica de inserção e leitura pública
DROP POLICY IF EXISTS "Permitir insercao anonima" ON public.empreendedorismo_respostas;
CREATE POLICY "Permitir insercao anonima" ON public.empreendedorismo_respostas FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura anonima" ON public.empreendedorismo_respostas;
CREATE POLICY "Permitir leitura anonima" ON public.empreendedorismo_respostas FOR SELECT USING (true);
`;

const LOCAL_STORAGE_KEY = 'empreendedorismo_local_responses';

// Helper to get local responses - Returns empty array as caching in localStorage is disabled
export function getEmpreendedorismoLocalResponses(): EmpreendedorismoResposta[] {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem('empreendedorismo_form_draft');
  } catch (e) {}
  return [];
}

// Helper to clear local responses cache
export function clearEmpreendedorismoLocalResponses(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem('empreendedorismo_form_draft');
  } catch (e) {}
}

// Helper (no-op as localStorage saving is completely disabled)
export function saveEmpreendedorismoLocalResponse(
  resposta: Omit<EmpreendedorismoResposta, 'id' | 'created_at'>
): EmpreendedorismoResposta {
  return {
    ...resposta,
    id: `db-pending-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
}

// Function to submit Empreendedorismo Form strictly to Supabase table 'empreendedorismo_respostas' and HubSpot
export async function submitEmpreendedorismoFormToSupabase(
  formData: Omit<EmpreendedorismoResposta, 'id' | 'created_at'>
) {
  // Sync strictly to HubSpot
  const { syncEmpreendedorismoRecordToHubspot } = await import('./hubspot');
  const hubspotSyncResult = await syncEmpreendedorismoRecordToHubspot(formData);

  const client = getSupabaseClient();

  if (!client) {
    return {
      data: null,
      savedLocally: false,
      hubspotSyncResult,
      error: new Error('O Supabase não está configurado. Conecte sua URL e Chave do Supabase para salvar no Banco de Dados.'),
    };
  }

  try {
    const payloadWithHubspot = {
      ...formData,
      hubspot_sync_status: hubspotSyncResult.success ? 'synced' : 'pending',
      hubspot_contact_id: hubspotSyncResult.contactId || null,
      hubspot_sync_error: hubspotSyncResult.success ? null : hubspotSyncResult.message,
    };

    const { data, error } = await client
      .from('empreendedorismo_respostas')
      .insert([payloadWithHubspot])
      .select();

    if (error) {
      return {
        data: null,
        savedLocally: false,
        hubspotSyncResult,
        error: new Error(`Erro do Banco de Dados Supabase (${error.code || 'RLS'}): ${error.message}`),
      };
    }

    return { data, savedLocally: false, hubspotSyncResult, error: null };
  } catch (err: any) {
    return {
      data: null,
      savedLocally: false,
      hubspotSyncResult,
      error: new Error(`Falha de conexão com o banco de dados Supabase: ${err.message || 'Verifique sua conexão'}`),
    };
  }
}

// Function to fetch all empreendedorismo responses strictly from Supabase
export async function fetchEmpreendedorismoResponsesFromSupabase() {
  const client = getSupabaseClient();

  if (!client) {
    return { data: [], error: new Error('Supabase não configurado.'), isLocalOnly: false };
  }

  try {
    const { data, error } = await client
      .from('empreendedorismo_respostas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error, isLocalOnly: false };
    }

    return { data: (data as EmpreendedorismoResposta[]) || [], error: null, isLocalOnly: false };
  } catch (err: any) {
    return { data: [], error: err, isLocalOnly: false };
  }
}

// Function to resend/retry sync with HubSpot for records with status 'error' or 'pending'
export async function resendEmpreendedorismoToHubSpot(recordId: string) {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: 'Supabase não está configurado no ambiente. Apenas armazenamento local em uso.',
    };
  }

  try {
    // 1. Fetch the record details first
    const { data: record, error: fetchErr } = await client
      .from('empreendedorismo_respostas')
      .select('*')
      .eq('id', recordId)
      .single();

    if (fetchErr || !record) {
      return { success: false, error: 'Registro não encontrado no Supabase.' };
    }

    // 2. Update status in DB to 'processing'
    await client
      .from('empreendedorismo_respostas')
      .update({
        hubspot_sync_status: 'processing',
        hubspot_sync_error: null,
      })
      .eq('id', recordId);

    // 3. Try Edge Function first
    const { data, error: edgeErr } = await client.functions.invoke('sync-hubspot', {
      body: { record_id: recordId },
    });

    if (!edgeErr) {
      return { success: true, data };
    }

    // 4. Fallback: If Edge Function fails or isn't deployed, check if client has HubSpot Token configured
    const { getHubspotToken, syncEmpreendedorismoRecordToHubspot } = await import('./hubspot');
    const token = getHubspotToken();

    if (token) {
      const directRes = await syncEmpreendedorismoRecordToHubspot(record);

      if (directRes.success) {
        await client
          .from('empreendedorismo_respostas')
          .update({
            hubspot_sync_status: 'synced',
            hubspot_contact_id: directRes.contactId || 'direct-api',
            hubspot_sync_error: null,
          })
          .eq('id', recordId);

        return { success: true, message: 'Sincronizado diretamente com HubSpot API!' };
      } else {
        await client
          .from('empreendedorismo_respostas')
          .update({
            hubspot_sync_status: 'error',
            hubspot_sync_error: directRes.message,
          })
          .eq('id', recordId);

        return { success: false, error: directRes.message };
      }
    }

    // If no local token either, log Edge Function error
    await client
      .from('empreendedorismo_respostas')
      .update({
        hubspot_sync_status: 'error',
        hubspot_sync_error: edgeErr.message || 'Edge Function sync-hubspot indisponível',
      })
      .eq('id', recordId);

    return { success: false, error: edgeErr.message };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Erro ao reprocessar sincronização com o HubSpot',
    };
  }
}

// Function to fetch quiz responses from Supabase table 'quiz_responses'
export async function fetchQuizResponsesFromSupabase(): Promise<SupabaseQuizResponse[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  try {
    const { data, error } = await client
      .from('quiz_responses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Erro ao buscar quiz_responses do Supabase:', error);
      return [];
    }
    return (data as SupabaseQuizResponse[]) || [];
  } catch (err) {
    console.error('Exceção ao buscar quiz_responses:', err);
    return [];
  }
}
