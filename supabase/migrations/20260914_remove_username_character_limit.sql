alter table public.profiles
  drop constraint if exists profiles_username_check;

create or replace function public.get_auth_email_by_username(p_username text)
returns text
language sql
security definer
set search_path = public, auth
as $$
  select u.email
  from auth.users as u
  join public.profiles as p on p.id = u.id
  where p.username = lower(trim(p_username))
  limit 1;
$$;

revoke all on function public.get_auth_email_by_username(text) from public;
grant execute on function public.get_auth_email_by_username(text) to anon, authenticated;

insert into public.profiles (id, username)
select
  u.id,
  lower(trim(u.raw_user_meta_data ->> 'username'))
from auth.users as u
where nullif(trim(u.raw_user_meta_data ->> 'username'), '') is not null
on conflict (id) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, lower(trim(new.raw_user_meta_data ->> 'username')))
  on conflict (id) do update
    set username = excluded.username;
  return new;
end;
$$;
