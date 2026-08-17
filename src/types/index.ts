/** Contratos de dados — definidos pelo Agente DBA. Todos os módulos devem aderir a estes tipos. */

/** Responsável padrão ao cadastrar liderança */
export const RESPONSAVEL_PADRAO = 'NTR';

export interface Cidade {
  id: string;
  nome: string;
}

export interface Lideranca {
  id: string;
  nome: string;
  cidade_id: string;
  quantidade_pessoas: number;
  /** Quem acompanha/é responsável pela liderança */
  responsavel: string;
}

export interface Visita {
  id: string;
  lideranca_id: string;
  data_hora: string | null;
  observacoes: string;
}

/** Cidade com todas as lideranças e visitas vinculadas (N:N). */
export interface CidadeComDados extends Cidade {
  liderancas: Lideranca[];
  visitas: Visita[];
}

export interface VisitaInput {
  /** Id existente ao editar; omitido ao criar nova visita */
  id?: string;
  data_hora: string | null;
  observacoes: string;
}

export interface LiderancaInput {
  nome: string;
  cidade_id: string;
  quantidade_pessoas: number;
  /** Default: NTR */
  responsavel: string;
  /** Uma liderança pode ter zero ou várias visitas */
  visitas: VisitaInput[];
}

export type CidadeStatus =
  | 'com_lideranca'
  | 'sem_lideranca'
  | 'visita_agendada'
  | 'visita_recente';

/** Sessão autenticada (sem senha). */
export interface AuthSession {
  token: string;
  id: string;
  username: string;
  isAdmin: boolean;
}

/** Usuário visível para o admin (sem hash de senha). */
export interface UsuarioPublico {
  id: string;
  username: string;
  isAdmin: boolean;
  aprovado: boolean;
  createdAt: string;
}

export interface GeoJsonFeatureProperties {
  id: string;
  name: string;
  description?: string;
}
