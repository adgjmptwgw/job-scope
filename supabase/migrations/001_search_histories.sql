-- Create the search_histories table
create table search_histories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  conditions jsonb not null,
  summary text not null,
  created_at timestamp with time zone default now() not null
);

-- Enable Row Level Security
alter table search_histories enable row level security;

-- Policies
create policy "Users can view their own search history"
  on search_histories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own search history"
  on search_histories for insert
  with check (auth.uid() = user_id);

-- Optional: Create an index for performance
create index search_histories_user_id_idx on search_histories(user_id);
create index search_histories_created_at_idx on search_histories(created_at desc);
