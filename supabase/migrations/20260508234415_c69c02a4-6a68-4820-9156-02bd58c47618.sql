
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  whatsapp_number TEXT,
  city TEXT,
  agents_count INT,
  monthly_lead_volume TEXT,
  logo_url TEXT,
  persona TEXT DEFAULT 'abuja_closer',
  language TEXT DEFAULT 'english_ng',
  ai_model TEXT DEFAULT 'google/gemini-2.5-flash',
  max_followups INT DEFAULT 3,
  response_delay INT DEFAULT 5,
  site_visit_cta TEXT,
  price_objection_response TEXT,
  closing_triggers TEXT,
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Properties
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plot_id TEXT,
  name TEXT,
  location TEXT,
  size_sqm NUMERIC,
  price NUMERIC,
  title_type TEXT,
  status TEXT DEFAULT 'available',
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  occupation TEXT,
  phone TEXT,
  budget_min NUMERIC,
  budget_max NUMERIC,
  location_preference TEXT,
  source TEXT,
  intent_score INT DEFAULT 0,
  stage TEXT DEFAULT 'cold',
  notes TEXT,
  current_strategy TEXT,
  current_objective TEXT,
  psych_profile TEXT,
  next_move TEXT,
  risk_signals TEXT,
  ai_paused BOOLEAN DEFAULT false,
  last_touch_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Conversations
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  message_text TEXT NOT NULL,
  annotation TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Objection rules
CREATE TABLE public.objection_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_phrase TEXT NOT NULL,
  response_script TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Market tags
CREATE TABLE public.market_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Campaigns
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT,
  budget NUMERIC DEFAULT 0,
  date_start DATE,
  date_end DATE,
  leads_count INT DEFAULT 0,
  cpl NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objection_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Generic owner policies
CREATE POLICY "own_profiles" ON public.profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_properties" ON public.properties FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_leads" ON public.leads FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_conversations" ON public.conversations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_objection_rules" ON public.objection_rules FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_market_tags" ON public.market_tags FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_campaigns" ON public.campaigns FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('company-logos', 'company-logos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('legal-documents', 'legal-documents', false);

CREATE POLICY "logos_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'company-logos');
CREATE POLICY "logos_own_write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "logos_own_update" ON storage.objects FOR UPDATE USING (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "docs_own_read" ON storage.objects FOR SELECT USING (bucket_id = 'legal-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "docs_own_write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'legal-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "docs_own_delete" ON storage.objects FOR DELETE USING (bucket_id = 'legal-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
