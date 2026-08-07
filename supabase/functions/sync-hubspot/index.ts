// Supabase Edge Function: sync-hubspot
// Sincronização automática entre Supabase (empreendedorismo_respostas) e HubSpot CRM
// Runtime: Deno / Supabase Edge Functions

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapeamento das propriedades do formulário Natação Criativa para os campos do HubSpot
interface FormRecord {
  id: string;
  email: string;
  nome_completo: string;
  area_atuacao_atual?: string;
  aumento_ganhos_financeiros?: string;
  areas_de_ganho?: string[];
  area_para_empreender?: string;
  planos_apos_pos_graduacao?: string;
  renda_atual?: string;
  exercicio_durante_pos?: string;
  receios_antes_do_curso?: string[];
  projetos_acompanhados?: string[];
  hubspot_sync_status?: string;
  hubspot_sync_attempts?: number;
}

// Lista de propriedades personalizadas que devem existir no HubSpot
const HUBSPOT_CUSTOM_PROPERTIES = [
  { name: 'area_atuacao_aquatica', label: 'Área de Atuação Aquática', type: 'string', fieldType: 'text' },
  { name: 'aumento_ganhos_pos', label: 'Aumento de Ganhos Pós-Graduação', type: 'string', fieldType: 'text' },
  { name: 'areas_de_ganho_pos', label: 'Áreas de Ganho Financeiro Pós', type: 'string', fieldType: 'text' },
  { name: 'area_para_empreender', label: 'Área para Empreender', type: 'string', fieldType: 'text' },
  { name: 'planos_apos_pos', label: 'Planos após Pós-Graduação', type: 'string', fieldType: 'text' },
  { name: 'faixa_de_renda', label: 'Faixa de Renda Atual', type: 'string', fieldType: 'text' },
  { name: 'exercicio_durante_pos', label: 'Exercício da Profissão durante a Pós', type: 'string', fieldType: 'text' },
  { name: 'receios_antes_do_curso', label: 'Receios Antes do Curso', type: 'string', fieldType: 'text' },
  { name: 'projetos_natacao_criativa', label: 'Projetos Natação Criativa', type: 'string', fieldType: 'text' },
];

/**
 * Garante que uma propriedade personalizada exista no HubSpot antes de atribuí-la
 */
