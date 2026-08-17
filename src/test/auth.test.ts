import { beforeEach, describe, expect, it } from 'vitest';
import {
  localAdminAlterarSenha,
  localAdminAprovar,
  localAdminExcluir,
  localAdminListar,
  localAlterarSenha,
  localLogin,
  localRegister,
  localSessao,
} from '../services/authLocal';

const AUTH_KEY = 'painel-alagoas-auth';
const ADMIN_USER = 'rafael_vieira';
const ADMIN_PASS = 'Rafa*1601';

describe('Auth local — registro, aprovação e senha', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('admin seed consegue entrar', async () => {
    const result = await localLogin(ADMIN_USER, ADMIN_PASS);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.session.username).toBe(ADMIN_USER);
      expect(result.session.isAdmin).toBe(true);
    }
  });

  it('conta nova fica pendente e não entra', async () => {
    const created = await localRegister('novo_user', 'segredo1');
    expect(created.ok).toBe(true);

    const login = await localLogin('novo_user', 'segredo1');
    expect(login.ok).toBe(false);
    if (!login.ok) expect(login.erro).toBe('pending');
  });

  it('admin aprova e o usuário passa a entrar', async () => {
    await localRegister('maria_al', 'abc123');
    const admin = await localLogin(ADMIN_USER, ADMIN_PASS);
    expect(admin.ok).toBe(true);
    if (!admin.ok) return;

    const lista = await localAdminListar(admin.session.token);
    const pendente = lista.find((u) => u.username === 'maria_al');
    expect(pendente?.aprovado).toBe(false);

    const ok = await localAdminAprovar(admin.session.token, pendente!.id);
    expect(ok.ok).toBe(true);

    const login = await localLogin('maria_al', 'abc123');
    expect(login.ok).toBe(true);
  });

  it('usuário altera a própria senha', async () => {
    await localRegister('joao_al', 'antiga');
    const admin = await localLogin(ADMIN_USER, ADMIN_PASS);
    if (!admin.ok) throw new Error('admin');
    const lista = await localAdminListar(admin.session.token);
    const user = lista.find((u) => u.username === 'joao_al')!;
    await localAdminAprovar(admin.session.token, user.id);

    const sessao = await localLogin('joao_al', 'antiga');
    if (!sessao.ok) throw new Error('login');

    const changed = await localAlterarSenha(sessao.session.token, 'antiga', 'nova-senha');
    expect(changed.ok).toBe(true);

    const oldLogin = await localLogin('joao_al', 'antiga');
    expect(oldLogin.ok).toBe(false);

    const newLogin = await localLogin('joao_al', 'nova-senha');
    expect(newLogin.ok).toBe(true);
  });

  it('admin altera senha e exclui outro usuário', async () => {
    await localRegister('para_excluir', 'x12345');
    const admin = await localLogin(ADMIN_USER, ADMIN_PASS);
    if (!admin.ok) throw new Error('admin');

    const lista = await localAdminListar(admin.session.token);
    const alvo = lista.find((u) => u.username === 'para_excluir')!;
    await localAdminAprovar(admin.session.token, alvo.id);

    const senha = await localAdminAlterarSenha(admin.session.token, alvo.id, 'nova123');
    expect(senha.ok).toBe(true);

    const loginNovo = await localLogin('para_excluir', 'nova123');
    expect(loginNovo.ok).toBe(true);

    const del = await localAdminExcluir(admin.session.token, alvo.id);
    expect(del.ok).toBe(true);

    const loginDepois = await localLogin('para_excluir', 'nova123');
    expect(loginDepois.ok).toBe(false);
  });

  it('não deixa admin excluir a si mesmo', async () => {
    const admin = await localLogin(ADMIN_USER, ADMIN_PASS);
    if (!admin.ok) throw new Error('admin');
    const del = await localAdminExcluir(admin.session.token, admin.session.id);
    expect(del.ok).toBe(false);
    if (!del.ok) expect(del.erro).toBe('nao_pode_excluir_a_si');
  });

  it('sessão inválida não restaura usuário', async () => {
    const result = await localSessao('token-falso');
    expect(result.ok).toBe(false);
  });

  it('não persiste hash de senha na sessão', async () => {
    const result = await localLogin(ADMIN_USER, ADMIN_PASS);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.session).not.toHaveProperty('password_hash');
      expect(JSON.stringify(result.session)).not.toContain(ADMIN_PASS);
    }
    const stored = localStorage.getItem(AUTH_KEY) ?? '';
    expect(stored).not.toContain(ADMIN_PASS);
  });
});
