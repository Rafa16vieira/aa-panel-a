import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { saveLideranca, deleteLideranca } from '../../services/dataService';
import { RESPONSAVEL_PADRAO } from '../../types';
import './LiderancaForm.css';

interface VisitaFormRow {
  key: string;
  id?: string;
  data_hora: string;
  observacoes: string;
}

function newVisitaRow(partial?: Partial<VisitaFormRow>): VisitaFormRow {
  return {
    key: partial?.key ?? crypto.randomUUID(),
    id: partial?.id,
    data_hora: partial?.data_hora ?? '',
    observacoes: partial?.observacoes ?? '',
  };
}

export interface LiderancaFormProps {
  /** Quando true, não usa rotas — ideal para pop-up. */
  embedded?: boolean;
  /** Prefill de cidade (ex.: botão + na listagem). */
  initialCidadeId?: string;
  /** Id da liderança ao editar no pop-up. */
  liderancaId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function LiderancaForm({
  embedded = false,
  initialCidadeId,
  liderancaId: liderancaIdProp,
  onSuccess,
  onCancel,
}: LiderancaFormProps = {}) {
  const { id: idParam } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = embedded ? liderancaIdProp : idParam;
  const isEditing = Boolean(id);
  const retorno = searchParams.get('retorno');

  const cidades = useAppStore((s) => s.cidades);
  const liderancas = useAppStore((s) => s.liderancas);
  const visitas = useAppStore((s) => s.visitas);

  const cidadeInicial =
    initialCidadeId ?? (!embedded ? (searchParams.get('cidade') ?? '') : '');

  const [nome, setNome] = useState('');
  const [cidadeId, setCidadeId] = useState(cidadeInicial);
  const [quantidadePessoas, setQuantidadePessoas] = useState(0);
  const [responsavel, setResponsavel] = useState(RESPONSAVEL_PADRAO);
  const [visitasForm, setVisitasForm] = useState<VisitaFormRow[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (embedded && !liderancaIdProp) {
      setNome('');
      setCidadeId(initialCidadeId ?? '');
      setQuantidadePessoas(0);
      setResponsavel(RESPONSAVEL_PADRAO);
      setVisitasForm([]);
      setErrors({});
    }
  }, [embedded, initialCidadeId, liderancaIdProp]);

  useEffect(() => {
    if (isEditing && id) {
      const lideranca = liderancas.find((l) => l.id === id);
      if (lideranca) {
        setNome(lideranca.nome);
        setCidadeId(lideranca.cidade_id);
        setQuantidadePessoas(lideranca.quantidade_pessoas);
        setResponsavel(lideranca.responsavel?.trim() || RESPONSAVEL_PADRAO);
        const liderancaVisitas = visitas.filter((v) => v.lideranca_id === id);
        setVisitasForm(
          liderancaVisitas.map((v) =>
            newVisitaRow({
              key: v.id,
              id: v.id,
              data_hora: v.data_hora ? v.data_hora.slice(0, 16) : '',
              observacoes: v.observacoes ?? '',
            }),
          ),
        );
      }
    }
  }, [id, isEditing, liderancas, visitas]);

  const cidadesOrdenadas = useMemo(
    () => [...cidades].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [cidades],
  );

  function resolveRetorno(fallback: string): string {
    if (retorno && retorno.startsWith('/') && !retorno.startsWith('//')) {
      return retorno;
    }
    return fallback;
  }

  function finishSuccess() {
    if (embedded) {
      onSuccess?.();
      return;
    }
    navigate(resolveRetorno('/mapa'));
  }

  function finishCancel() {
    if (embedded) {
      onCancel?.();
      return;
    }
    navigate(resolveRetorno('/liderancas'));
  }

