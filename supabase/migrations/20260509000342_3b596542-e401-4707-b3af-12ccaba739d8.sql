
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avg_deal_size numeric,
  ADD COLUMN IF NOT EXISTS monthly_revenue_target numeric,
  ADD COLUMN IF NOT EXISTS years_experience integer,
  ADD COLUMN IF NOT EXISTS biggest_challenge text,
  ADD COLUMN IF NOT EXISTS primary_property_type text,
  ADD COLUMN IF NOT EXISTS deals_last_quarter integer;
