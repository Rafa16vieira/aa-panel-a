export type AuthErro =
  | 'invalido'
  | 'pending'
  | 'usuario_existente'
  | 'usuario_senha_obrigatorios'
  | 'usuario_invalido'
  | 'nao_autorizado'
  | 'sessao_invalida'
  | 'senha_atual_invalida'
  | 'nao_encontrado'
  | 'nao_pode_excluir_a_si'
  | 'ultimo_admin';

export const AUTH_ERRO_MSG: Record<AuthErro, string> = {
  invalido: 'Usuário ou senha inválidos.',
  pending: 'Aguardando aprovação.',
  usuario_existente: 'Este usuário já existe.',
  usuario_senha_obrigatorios: 'Informe usuário e senha.',
  usuario_invalido: 'Usuário inválido. Use 3 a 40 caracteres (letras, números, ponto, _ ou -).',
  nao_autorizado: 'Sem permissão para esta ação.',
  sessao_invalida: 'Sessão expirada. Entre novamente.',
  senha_atual_invalida: 'Senha atual incorreta.',
  nao_encontrado: 'Usuário não encontrado.',
  nao_pode_excluir_a_si: 'Você não pode excluir a própria conta.',
  ultimo_admin: 'Não é possível excluir o último administrador.',
};

export function mensagemAuth(erro: string | undefined): string {
  if (erro && erro in AUTH_ERRO_MSG) {
    return AUTH_ERRO_MSG[erro as AuthErro];
  }
  return 'Não foi possível concluir. Tente novamente.';
}

export const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,40}$/;

export function validarCredenciais(username: string, password: string): AuthErro | null {
  const user = username.trim();
  if (!user || !password) return 'usuario_senha_obrigatorios';
  if (!USERNAME_PATTERN.test(user)) return 'usuario_invalido';
  return null;
}
