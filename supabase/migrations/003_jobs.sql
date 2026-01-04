-- Jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  location TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  skills JSONB DEFAULT '[]'::JSONB,
  source_url TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  crawled_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access" ON public.jobs
  FOR SELECT USING (is_active = true);
