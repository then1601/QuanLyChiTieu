create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null check (amount > 0),
  type text not null check (type in ('income', 'expense')),
  category_id text not null,
  date timestamptz not null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Users can read their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can create their own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);
