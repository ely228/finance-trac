-- обнова с акками

do $$
declare
  first_user uuid;
begin
  select id into first_user from auth.users order by created_at asc limit 1;

  if first_user is null then
    raise exception 'В проекте пока нет ни одного пользователя. Сначала зарегистрируйся в приложении (экран входа → «Создать аккаунт»), потом запусти эту миграцию ещё раз.';
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'categories' and column_name = 'user_id') then
    alter table categories add column user_id uuid references auth.users(id) on delete cascade;
    update categories set user_id = first_user where user_id is null;
    alter table categories alter column user_id set not null;
    alter table categories alter column user_id set default auth.uid();
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'transactions' and column_name = 'user_id') then
    alter table transactions add column user_id uuid references auth.users(id) on delete cascade;
    update transactions set user_id = first_user where user_id is null;
    alter table transactions alter column user_id set not null;
    alter table transactions alter column user_id set default auth.uid();
  end if;
end $$;

alter table categories drop constraint if exists categories_name_key;
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'categories_user_id_name_key'
  ) then
    alter table categories add constraint categories_user_id_name_key unique (user_id, name);
  end if;
end $$;

create index if not exists idx_transactions_user on transactions(user_id);
create index if not exists idx_categories_user on categories(user_id);

drop policy if exists "anon full access categories" on categories;
drop policy if exists "anon full access transactions" on transactions;
drop policy if exists "own categories" on categories;
drop policy if exists "own transactions" on transactions;

create policy "own categories" on categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own transactions" on transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
