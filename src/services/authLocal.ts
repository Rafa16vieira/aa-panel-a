import type { AuthSession, UsuarioPublico } from '../types';
import type { AuthErro } from './authErrors';
import { validarCredenciais } from './authErrors';

const STORAGE_KEY = 'painel-alagoas-auth';
const ADMIN_USERNAME = 'rafael_vieira';
const ADMIN_PASSWORD = 'Rafa*1601';
const HASH_PREFIX = 'painel-alagoas-auth-v1';

interface LocalUsuario {
  id: string;
  username: string;
  password_hash: string;
  is_admin: boolean;
  aprovado: boolean;
  created_at: string;
}

interface LocalSessao {
  token: string;
  usuario_id: string;
}

interface LocalAuthStore {
  usuarios: LocalUsuario[];
  sessoes: LocalSessao[];
}

export type AuthOk = { ok: true };
export type AuthFail = { ok: false; erro: AuthErro };
export type LoginOk = { ok: true; session: AuthSession };
export type LoginResult = LoginOk | AuthFail;
export type RegisterResult = { ok: true; status: 'pending' } | AuthFail;

function emptyStore(): LocalAuthStore {
  return { usuarios: [], sessoes: [] };
}

function loadStore(): LocalAuthStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as LocalAuthStore;
  } catch {
    /* ignore */
  }
  return emptyStore();
}

