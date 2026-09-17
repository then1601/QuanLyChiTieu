create index if not exists transactions_user_date_idx
  on public.transactions (user_id, date desc);

create index if not exists categories_user_idx
  on public.categories (user_id);
