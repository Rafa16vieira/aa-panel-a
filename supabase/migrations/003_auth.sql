-- Autenticação por usuário/senha com aprovação do admin.
-- Senhas: pgcrypto (bcrypt). Tabelas não são acessíveis via PostgREST;
-- o cliente só chama as funções auth_*.

create extension if not exists pgcrypto;
set search_path = public, extensions;

create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  password_hash text not null,
  is_admin boolean not null default false,
  aprovado boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists usuarios_username_lower_idx
  on public.usuarios (lower(username));

create table if not exists public.sessoes (
  token uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists sessoes_usuario_id_idx on public.sessoes (usuario_id);

alter table public.usuarios enable row level security;
alter table public.sessoes enable row level security;

revoke all on table public.usuarios from public, anon, authenticated;
revoke all on table public.sessoes from public, anon, authenticated;

drop function if exists public._auth_usuario_por_token(uuid);
drop function if exists public.auth_registrar(text, text);
drop function if exists public.auth_login(text, text);
drop function if exists public.auth_sessao(uuid);
drop function if exists public.auth_logout(uuid);
drop function if exists public.auth_alterar_senha(uuid, text, text);
drop function if exists public.auth_admin_listar(uuid);
drop function if exists public.auth_admin_aprovar(uuid, uuid);
drop function if exists public.auth_admin_alterar_senha(uuid, uuid, text);
drop function if exists public.auth_admin_excluir(uuid, uuid);

create or replace function public._auth_usuario_por_token(p_token uuid)
returns public.usuarios
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  u public.usuarios;
begin
  select usr.* into u
  from public.sessoes s
  join public.usuarios usr on usr.id = s.usuario_id
  where s.token = p_token;

  if not found then
    return null;
  end if;

  return u;
end;
$$;

revoke all on function public._auth_usuario_por_token(uuid) from public, anon, authenticated;

create or replace function public.auth_registrar(p_username text, p_senha text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user text;
begin
  v_user := trim(both from coalesce(p_username, ''));

  if v_user = '' or p_senha is null or length(p_senha) < 1 then
    return jsonb_build_object('ok', false, 'erro', 'usuario_senha_obrigatorios');
  end if;

  if v_user !~ '^[A-Za-z0-9._-]{3,40}$' then
    return jsonb_build_object('ok', false, 'erro', 'usuario_invalido');
  end if;

  if exists (select 1 from public.usuarios where lower(username) = lower(v_user)) then
    return jsonb_build_object('ok', false, 'erro', 'usuario_existente');
  end if;

  insert into public.usuarios (username, password_hash, is_admin, aprovado)
  values (v_user, crypt(p_senha, gen_salt('bf')), false, false);

  return jsonb_build_object('ok', true, 'status', 'pending');
end;
$$;

create or replace function public.auth_login(p_username text, p_senha text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  u public.usuarios;
  v_token uuid;
begin
  select * into u
  from public.usuarios
  where lower(username) = lower(trim(both from coalesce(p_username, '')));

  if not found or u.password_hash <> crypt(coalesce(p_senha, ''), u.password_hash) then
    return jsonb_build_object('ok', false, 'erro', 'invalido');
  end if;

  if not u.aprovado then
    return jsonb_build_object('ok', false, 'erro', 'pending');
  end if;

  insert into public.sessoes (usuario_id) values (u.id) returning token into v_token;

  return jsonb_build_object(
    'ok', true,
    'token', v_token,
    'id', u.id,
    'username', u.username,
    'is_admin', u.is_admin
  );
end;
$$;

create or replace function public.auth_sessao(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  u public.usuarios;
begin
  u := public._auth_usuario_por_token(p_token);

  if u is null or not u.aprovado then
    return jsonb_build_object('ok', false, 'erro', 'sessao_invalida');
  end if;

  return jsonb_build_object(
    'ok', true,
    'token', p_token,
    'id', u.id,
    'username', u.username,
    'is_admin', u.is_admin
  );
end;
$$;

create or replace function public.auth_logout(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  delete from public.sessoes where token = p_token;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.auth_alterar_senha(p_token uuid, p_atual text, p_nova text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  u public.usuarios;
begin
  u := public._auth_usuario_por_token(p_token);

  if u is null then
    return jsonb_build_object('ok', false, 'erro', 'sessao_invalida');
  end if;

  if p_nova is null or length(p_nova) < 1 then
    return jsonb_build_object('ok', false, 'erro', 'usuario_senha_obrigatorios');
  end if;

  if u.password_hash <> crypt(coalesce(p_atual, ''), u.password_hash) then
    return jsonb_build_object('ok', false, 'erro', 'senha_atual_invalida');
  end if;

  update public.usuarios
  set password_hash = crypt(p_nova, gen_salt('bf'))
  where id = u.id;

  delete from public.sessoes where usuario_id = u.id and token <> p_token;

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.auth_admin_listar(p_token uuid)
returns table (
  id uuid,
  username text,
  is_admin boolean,
  aprovado boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  u public.usuarios;
begin
  u := public._auth_usuario_por_token(p_token);

  if u is null or not u.is_admin then
    return;
  end if;

  return query
  select usr.id, usr.username, usr.is_admin, usr.aprovado, usr.created_at
  from public.usuarios usr
  order by usr.aprovado asc, lower(usr.username) asc;
end;
$$;

create or replace function public.auth_admin_aprovar(p_token uuid, p_usuario_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  u public.usuarios;
  updated int;
begin
  u := public._auth_usuario_por_token(p_token);

  if u is null or not u.is_admin then
    return jsonb_build_object('ok', false, 'erro', 'nao_autorizado');
  end if;

  update public.usuarios
  set aprovado = true
  where id = p_usuario_id;

  get diagnostics updated = row_count;

  if updated = 0 then
    return jsonb_build_object('ok', false, 'erro', 'nao_encontrado');
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.auth_admin_alterar_senha(p_token uuid, p_usuario_id uuid, p_nova text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  u public.usuarios;
  updated int;
begin
  u := public._auth_usuario_por_token(p_token);

  if u is null or not u.is_admin then
    return jsonb_build_object('ok', false, 'erro', 'nao_autorizado');
  end if;

  if p_nova is null or length(p_nova) < 1 then
    return jsonb_build_object('ok', false, 'erro', 'usuario_senha_obrigatorios');
  end if;

  update public.usuarios
  set password_hash = crypt(p_nova, gen_salt('bf'))
  where id = p_usuario_id;

  get diagnostics updated = row_count;

  if updated = 0 then
    return jsonb_build_object('ok', false, 'erro', 'nao_encontrado');
  end if;

  delete from public.sessoes where usuario_id = p_usuario_id;

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.auth_admin_excluir(p_token uuid, p_usuario_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  u public.usuarios;
  alvo public.usuarios;
  admin_count int;
begin
  u := public._auth_usuario_por_token(p_token);

  if u is null or not u.is_admin then
    return jsonb_build_object('ok', false, 'erro', 'nao_autorizado');
  end if;

  if u.id = p_usuario_id then
    return jsonb_build_object('ok', false, 'erro', 'nao_pode_excluir_a_si');
  end if;

  select * into alvo from public.usuarios where id = p_usuario_id;

  if not found then
    return jsonb_build_object('ok', false, 'erro', 'nao_encontrado');
  end if;

  if alvo.is_admin then
    select count(*) into admin_count from public.usuarios where is_admin;
    if admin_count <= 1 then
      return jsonb_build_object('ok', false, 'erro', 'ultimo_admin');
    end if;
  end if;

  delete from public.usuarios where id = p_usuario_id;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.auth_registrar(text, text) to anon, authenticated;
grant execute on function public.auth_login(text, text) to anon, authenticated;
grant execute on function public.auth_sessao(uuid) to anon, authenticated;
grant execute on function public.auth_logout(uuid) to anon, authenticated;
grant execute on function public.auth_alterar_senha(uuid, text, text) to anon, authenticated;
grant execute on function public.auth_admin_listar(uuid) to anon, authenticated;
grant execute on function public.auth_admin_aprovar(uuid, uuid) to anon, authenticated;
grant execute on function public.auth_admin_alterar_senha(uuid, uuid, text) to anon, authenticated;
grant execute on function public.auth_admin_excluir(uuid, uuid) to anon, authenticated;

insert into public.usuarios (username, password_hash, is_admin, aprovado)
select 'rafael_vieira', crypt('Rafa*1601', gen_salt('bf')), true, true
where not exists (
  select 1 from public.usuarios where lower(username) = 'rafael_vieira'
);
