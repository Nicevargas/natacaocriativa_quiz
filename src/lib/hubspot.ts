export function getHubspotToken(): string {
  const env = (import.meta as any).env || {};
  let token =
    (typeof window !== 'undefined' ? localStorage.getItem('CUSTOM_HUBSPOT_TOKEN') : null) ||
    env.VITE_HUBSPOT_API_KEY ||
    env.VITE_HUBSPOT_ACCESS_TOKEN ||
    '';
  return token.trim();
}

export function saveHubspotToken(token: string) {
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('CUSTOM_HUBSPOT_TOKEN', token.trim());
    else localStorage.removeItem('CUSTOM_HUBSPOT_TOKEN');
  }
}

export async function testHubspotConnection(tokenInput?: string): Promise<{
  success: boolean;
  message: string;
  totalContacts?: number;
}> {
  const token = tokenInput || getHubspotToken();

  if (!token) {
    return {
      success: false,
      message: 'Nenhum token/chave de API do HubSpot configurado.',
    };
  }

  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: `Conexão bem-sucedida com a API do HubSpot! Token ativo e autenticado.`,
        totalContacts: data.total,
      };
    }

    if (response.status === 401) {
      return {
        success: false,
        message: 'Token do HubSpot inválido ou não autorizado (401 Unauthorized). Verifique o Token de Aplicativo Privado no HubSpot.',
      };
    }

    if (response.status === 403) {
      return {
        success: false,
        message: 'Acesso negado (403 Forbidden). Verifique se o seu Token no HubSpot possui as permissões crm.objects.contacts.read e crm.objects.contacts.write.',
      };
    }

    const errText = await response.text();
    return {
      success: false,
      message: `A API do HubSpot respondeu com status ${response.status}: ${errText.slice(0, 100)}`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro na requisição para o HubSpot (${err.message || 'Bloqueio de rede ou CORS'}).`,
    };
  }
}

export async function sendTestContactToHubspot(contact: {
  email: string;
  firstname: string;
  phone?: string;
}): Promise<{ success: boolean; message: string; contactId?: string }> {
  return syncEmpreendedorismoRecordToHubspot({
    email: contact.email,
    nome_completo: contact.firstname,
    telefone: contact.phone,
  });
}

export async function syncEmpreendedorismoRecordToHubspot(record: {
  email: string;
  nome_completo: string;
  telefone?: string;
  area_atuacao_atual?: string;
  aumento_ganhos_financeiros?: string;
  areas_de_ganho?: string[];
  area_para_empreender?: string;
  planos_apos_pos_graduacao?: string;
  renda_atual?: string;
  exercicio_durante_pos?: string;
  receios_antes_do_curso?: string[];
  projetos_acompanhados?: string[];
}): Promise<{ success: boolean; message: string; contactId?: string }> {
  const token = getHubspotToken();
  if (!token) {
    return {
      success: false,
      message: 'Token de API do HubSpot não configurado. Adicione o Token em Configurações.',
    };
  }

  const summaryLines = [
    `Área de Atuação: ${record.area_atuacao_atual || 'Não informada'}`,
    `Aumento de Ganhos: ${record.aumento_ganhos_financeiros || 'Não informado'}`,
    `Áreas de Ganho: ${record.areas_de_ganho?.join(', ') || 'Nenhuma'}`,
    `Área para Empreender: ${record.area_para_empreender || 'Não informada'}`,
    `Planos Pós-Graduação: ${record.planos_apos_pos_graduacao || 'Não informados'}`,
    `Renda Atual: ${record.renda_atual || 'Não informada'}`,
    `Exercício Durante Pós: ${record.exercicio_durante_pos || 'Não informado'}`,
    `Receios Antes do Curso: ${record.receios_antes_do_curso?.join(', ') || 'Nenhum'}`,
    `Projetos Acompanhados: ${record.projetos_acompanhados?.join(', ') || 'Nenhum'}`,
  ];

  const properties: Record<string, string> = {
    email: record.email,
    firstname: record.nome_completo,
    phone: record.telefone || '',
    jobtitle: record.area_atuacao_atual || '',
    message: summaryLines.join(' | '),
    lifecyclestage: 'lead',
  };

  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: `Contato ${record.email} enviado com sucesso ao HubSpot!`,
        contactId: data.id,
      };
    }

    if (response.status === 409) {
      const errData = await response.json().catch(() => ({}));
      const existingId =
        errData.message?.match(/Existing ID: (\d+)/i)?.[1] ||
        errData.message?.match(/ID: (\d+)/i)?.[1];

      if (existingId) {
        const patchRes = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${existingId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ properties }),
        });

        if (patchRes.ok) {
          return {
            success: true,
            message: `Contato ${record.email} já existia no HubSpot e foi atualizado!`,
            contactId: existingId,
          };
        }
      }

      return {
        success: true,
        message: `O contato ${record.email} já existe no seu HubSpot.`,
        contactId: existingId,
      };
    }

    const errJson = await response.json().catch(() => ({}));
    return {
      success: false,
      message: `Erro do HubSpot (${response.status}): ${errJson.message || response.statusText}`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Falha ao conectar com a API do HubSpot: ${err.message}`,
    };
  }
}

