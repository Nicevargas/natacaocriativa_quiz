-- Migration 20260807000003: Configuração do Database Webhook Trigger para Edge Function sync-hubspot

-- 1. Habilitar a extensão pg_net para envio de webhooks HTTP assíncronos
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Função Pl/pgSQL que é executada após cada INSERT na tabela empreendedorismo_respostas
CREATE OR REPLACE FUNCTION public.trigger_sync_hubspot()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Tenta obter a URL da Edge Function de configurações ou utiliza a URL padrão do projeto
  edge_function_url := current_setting('app.settings.edge_function_url', true);
  IF edge_function_url IS NULL OR edge_function_url = '' THEN
    edge_function_url := CONCAT(
      current_setting('app.settings.supabase_url', true),
      '/functions/v1/sync-hubspot'
    );
  END IF;

  -- Se a variável do app não estiver configurada, fallback para variável padrão
  IF edge_function_url IS NULL OR edge_function_url = '/functions/v1/sync-hubspot' THEN
    edge_function_url := 'https://' || current_setting('request.headers', true)::json->>'host' || '/functions/v1/sync-hubspot';
  END IF;

  service_role_key := current_setting('app.settings.service_role_key', true);

  -- Dispara a chamada HTTP POST via pg_net para a Supabase Edge Function sync-hubspot
  PERFORM net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', CONCAT('Bearer ', service_role_key)
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA,
      'record', row_to_json(NEW)
    )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Registra aviso no log sem interromper a gravação da resposta no banco de dados
  RAISE WARNING 'Erro ao disparar webhook para sync-hubspot: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar o Trigger de Banco de Dados
DROP TRIGGER IF EXISTS trigger_sync_hubspot_on_insert ON public.empreendedorismo_respostas;
CREATE TRIGGER trigger_sync_hubspot_on_insert
AFTER INSERT ON public.empreendedorismo_respostas
FOR EACH ROW
EXECUTE FUNCTION public.trigger_sync_hubspot();
