---
name: multiagent-orchestrate
description: >-
  Orquestra trabalho entre agentes DBA, Design, UI/UX, Dev, QA e CI/CD do
  Painel Alagoas. Use when the user asks to coordinate agents, planejar
  feature cross-cutting, handoff entre especialidades, or seguir AGENTS.md.
---

# Orquestração multiagente

Leia `.agents/AGENTS.md` e aplique a ordem:

1. DBA (tipos + rules) → 2. Design/personalizar → 3. UI/UX (fluxos) → 4. Dev → 5. QA → 6. CI/CD

## Ao iniciar uma demanda

- Classificar qual(is) agente(s) são donos.
- Listar impactos em outros (tipos, tema, mapa, CI).
- Não implementar UI antes de contratos se o schema mudar.
- Não “finalizar” sem `npm run lint && npm run test && npm run build`.

## Handoffs

- **DBA → Dev:** diff em `src/types` + `supabase/migrations`
- **Design → Dev:** chaves em `personalizar.ts` + arquivos em `public/`
- **UI/UX → Dev:** fluxo (hover/click/form) e estados visuais
- **Dev → QA:** o que mudou + como reproduzir
- **QA → CI/CD:** aprovação explícita para deploy

## Skills relacionadas

- `personalizar-theme` — identidade visual
- `feature-mapa-lideranca` — mapa/formulário/dados
- `qa-painel-alagoas` — validação