  function updateVisita(key: string, patch: Partial<VisitaFormRow>) {
    setVisitasForm((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function removeVisita(key: string) {
    setVisitasForm((rows) => rows.filter((r) => r.key !== key));
  }

  function addVisita() {
    setVisitasForm((rows) => [...rows, newVisitaRow()]);
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!nome.trim()) errs.nome = 'Nome da liderança é obrigatório';
    if (!cidadeId) errs.cidade_id = 'Selecione uma cidade';
    if (quantidadePessoas < 0) errs.quantidade_pessoas = 'Quantidade inválida';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await saveLideranca(
        {
          nome,
          cidade_id: cidadeId,
          quantidade_pessoas: quantidadePessoas,
          responsavel,
          visitas: visitasForm.map((v) => ({
            id: v.id,
            data_hora: v.data_hora ? new Date(v.data_hora).toISOString() : null,
            observacoes: v.observacoes,
          })),
        },
        isEditing ? id : undefined,
      );
      finishSuccess();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id || !confirm('Excluir esta liderança e todas as suas visitas?')) return;
    setSaving(true);
    try {
      await deleteLideranca(id);
      if (embedded) {
        onSuccess?.();
      } else {
        navigate('/liderancas');
      }
    } finally {
      setSaving(false);
    }
  }

  const formIdPrefix = embedded ? 'modal-' : '';

  return (
    <div className={`form-page${embedded ? ' form-page--embedded' : ''}`}>
      {!embedded && <h2>{isEditing ? 'Editar Liderança' : 'Nova Liderança'}</h2>}

      <form
        className={`lideranca-form${embedded ? ' lideranca-form--embedded' : ''}`}
        onSubmit={handleSubmit}
      >
        <div className="form-group">
          <label htmlFor={`${formIdPrefix}nome`}>Nome da liderança *</label>
          <input
            id={`${formIdPrefix}nome`}
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: João Silva"
            autoFocus={embedded}
          />
          {errors.nome && <span className="form-error">{errors.nome}</span>}
        </div>

        <div className="form-group">
          <label htmlFor={`${formIdPrefix}cidade`}>Cidade *</label>
          <select
            id={`${formIdPrefix}cidade`}
            value={cidadeId}
            onChange={(e) => setCidadeId(e.target.value)}
          >
            <option value="">Selecione uma cidade</option>
            {cidadesOrdenadas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          {errors.cidade_id && <span className="form-error">{errors.cidade_id}</span>}
          <span className="form-hint">A mesma cidade pode ter várias lideranças.</span>
        </div>

        <div className="form-group">
          <label htmlFor={`${formIdPrefix}quantidade`}>Quantidade de pessoas *</label>
          <input
            id={`${formIdPrefix}quantidade`}
            type="number"
            min={0}
            value={quantidadePessoas}
            onChange={(e) => setQuantidadePessoas(Number(e.target.value))}
          />
          {errors.quantidade_pessoas && (
            <span className="form-error">{errors.quantidade_pessoas}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor={`${formIdPrefix}responsavel`}>Responsável *</label>
          <input
            id={`${formIdPrefix}responsavel`}
            type="text"
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
            placeholder={RESPONSAVEL_PADRAO}
          />
          <span className="form-hint">Padrão: {RESPONSAVEL_PADRAO}</span>
        </div>

        <fieldset className="visitas-fieldset">
          <legend>Visitas</legend>
          <p className="form-hint visitas-fieldset__hint">
            Uma liderança pode ter várias visitas. Ficam em aberto até a data ser anterior à atual
            (sem data também conta como em aberto).
          </p>

          {visitasForm.length === 0 && (
            <p className="visitas-empty">Nenhuma visita cadastrada.</p>
          )}

          {visitasForm.map((visita, index) => (
            <div key={visita.key} className="visita-row">
              <div className="visita-row__header">
                <span className="visita-row__title">Visita {index + 1}</span>
                <button
                  type="button"
                  className="btn-link-danger"
                  onClick={() => removeVisita(visita.key)}
                >
                  Remover
                </button>
              </div>
              <div className="form-group">
                <label htmlFor={`${formIdPrefix}visita-data-${visita.key}`}>Data/hora</label>
                <input
                  id={`${formIdPrefix}visita-data-${visita.key}`}
                  type="datetime-local"
                  value={visita.data_hora}
                  onChange={(e) => updateVisita(visita.key, { data_hora: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor={`${formIdPrefix}visita-obs-${visita.key}`}>Observações</label>
                <textarea
                  id={`${formIdPrefix}visita-obs-${visita.key}`}
                  value={visita.observacoes}
                  onChange={(e) => updateVisita(visita.key, { observacoes: e.target.value })}
                  rows={2}
                  placeholder="Informações adicionais sobre a visita..."
                />
              </div>
            </div>
          ))}

          <button type="button" className="btn-secondary" onClick={addVisita}>
            Adicionar visita
          </button>
        </fieldset>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
          <button type="button" className="btn-secondary" onClick={finishCancel}>
            Cancelar
          </button>
          {isEditing && (
            <button type="button" className="btn-danger" onClick={handleDelete} disabled={saving}>
              Excluir
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
