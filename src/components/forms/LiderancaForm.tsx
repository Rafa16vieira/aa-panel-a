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

export function LiderancaForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const cidades = useAppStore((s) => s.cidades);
  const liderancas = useAppStore((s) => s.liderancas);
  const visitas = useAppStore((s) => s.visitas);

  const [nome, setNome] = useState('');
  const [cidadeId, setCidadeId] = useState(searchParams.get('cidade') ?? '');
  const [quantidadePessoas, setQuantidadePessoas] = useState(0);
  const [responsavel, setResponsavel] = useState(RESPONSAVEL_PADRAO);
  const [visitasForm, setVisitasForm] = useState<VisitaFormRow[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

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
      navigate('/mapa');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id || !confirm('Excluir esta liderança e todas as suas visitas?')) return;
    setSaving(true);
    try {
      await deleteLideranca(id);
      navigate('/liderancas');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="form-page">
      <h2>{isEditing ? 'Editar Liderança' : 'Nova Liderança'}</h2>

      <form className="lideranca-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nome">Nome da liderança *</label>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: João Silva"
          />
          {errors.nome && <span className="form-error">{errors.nome}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="cidade">Cidade *</label>
          <select
            id="cidade"
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
          <label htmlFor="quantidade">Quantidade de pessoas *</label>
          <input
            id="quantidade"
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
          <label htmlFor="responsavel">Responsável *</label>
          <input
            id="responsavel"
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
                <label htmlFor={`visita-data-${visita.key}`}>Data/hora</label>
                <input
                  id={`visita-data-${visita.key}`}
                  type="datetime-local"
                  value={visita.data_hora}
                  onChange={(e) => updateVisita(visita.key, { data_hora: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor={`visita-obs-${visita.key}`}>Observações</label>
                <textarea
                  id={`visita-obs-${visita.key}`}
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
          <button type="button" className="btn-secondary" onClick={() => navigate('/liderancas')}>
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
