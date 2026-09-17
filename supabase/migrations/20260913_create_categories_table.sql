create table if not exists public.categories (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default 'category',
  color text not null default '#5C6BC0',
  type text not null check (type in ('income', 'expense')),
  created_at timestamptz not null default now()
);

create index if not exists categories_user_idx
  on public.categories (user_id);

alter table public.categories enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'categories'
      and policyname = 'Users can read their own categories'
  ) then
    create policy "Users can read their own categories"
      on public.categories for select
      to authenticated
      using ((select auth.uid()) = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'categories'
      and policyname = 'Users can create their own categories'
  ) then
    create policy "Users can create their own categories"
      on public.categories for insert
      to authenticated
      with check ((select auth.uid()) = user_id);
  end if;
end
$$;

notify pgrst, 'reload schema';
