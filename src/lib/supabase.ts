import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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
  if (!supabase) {
    console.warn('Supabase não está configurado. Usando modo de simulação local.');
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from('quiz_responses')
    .insert([responseData])
    .select();

  return { data, error };
}

// Function to subscribe to realtime response inserts
export function subscribeToRealtimeQuizResponses(onNewResponse: (response: SupabaseQuizResponse) => void) {
  if (!supabase) return () => {};

  const channel = supabase
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
    supabase.removeChannel(channel);
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

const INITIAL_LOCAL_RESPONSES: EmpreendedorismoResposta[] = [
  {
    id: 'local-demo-1',
    email: 'carlos.eduardo@exemplo.com.br',
    nome_completo: 'Carlos Eduardo Silva',
    area_atuacao_atual: 'Professor de Natação Infantil e Bebês',
    aumento_ganhos_financeiros: 'Sim, entre 30% e 60%',
    areas_de_ganho: ['Aulas Particulares / Personal Swimming', 'Consultoria e Treinamentos'],
    area_para_empreender: 'Escola / Metodologia Própria de Natação',
    planos_apos_pos_graduacao: 'Abrir meu próprio negócio aquático nos próximos 6 meses',
    renda_atual: 'R$ 4.001 a R$ 7.000',
    exercicio_durante_pos: 'Sim, leciono e pratico natação semanalmente',
    receios_antes_do_curso: ['Insegurança na gestão financeira e precificação'],
    projetos_acompanhados: ['Academia / Escola de Natação', 'Metodologia Própria'],
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'local-demo-2',
    email: 'mariana.alves@exemplo.com.br',
    nome_completo: 'Mariana Alves Rocha',
    area_atuacao_atual: 'Coordenadora Pedagógica Aquática',
    aumento_ganhos_financeiros: 'Sim, mais que dobrou (100%+)',
    areas_de_ganho: ['Gestão de Academia / Módulo de Piscina', 'Cursos e Eventos Aquáticos'],
    area_para_empreender: 'Consultoria para Academias e Clubes',
    planos_apos_pos_graduacao: 'Expandir a consultoria e metodologia atual',
    renda_atual: 'R$ 7.001 a R$ 10.000',
    exercicio_durante_pos: 'Sim, pratico atividades aquáticas regularmente',
    receios_antes_do_curso: ['Falta de conhecimento em marketing e captação de alunos'],
    projetos_acompanhados: ['Consultoria em Gestão Aquática'],
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

// Helper to get local responses
export function getEmpreendedorismoLocalResponses(): EmpreendedorismoResposta[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_LOCAL_RESPONSES));
      return INITIAL_LOCAL_RESPONSES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler respostas do localStorage', e);
    return INITIAL_LOCAL_RESPONSES;
  }
}

// Helper to save a response locally
export function saveEmpreendedorismoLocalResponse(
  resposta: Omit<EmpreendedorismoResposta, 'id' | 'created_at'>
): EmpreendedorismoResposta {
  const current = getEmpreendedorismoLocalResponses();
  const newRecord: EmpreendedorismoResposta = {
    ...resposta,
    id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
  };
  const updated = [newRecord, ...current];
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Erro ao salvar resposta no localStorage', e);
  }
  return newRecord;
}

// Function to submit Empreendedorismo Form to Supabase table 'empreendedorismo_respostas'
export async function submitEmpreendedorismoFormToSupabase(
  formData: Omit<EmpreendedorismoResposta, 'id' | 'created_at'>
) {
  // Always save locally first as a fallback guarantee
  const localSaved = saveEmpreendedorismoLocalResponse(formData);

  if (!supabase) {
    return {
      data: [localSaved],
      savedLocally: true,
      error: null,
    };
  }

  try {
    const { data, error } = await supabase
      .from('empreendedorismo_respostas')
      .insert([formData])
      .select();

    if (error) {
      console.warn('Erro ao salvar no Supabase, mantendo cópia salva localmente:', error);
      return {
        data: [localSaved],
        savedLocally: true,
        error: new Error(`Erro do Supabase: ${error.message} (A resposta foi salva localmente no navegador)`),
      };
    }

    return { data, savedLocally: false, error: null };
  } catch (err: any) {
    console.warn('Exceção no Supabase, mantendo cópia local:', err);
    return {
      data: [localSaved],
      savedLocally: true,
      error: new Error(`Falha de conexão: ${err.message || 'Supabase fora do ar'} (Salvo localmente)`),
    };
  }
}

// Function to fetch all empreendedorismo responses (merging Supabase + LocalStorage)
export async function fetchEmpreendedorismoResponsesFromSupabase() {
  const localResponses = getEmpreendedorismoLocalResponses();

  if (!supabase) {
    return { data: localResponses, error: null, isLocalOnly: true };
  }

  try {
    const { data, error } = await supabase
      .from('empreendedorismo_respostas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error, fallback para local:', error);
      return { data: localResponses, error, isLocalOnly: true };
    }

    // Merge remote and local without duplicate emails/timestamps
    const remoteData = (data as EmpreendedorismoResposta[]) || [];
    const combinedMap = new Map<string, EmpreendedorismoResposta>();

    // Add remote items
    remoteData.forEach((item) => {
      const key = item.id || `${item.email}-${item.created_at}`;
      combinedMap.set(key, item);
    });

    // Add local items if not already present
    localResponses.forEach((item) => {
      const key = item.id || `${item.email}-${item.created_at}`;
      if (!combinedMap.has(key)) {
        combinedMap.set(key, item);
      }
    });

    const merged = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );

    return { data: merged, error: null, isLocalOnly: false };
  } catch (err) {
    return { data: localResponses, error: null, isLocalOnly: true };
  }
}

// Function to resend/retry sync with HubSpot for records with status 'error' or 'pending'
export async function resendEmpreendedorismoToHubSpot(recordId: string) {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase não está configurado no ambiente. Apenas armazenamento local em uso.',
    };
  }

  try {
    // 1. Atualiza status no banco para 'pending'
    await supabase
      .from('empreendedorismo_respostas')
      .update({
        hubspot_sync_status: 'pending',
        hubspot_sync_error: null,
      })
      .eq('id', recordId);

    // 2. Invoca diretamente a Edge Function 'sync-hubspot'
    const { data, error } = await supabase.functions.invoke('sync-hubspot', {
      body: { record_id: recordId },
    });

    if (error) {
      // Atualiza o registro com o erro da invocação
      await supabase
        .from('empreendedorismo_respostas')
        .update({
          hubspot_sync_status: 'error',
          hubspot_sync_error: error.message || 'Falha ao invocar Edge Function sync-hubspot',
        })
        .eq('id', recordId);

      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Erro ao reprocessar sincronização com o HubSpot',
    };
  }
}
