
-- Company Evaluations table
CREATE TABLE IF NOT EXISTS public.company_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  summary TEXT,
  topics JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX idx_company_evaluations_company_id ON public.company_evaluations(company_id);

-- Enable RLS
ALTER TABLE public.company_evaluations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access" ON public.company_evaluations
  FOR SELECT USING (true);

-- Service role can insert/update (application logic handles this)
CREATE POLICY "Service role full access" ON public.company_evaluations
  USING (true)
  WITH CHECK (true);
