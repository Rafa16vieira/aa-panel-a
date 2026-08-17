-- Painel Alagoas — schema inicial (Supabase / Postgres)
-- Execute no SQL Editor do projeto Supabase (ou via CLI de migrations).

-- Tabelas
create table if not exists public.cidades (
  id text primary key,
  nome text not null
);

create table if not exists public.liderancas (
  id text primary key,
  nome text not null,
  cidade_id text not null references public.cidades (id),
  quantidade_pessoas integer not null default 0 check (quantidade_pessoas >= 0),
  responsavel text not null default 'NTR'
);

create table if not exists public.visitas (
  id text primary key,
  lideranca_id text not null references public.liderancas (id) on delete cascade,
  data_hora timestamptz null,
  observacoes text not null default ''
);

create index if not exists liderancas_cidade_id_idx on public.liderancas (cidade_id);
create index if not exists visitas_lideranca_id_idx on public.visitas (lideranca_id);

-- RLS (painel interno sem auth — espelha regras abertas do Firestore antigo).
-- Restrinja depois se o projeto exigir autenticação.
alter table public.cidades enable row level security;
alter table public.liderancas enable row level security;
alter table public.visitas enable row level security;

drop policy if exists "cidades_all_anon" on public.cidades;
create policy "cidades_all_anon" on public.cidades
  for all to anon, authenticated
  using (true) with check (true);

drop policy if exists "liderancas_all_anon" on public.liderancas;
create policy "liderancas_all_anon" on public.liderancas
  for all to anon, authenticated
  using (true) with check (true);

drop policy if exists "visitas_all_anon" on public.visitas;
create policy "visitas_all_anon" on public.visitas
  for all to anon, authenticated
  using (true) with check (true);

-- Realtime (ignora erro se a tabela já estiver na publication)
do $$
begin
  alter publication supabase_realtime add table public.cidades;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.liderancas;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.visitas;
exception when duplicate_object then null;
end $$;