async function ensureHubSpotPropertyExists(
  accessToken: string,
  prop: { name: string; label: string; type: string; fieldType: string }
) {
  try {
    // 1. Verifica se a propriedade já existe
    const checkRes = await fetch(
      `https://api.hubapi.com/crm/v3/properties/contacts/${prop.name}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (checkRes.ok) {
      console.log(`[HubSpot Schema] Propriedade '${prop.name}' já existe.`);
      return;
    }

    // 2. Se for 404, cria a propriedade personalizada no grupo contactinformation
    if (checkRes.status === 404) {
      console.log(`[HubSpot Schema] Criando propriedade ausente '${prop.name}'...`);
      const createRes = await fetch('https://api.hubapi.com/crm/v3/properties/contacts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: prop.name,
          label: prop.label,
          type: prop.type,
          fieldType: prop.fieldType,
          groupName: 'contactinformation',
        }),
      });

      if (createRes.ok) {
        console.log(`[HubSpot Schema] Propriedade '${prop.name}' criada com sucesso.`);
      } else {
        const errJson = await createRes.json();
        console.warn(`[HubSpot Schema] Aviso ao criar '${prop.name}':`, errJson?.message || createRes.statusText);
      }
    }
  } catch (err) {
    console.warn(`[HubSpot Schema] Falha ao verificar propriedade '${prop.name}':`, err);
  }
}

/**
 * Busca ID de um contato no HubSpot utilizando o e-mail como chave única
 */
async function findHubSpotContactByEmail(accessToken: string, email: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'EQ',
                value: email,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[HubSpot Search] Erro na busca de contato por e-mail:', response.status, errText);
      return null;
    }

    const searchData = await response.json();
    if (searchData.results && searchData.results.length > 0) {
      return searchData.results[0].id;
    }
    return null;
  } catch (err) {
    console.error('[HubSpot Search] Exceção ao buscar contato:', err);
    return null;
  }
}

serve(async (req) => {
  // Trata requisições Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(`[sync-hubspot] ${msg}`);
    logs.push(msg);
  };

  try {
    log('Iniciando processamento da sincronização com HubSpot...');

    // 1. Variáveis de Ambiente e Secret do HubSpot
    const hubspotAccessToken = Deno.env.get('HUBSPOT_ACCESS_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!hubspotAccessToken) {
      throw new Error('Secret HUBSPOT_ACCESS_TOKEN não configurada nas secrets do Supabase.');
    }
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configuração do cliente Supabase incompleta (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Extrai registro da requisição (seja via Webhook Trigger ou Invocação Direta)
    const body = await req.json().catch(() => ({}));
    let record: FormRecord | null = null;

    if (body.record) {
      record = body.record;
    } else if (body.record_id || body.id) {
      const recordId = body.record_id || body.id;
      const { data, error } = await supabaseAdmin
        .from('empreendedorismo_respostas')
        .select('*')
        .eq('id', recordId)
        .single();

      if (error || !data) {
        throw new Error(`Registro ID '${recordId}' não encontrado no banco de dados.`);
      }
      record = data as FormRecord;
    } else {
      throw new Error('Payload inválido. Esperado objeto com "record" ou "record_id".');
    }

    log(`Registro identificado: ID=${record.id}, E-mail=${record.email}`);

    // 3. Atualiza status no banco para 'processing' e incrementa tentativas
    const currentAttempts = (record.hubspot_sync_attempts || 0) + 1;
    await supabaseAdmin
      .from('empreendedorismo_respostas')
      .update({
        hubspot_sync_status: 'processing',
        hubspot_sync_attempts: currentAttempts,
        hubspot_sync_error: null,
      })
      .eq('id', record.id);

    // 4. Separação de Nome e Sobrenome
    const nameParts = (record.nome_completo || '').trim().split(' ');
    const firstname = nameParts[0] || '';
    const lastname = nameParts.slice(1).join(' ') || '';

    // Convert arrays em strings separadas por ponto e vírgula (formato HubSpot multi-opções)
    const formatArray = (arr?: string[]) => (Array.isArray(arr) ? arr.join('; ') : arr || '');

    // 5. Mapeamento das propriedades conforme exigido nas especificações
    const propertiesToSync: Record<string, string> = {
      email: record.email,
      firstname: firstname,
      lastname: lastname,
      area_atuacao_aquatica: record.area_atuacao_atual || '',
      aumento_ganhos_pos: record.aumento_ganhos_financeiros || '',
      areas_de_ganho_pos: formatArray(record.areas_de_ganho),
      area_para_empreender: record.area_para_empreender || '',
      planos_apos_pos: record.planos_apos_pos_graduacao || '',
      faixa_de_renda: record.renda_atual || '',
      exercicio_durante_pos: record.exercicio_durante_pos || '',
      receios_antes_do_curso: formatArray(record.receios_antes_do_curso),
      projetos_natacao_criativa: formatArray(record.projetos_acompanhados),
    };

    log(`Campos mapeados para sincronização: ${JSON.stringify(Object.keys(propertiesToSync))}`);

    // 6. Assegura que propriedades personalizadas existam no esquema do HubSpot
    for (const propConfig of HUBSPOT_CUSTOM_PROPERTIES) {
      await ensureHubSpotPropertyExists(hubspotAccessToken, propConfig);
    }

    // 7. Localiza se o contato já existe no HubSpot
    const existingContactId = await findHubSpotContactByEmail(hubspotAccessToken, record.email);

    let hubspotContactId: string | null = null;

    if (existingContactId) {
      // REGRA: Se o contato já existir, atualiza suas propriedades (evita duplicatas)
      log(`Contato existente encontrado no HubSpot com ID: ${existingContactId}. Atualizando dados...`);
      const updateRes = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${existingContactId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${hubspotAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties: propertiesToSync }),
      });

      if (!updateRes.ok) {
        const errBody = await updateRes.text();
        throw new Error(`Erro ao atualizar contato existente no HubSpot (${updateRes.status}): ${errBody}`);
      }

      const updatedData = await updateRes.json();
      hubspotContactId = updatedData.id || existingContactId;
      log(`Contato ${hubspotContactId} atualizado no HubSpot com sucesso.`);
    } else {
      // REGRA: Se não existir, cria um novo contato
      log(`Nenhum contato encontrado com e-mail ${record.email}. Criando novo contato no HubSpot...`);
      const createRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hubspotAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties: propertiesToSync }),
      });

      if (!createRes.ok) {
        const errBody = await createRes.text();
        throw new Error(`Erro ao criar novo contato no HubSpot (${createRes.status}): ${errBody}`);
      }

      const createdData = await createRes.json();
      hubspotContactId = createdData.id;
      log(`Novo contato criado com sucesso no HubSpot. ID: ${hubspotContactId}`);
    }

    // 8. Registra o resultado com SUCESSO no banco principal Supabase
    const nowISO = new Date().toISOString();
    await supabaseAdmin
      .from('empreendedorismo_respostas')
      .update({
        hubspot_sync_status: 'synced',
        hubspot_contact_id: hubspotContactId,
        hubspot_synced_at: nowISO,
        hubspot_sync_error: null,
      })
      .eq('id', record.id);

    log(`Status do registro ${record.id} atualizado para 'synced' no Supabase.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sincronização com HubSpot concluída com sucesso.',
        record_id: record.id,
        hubspot_contact_id: hubspotContactId,
        synced_at: nowISO,
        logs: logs,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    const errorMsg = err.message || 'Erro desconhecido durante a sincronização com o HubSpot';
    log(`ERRO: ${errorMsg}`);

    // Em caso de falha, mantém a resposta salva no Supabase e registra o status de erro
    try {
      const body = await req.clone().json().catch(() => ({}));
      const recordId = body.record?.id || body.record_id || body.id;

      if (recordId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (supabaseUrl && supabaseServiceKey) {
          const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
          await supabaseAdmin
            .from('empreendedorismo_respostas')
            .update({
              hubspot_sync_status: 'error',
              hubspot_sync_error: errorMsg,
            })
            .eq('id', recordId);
        }
      }
    } catch (saveErr) {
      console.error('Falha ao registrar status de erro no Supabase:', saveErr);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMsg,
        logs: logs,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
