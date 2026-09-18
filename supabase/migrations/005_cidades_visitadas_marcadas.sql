-- Marcações manuais de "cidade já visitada" (sem criar registro de visita).
create table if not exists public.cidades_visitadas_marcadas (
  cidade_id text primary key references public.cidades (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.cidades_visitadas_marcadas enable row level security;

drop policy if exists "cidades_visitadas_marcadas_all_anon" on public.cidades_visitadas_marcadas;
create policy "cidades_visitadas_marcadas_all_anon" on public.cidades_visitadas_marcadas
  for all to anon, authenticated
  using (true) with check (true);

do $$
begin
  alter publication supabase_realtime add table public.cidades_visitadas_marcadas;
exception when duplicate_object then null;
end $$;
