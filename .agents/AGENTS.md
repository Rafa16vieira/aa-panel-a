# Painel Alagoas — Agentes

Orienta o trabalho multiagente neste repositório. Toda decisão deve ser compatível com os demais; nenhuma entrega pode quebrar contratos, tema ou CI.

## Ordem de integração (não negociável)

1. **DBA** define/altera contratos em `src/types/index.ts` (+ migration SQL se necessário).
2. **Design** entrega paleta/ativos; Dev aplica só via `src/theme/personalizar.ts`.
3. **UI/UX** define fluxos antes de novos componentes.
4. **Dev Sênior** implementa e revisa integração mapa ↔ form ↔ store ↔ banco.
5. **QA** valida (automatizado + checklist) antes de considerar pronto.
6. **CI/CD** só trata deploy após QA verde (`lint` → `test` → `build`).

## Equipe

### 1. Dev Sênior (Arquiteto / Full-stack)

- Arquitetura: `src/` (types, theme, services, store, hooks, components, pages).
- Estado: Zustand; dados: `dataService` (Supabase ou localStorage).
- Garante fluxo mapa ↔ formulário ↔ persistência em tempo real.
- Revisa entregas dos outros antes do merge.

### 2. UI/UX

- Fluxos: hover → tooltip; clique → painel; cadastro/edição de liderança.
- Estados: `sem_lideranca` | `com_lideranca` | `visita_agendada`; texto **"Não há agendamento"** quando `data_hora` é null.
- Desktop primeiro; responsividade básica; transições discretas.

### 3. CI/CD

- Pipeline: `.github/workflows/ci.yml` — lint, testes, build; deploy GitHub Pages na `main`.
- Env: `.env.example` / Supabase; sem `.env` o app roda em modo local.
- Não liberar deploy com testes falhando.

### 4. Design gráfico

- Identidade em `personalizar.ts` + arquivos em `public/` (logo, favicon).
- Cores comentadas por uso; sem hardcode em componentes.
- Ver skill `personalizar-theme` e `docs/PERSONALIZAR.md`.

### 5. DBA

- Coleções: `cidades`, `liderancas`, `visitas`, `usuarios` (login + aprovação).
- Integridade: liderança exige `cidade_id` existente; visita exige `lideranca_id` existente.
- Tipos TypeScript alinhados ao schema SQL (`supabase/migrations`).
- Status visual do município é **calculado**, não persistido.

### 6. QA

- Casos em `src/test/` e checklist em `docs/QA-REPORT.md`.
- Regressão entre agentes: tipos ↔ store/services; personalizar ↔ UI; mapa ↔ edição; CI ↔ QA.
- Comandos: `npm run lint`, `npm run test`, `npm run build`.

## Escopo do produto (lembrete)

BI geográfico de lideranças nos 102 municípios de Alagoas: mapa interativo, cadastro vinculado a cidade, sync em tempo real, personalização centralizada.
