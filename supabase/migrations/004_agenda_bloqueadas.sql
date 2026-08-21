-- IDs de visitas da agenda removidas manualmente — o sync não as recria.
create table if not exists public.agenda_visitas_bloqueadas (
  id text primary key,
  created_at timestamptz not null default now()
);

alter table public.agenda_visitas_bloqueadas enable row level security;

drop policy if exists "agenda_visitas_bloqueadas_all_anon" on public.agenda_visitas_bloqueadas;
create policy "agenda_visitas_bloqueadas_all_anon" on public.agenda_visitas_bloqueadas
  for all to anon, authenticated
  using (true) with check (true);