function saveStore(store: LocalAuthStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`${HASH_PREFIX}:${password}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function ensureAdmin(store: LocalAuthStore): Promise<LocalAuthStore> {
  const exists = store.usuarios.some(
    (u) => u.username.toLowerCase() === ADMIN_USERNAME.toLowerCase(),
  );
  if (exists) return store;

  store.usuarios.push({
    id: crypto.randomUUID(),
    username: ADMIN_USERNAME,
    password_hash: await hashPassword(ADMIN_PASSWORD),
    is_admin: true,
    aprovado: true,
    created_at: new Date().toISOString(),
  });
  saveStore(store);
  return store;
}

function findByUsername(store: LocalAuthStore, username: string): LocalUsuario | undefined {
  const key = username.trim().toLowerCase();
  return store.usuarios.find((u) => u.username.toLowerCase() === key);
}

function findByToken(store: LocalAuthStore, token: string): LocalUsuario | undefined {
  const sessao = store.sessoes.find((s) => s.token === token);
  if (!sessao) return undefined;
  return store.usuarios.find((u) => u.id === sessao.usuario_id);
}

function toSession(user: LocalUsuario, token: string): AuthSession {
  return {
    token,
    id: user.id,
    username: user.username,
    isAdmin: user.is_admin,
  };
}

function toPublic(user: LocalUsuario): UsuarioPublico {
  return {
    id: user.id,
    username: user.username,
    isAdmin: user.is_admin,
    aprovado: user.aprovado,
    createdAt: user.created_at,
  };
}

export async function localRegister(
  username: string,
  password: string,
): Promise<RegisterResult> {
  const erro = validarCredenciais(username, password);
  if (erro) return { ok: false, erro };

  const store = await ensureAdmin(loadStore());
  if (findByUsername(store, username)) {
    return { ok: false, erro: 'usuario_existente' };
  }

  store.usuarios.push({
    id: crypto.randomUUID(),
    username: username.trim(),
    password_hash: await hashPassword(password),
    is_admin: false,
    aprovado: false,
    created_at: new Date().toISOString(),
  });
  saveStore(store);
  return { ok: true, status: 'pending' };
}

export async function localLogin(username: string, password: string): Promise<LoginResult> {
  const erro = validarCredenciais(username, password);
  if (erro) return { ok: false, erro };

  const store = await ensureAdmin(loadStore());
  const user = findByUsername(store, username);
  const hash = await hashPassword(password);

  if (!user || user.password_hash !== hash) {
    return { ok: false, erro: 'invalido' };
  }
  if (!user.aprovado) {
    return { ok: false, erro: 'pending' };
  }

  const token = crypto.randomUUID();
  store.sessoes.push({ token, usuario_id: user.id });
  saveStore(store);
  return { ok: true, session: toSession(user, token) };
}

export async function localSessao(token: string): Promise<LoginResult> {
  const store = await ensureAdmin(loadStore());
  const user = findByToken(store, token);
  if (!user || !user.aprovado) {
    return { ok: false, erro: 'sessao_invalida' };
  }
  return { ok: true, session: toSession(user, token) };
}

export async function localLogout(token: string): Promise<AuthOk> {
  const store = loadStore();
  store.sessoes = store.sessoes.filter((s) => s.token !== token);
  saveStore(store);
  return { ok: true };
}

export async function localAlterarSenha(
  token: string,
  atual: string,
  nova: string,
): Promise<AuthOk | AuthFail> {
  if (!nova) return { ok: false, erro: 'usuario_senha_obrigatorios' };

  const store = await ensureAdmin(loadStore());
  const user = findByToken(store, token);
  if (!user) return { ok: false, erro: 'sessao_invalida' };

  const atualHash = await hashPassword(atual);
  if (user.password_hash !== atualHash) {
    return { ok: false, erro: 'senha_atual_invalida' };
  }

  user.password_hash = await hashPassword(nova);
  store.sessoes = store.sessoes.filter((s) => s.usuario_id !== user.id || s.token === token);
  saveStore(store);
  return { ok: true };
}

export async function localAdminListar(token: string): Promise<UsuarioPublico[]> {
  const store = await ensureAdmin(loadStore());
  const admin = findByToken(store, token);
  if (!admin?.is_admin) return [];

  return [...store.usuarios]
    .sort((a, b) => {
      if (a.aprovado !== b.aprovado) return a.aprovado ? 1 : -1;
      return a.username.localeCompare(b.username, 'pt-BR');
    })
    .map(toPublic);
}

export async function localAdminAprovar(
  token: string,
  usuarioId: string,
): Promise<AuthOk | AuthFail> {
  const store = await ensureAdmin(loadStore());
  const admin = findByToken(store, token);
  if (!admin?.is_admin) return { ok: false, erro: 'nao_autorizado' };

  const alvo = store.usuarios.find((u) => u.id === usuarioId);
  if (!alvo) return { ok: false, erro: 'nao_encontrado' };

  alvo.aprovado = true;
  saveStore(store);
  return { ok: true };
}

export async function localAdminAlterarSenha(
  token: string,
  usuarioId: string,
  nova: string,
): Promise<AuthOk | AuthFail> {
  if (!nova) return { ok: false, erro: 'usuario_senha_obrigatorios' };

  const store = await ensureAdmin(loadStore());
  const admin = findByToken(store, token);
  if (!admin?.is_admin) return { ok: false, erro: 'nao_autorizado' };

  const alvo = store.usuarios.find((u) => u.id === usuarioId);
  if (!alvo) return { ok: false, erro: 'nao_encontrado' };

  alvo.password_hash = await hashPassword(nova);
  store.sessoes = store.sessoes.filter((s) => s.usuario_id !== usuarioId);
  saveStore(store);
  return { ok: true };
}

export async function localAdminExcluir(
  token: string,
  usuarioId: string,
): Promise<AuthOk | AuthFail> {
  const store = await ensureAdmin(loadStore());
  const admin = findByToken(store, token);
  if (!admin?.is_admin) return { ok: false, erro: 'nao_autorizado' };
  if (admin.id === usuarioId) return { ok: false, erro: 'nao_pode_excluir_a_si' };

  const alvo = store.usuarios.find((u) => u.id === usuarioId);
  if (!alvo) return { ok: false, erro: 'nao_encontrado' };

  if (alvo.is_admin) {
    const adminCount = store.usuarios.filter((u) => u.is_admin).length;
    if (adminCount <= 1) return { ok: false, erro: 'ultimo_admin' };
  }

  store.usuarios = store.usuarios.filter((u) => u.id !== usuarioId);
  store.sessoes = store.sessoes.filter((s) => s.usuario_id !== usuarioId);
  saveStore(store);
  return { ok: true };
}
