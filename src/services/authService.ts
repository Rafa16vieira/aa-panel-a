import type { AuthSession, UsuarioPublico } from '../types';
import { getSupabase, isSupabaseConfigured } from './supabase';
import type { AuthErro } from './authErrors';
import { validarCredenciais } from './authErrors';
import {
  localAdminAlterarSenha,
  localAdminAprovar,
  localAdminExcluir,
  localAdminListar,
  localAlterarSenha,
  localLogin,
  localLogout,
  localRegister,
  localSessao,
  type AuthFail,
  type AuthOk,
  type LoginResult,
  type RegisterResult,
} from './authLocal';

const SESSION_KEY = 'painel-alagoas-session';

type RpcJson = {
  ok?: boolean;
  erro?: string;
  status?: string;
  token?: string;
  id?: string;
  username?: string;
  is_admin?: boolean;
};

let remoteAuthEnabled = true;

function authRemote(): boolean {
  return isSupabaseConfigured() && remoteAuthEnabled;
}

function isMissingRpc(error: unknown): boolean {
  const err = error as { code?: string; message?: string };
  return err?.code === 'PGRST202' || /could not find the function/i.test(err?.message ?? '');
}

function asErro(code: string | undefined): AuthErro {
  return (code as AuthErro) ?? 'invalido';
}

function fail(erro: AuthErro): AuthFail {
  return { ok: false, erro };
}

function sessionFromRpc(data: RpcJson, token: string): AuthSession {
  return {
    token,
    id: String(data.id),
    username: String(data.username),
    isAdmin: Boolean(data.is_admin),
  };
}

export function readStoredToken(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function writeStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(SESSION_KEY, token);
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await getSupabase().rpc(fn, args);
  if (error) throw error;
  return data as T;
}

async function withAuthBackend<T>(remote: () => Promise<T>, local: () => Promise<T>): Promise<T> {
  if (!authRemote()) return local();
  try {
    return await remote();
  } catch (error) {
    if (isMissingRpc(error)) {
      remoteAuthEnabled = false;
      return local();
    }
    throw error;
  }
}

export async function registerAccount(
  username: string,
  password: string,
): Promise<RegisterResult> {
  const erro = validarCredenciais(username, password);
  if (erro) return fail(erro);

  return withAuthBackend(async () => {
    const data = await rpc<RpcJson>('auth_registrar', {
      p_username: username.trim(),
      p_senha: password,
    });
    if (!data?.ok) return fail(asErro(data?.erro));
    return { ok: true, status: 'pending' };
  }, () => localRegister(username, password));
}

export async function login(username: string, password: string): Promise<LoginResult> {
  const erro = validarCredenciais(username, password);
  if (erro) return fail(erro);

  const result = await withAuthBackend(async () => {
    const data = await rpc<RpcJson>('auth_login', {
      p_username: username.trim(),
      p_senha: password,
    });
    if (!data?.ok) return fail(asErro(data?.erro));
    return { ok: true as const, session: sessionFromRpc(data, String(data.token)) };
  }, () => localLogin(username, password));

  if (result.ok) writeStoredToken(result.session.token);
  return result;
}

export async function restoreSession(): Promise<LoginResult> {
  const token = readStoredToken();
  if (!token) return fail('sessao_invalida');

  try {
    const result = await withAuthBackend(
      async () => {
        const data = await rpc<RpcJson>('auth_sessao', { p_token: token });
        if (!data?.ok) return fail(asErro(data?.erro));
        return { ok: true as const, session: sessionFromRpc(data, token) };
      },
      () => localSessao(token),
    );
    if (!result.ok) writeStoredToken(null);
    return result;
  } catch {
    writeStoredToken(null);
    return fail('sessao_invalida');
  }
}

export async function logout(): Promise<void> {
  const token = readStoredToken();
  writeStoredToken(null);
  if (!token) return;

  await withAuthBackend(
    async () => {
      await rpc<RpcJson>('auth_logout', { p_token: token });
      return undefined;
    },
    () => localLogout(token).then(() => undefined),
  ).catch(() => undefined);
}

export async function changeOwnPassword(
  atual: string,
  nova: string,
): Promise<AuthOk | AuthFail> {
  const token = readStoredToken();
  if (!token) return fail('sessao_invalida');
  if (!nova) return fail('usuario_senha_obrigatorios');

  return withAuthBackend(
    async () => {
      const data = await rpc<RpcJson>('auth_alterar_senha', {
        p_token: token,
        p_atual: atual,
        p_nova: nova,
      });
      if (!data?.ok) return fail(asErro(data?.erro));
      return { ok: true };
    },
    () => localAlterarSenha(token, atual, nova),
  );
}

export async function adminListUsers(): Promise<UsuarioPublico[]> {
  const token = readStoredToken();
  if (!token) return [];

  return withAuthBackend(async () => {
    const rows = await rpc<
      { id: string; username: string; is_admin: boolean; aprovado: boolean; created_at: string }[]
    >('auth_admin_listar', { p_token: token });

    return (rows ?? []).map((row) => ({
      id: row.id,
      username: row.username,
      isAdmin: row.is_admin,
      aprovado: row.aprovado,
      createdAt: row.created_at,
    }));
  }, () => localAdminListar(token));
}

export async function adminApproveUser(usuarioId: string): Promise<AuthOk | AuthFail> {
  const token = readStoredToken();
  if (!token) return fail('sessao_invalida');

  return withAuthBackend(
    async () => {
      const data = await rpc<RpcJson>('auth_admin_aprovar', {
        p_token: token,
        p_usuario_id: usuarioId,
      });
      if (!data?.ok) return fail(asErro(data?.erro));
      return { ok: true };
    },
    () => localAdminAprovar(token, usuarioId),
  );
}

export async function adminChangeUserPassword(
  usuarioId: string,
  nova: string,
): Promise<AuthOk | AuthFail> {
  const token = readStoredToken();
  if (!token) return fail('sessao_invalida');
  if (!nova) return fail('usuario_senha_obrigatorios');

  return withAuthBackend(
    async () => {
      const data = await rpc<RpcJson>('auth_admin_alterar_senha', {
        p_token: token,
        p_usuario_id: usuarioId,
        p_nova: nova,
      });
      if (!data?.ok) return fail(asErro(data?.erro));
      return { ok: true };
    },
    () => localAdminAlterarSenha(token, usuarioId, nova),
  );
}

export async function adminDeleteUser(usuarioId: string): Promise<AuthOk | AuthFail> {
  const token = readStoredToken();
  if (!token) return fail('sessao_invalida');

  return withAuthBackend(
    async () => {
      const data = await rpc<RpcJson>('auth_admin_excluir', {
        p_token: token,
        p_usuario_id: usuarioId,
      });
      if (!data?.ok) return fail(asErro(data?.erro));
      return { ok: true };
    },
    () => localAdminExcluir(token, usuarioId),
  );
}
