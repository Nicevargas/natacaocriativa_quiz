-- Migration 20260807000002: Adicionar colunas para sincronização com o HubSpot
-- Tabela: public.empreendedorismo_respostas

ALTER TABLE public.empreendedorismo_respostas
ADD COLUMN IF NOT EXISTS hubspot_sync_status TEXT DEFAULT 'pending' CHECK (hubspot_sync_status IN ('pending', 'processing', 'synced', 'error')),
ADD COLUMN IF NOT EXISTS hubspot_contact_id TEXT,
ADD COLUMN IF NOT EXISTS hubspot_synced_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS hubspot_sync_error TEXT,
ADD COLUMN IF NOT EXISTS hubspot_sync_attempts INTEGER DEFAULT 0;

-- Criar índice para otimizar buscas por status de sincronização
CREATE INDEX IF NOT EXISTS idx_empreendedorismo_hubspot_sync_status 
ON public.empreendedorismo_respostas (hubspot_sync_status);

COMMENT ON COLUMN public.empreendedorismo_respostas.hubspot_sync_status IS 'Status da sincronização com HubSpot: pending, processing, synced, error';
COMMENT ON COLUMN public.empreendedorismo_respostas.hubspot_contact_id IS 'ID do contato retornado pelo HubSpot CRM';
COMMENT ON COLUMN public.empreendedorismo_respostas.hubspot_synced_at IS 'Data/Hora em que a sincronização foi concluída com sucesso';
COMMENT ON COLUMN public.empreendedorismo_respostas.hubspot_sync_error IS 'Mensagem detalhada do último erro ocorrido na sincronização';
COMMENT ON COLUMN public.empreendedorismo_respostas.hubspot_sync_attempts IS 'Contador de tentativas de sincronização';
