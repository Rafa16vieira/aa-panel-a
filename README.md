# Painel Alagoas

Sistema web de Business Intelligence para visualização geográfica e gestão de lideranças por município no estado de Alagoas, Brasil.

## Funcionalidades

- Mapa interativo com todos os 102 municípios de Alagoas
- Hover com tooltip (liderança, pessoas, status de visita)
- Clique abre painel lateral com detalhes e link para edição
- Cadastro/edição de lideranças vinculadas obrigatoriamente a uma cidade
- Login por usuário e senha, com aprovação do administrador
- Agenda da campanha ([Google Doc](https://docs.google.com/document/d/1-I4OUgSi9dbPdJUxfBrQW0Oq0KAg37PetH4G6lULlFY/edit)) sincronizada 1× ao dia com as visitas, vinculadas à liderança responsável
- Sincronização em tempo real (Supabase) ou modo local (localStorage)
- Personalização visual centralizada em `src/theme/personalizar.ts`

## Início rápido

```bash
npm install
npm run dev
```

Acesse http://localhost:5173

## Supabase (produção)

1. Crie um projeto no [Supabase](https://supabase.com)
2. No SQL Editor, execute as migrations em `supabase/migrations/` (`001_init.sql`, `002_lideranca_responsavel.sql`, `003_auth.sql`)
3. Copie `.env.example` para `.env` e preencha:
   - `VITE_SUPABASE_URL` — Project URL
   - `VITE_SUPABASE_ANON_KEY` — anon public key (Settings → API)
4. Recarregue o app; o header deve mostrar **Supabase**

Sem `.env`, o sistema funciona em modo local com persistência no navegador.

> As policies RLS das tabelas de liderança ainda são abertas no script inicial. O acesso à UI exige login (`003_auth.sql`).

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run test` | Testes automatizados (QA) |
| `npm run lint` | Verificação de código |
| `npm run sync:agenda` | Baixa a agenda da campanha e grava visitas no Supabase |

## Personalização

Veja [docs/PERSONALIZAR.md](docs/PERSONALIZAR.md) para alterar cores, logo e favicon.

## Arquitetura

```
src/
├── types/          # Contratos de dados (DBA)
├── theme/          # personalizar.ts — identidade visual
├── services/       # Supabase + dataService
├── store/          # Zustand (estado global)
├── components/     # Mapa, formulários, layout
├── pages/          # Dashboard, formulário
└── hooks/          # Tempo real, tema
```

## CI/CD

Pipeline GitHub Actions (`.github/workflows/ci.yml`):
- Lint → Testes → Build em PRs e pushes
- Deploy automático para GitHub Pages na branch `main`
- Agenda da campanha: `.github/workflows/sync-agenda.yml` (1× ao dia + disparo manual)
- Secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Relatório QA

[docs/QA-REPORT.md](docs/QA-REPORT.md)
