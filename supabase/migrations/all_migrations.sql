
-- 001_search_histories.sql
create table if not exists search_histories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  conditions jsonb not null,
  summary text not null,
  created_at timestamp with time zone default now() not null
);

alter table search_histories enable row level security;

create policy "Users can view their own search history"
  on search_histories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own search history"
  on search_histories for insert
  with check (auth.uid() = user_id);
  
-- 002_companies.sql
create table if not exists companies (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    logo_url text, -- Optional
    tags text[] default '{}',
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

alter table companies enable row level security;

create policy "Companies are viewable by everyone"
    on companies for select
    using (true);

-- 003_jobs.sql
create table if not exists jobs (
    id uuid default gen_random_uuid() primary key,
    company_id uuid references companies(id) on delete cascade not null,
    title text not null,
    location text not null,
    salary_min integer not null, -- Stored as integer (e.g., 5000000 for 5M)
    salary_max integer not null,
    skills text[] default '{}',
    description text not null,
    requirements text[] default '{}',
    work_styles text[] default '{}', -- Remote, Hybrid, etc.
    source_url text not null,
    ai_matching_score float, -- Optional AI score
    is_active boolean default true,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

alter table jobs enable row level security;

create policy "Jobs are viewable by everyone"
    on jobs for select
    using (true);

-- 004_job_favorites.sql
create table if not exists job_favorites (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    job_id uuid references jobs(id) on delete cascade not null,
    created_at timestamp with time zone default now() not null,
    unique(user_id, job_id)
);

alter table job_favorites enable row level security;

create policy "Users can view their own favorites"
    on job_favorites for select
    using (auth.uid() = user_id);

create policy "Users can add their own favorites"
    on job_favorites for insert
    with check (auth.uid() = user_id);

create policy "Users can remove their own favorites"
    on job_favorites for delete
    using (auth.uid() = user_id);
