CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.whatsapp_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  phone_number_id TEXT,
  access_token TEXT,
  verify_token TEXT,
  business_phone TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected',
  last_event_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own wa select" ON public.whatsapp_integrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own wa insert" ON public.whatsapp_integrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own wa update" ON public.whatsapp_integrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own wa delete" ON public.whatsapp_integrations FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_wa_integrations_updated_at
BEFORE UPDATE ON public.whatsapp_integrations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS wa_message_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS conversations_wa_message_id_uniq ON public.conversations(wa_message_id) WHERE wa_message_id IS NOT NULL;
