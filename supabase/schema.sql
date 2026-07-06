-- Выполнить в Supabase: SQL Editor -> New query -> вставить целиком -> Run

create extension if not exists "pgcrypto";

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  category text not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12,2) not null check (amount > 0),
  comment text,
  created_at timestamptz default now()
);

create index if not exists idx_transactions_date on transactions(date);

-- Пара примеров категорий для старта (можно удалить/дополнить прямо в приложении)
insert into categories (name) values
  ('Еда'), ('Транспорт'), ('Спортзал / абонементы'), ('Зарплата')
on conflict (name) do nothing;

-- Личное использование без входа: разрешаем anon-ключу читать и писать.
-- Не публикуй этот сайт широко — ссылка = полный доступ к твоим данным.
alter table categories enable row level security;
alter table transactions enable row level security;

create policy "anon full access categories" on categories
  for all using (true) with check (true);

create policy "anon full access transactions" on transactions
  for all using (true) with check (true);
