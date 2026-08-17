import { describe, it, expect } from 'vitest';
import type { LiderancaInput, AuthSession } from '../types';
import { RESPONSAVEL_PADRAO } from '../types';

describe('Contratos de dados (DBA)', () => {
  it('LiderancaInput exige cidade_id vinculado', () => {
    const input: LiderancaInput = {
      nome: 'Teste',
      cidade_id: '2704302',
      quantidade_pessoas: 15,
      responsavel: RESPONSAVEL_PADRAO,
      visitas: [],
    };
    expect(input.cidade_id).toBeTruthy();
    expect(typeof input.cidade_id).toBe('string');
  });

  it('responsável padrão é NTR', () => {
    expect(RESPONSAVEL_PADRAO).toBe('NTR');
  });

  it('sessão de auth não inclui senha', () => {
    const session: AuthSession = {
      id: 'u1',
      token: 't1',
      username: 'rafael_vieira',
      isAdmin: true,
    };
    expect(session).not.toHaveProperty('password');
    expect(session.isAdmin).toBe(true);
  });

  it('aceita múltiplas visitas por liderança, inclusive sem agendamento', () => {
    const input: LiderancaInput = {
      nome: 'Teste',
      cidade_id: '2704302',
      quantidade_pessoas: 15,
      responsavel: 'Equipe A',
      visitas: [
        { data_hora: null, observacoes: '' },
        { id: 'v-existente', data_hora: '2026-08-10T14:00:00', observacoes: 'retorno' },
      ],
    };
    expect(input.visitas).toHaveLength(2);
    expect(input.visitas[0].data_hora).toBeNull();
    expect(input.visitas[1].id).toBe('v-existente');
    expect(input.responsavel).toBe('Equipe A');
  });
});
