---
name: qa-painel-alagoas
description: >-
  Executa e interpreta QA do Painel Alagoas (lint, Vitest, build, checklist
  de mapa/liderança/personalizar). Use when the user asks for QA, testes,
  regressão, validação antes de merge/deploy, or atualizar docs/QA-REPORT.md.
---

# QA — Painel Alagoas

## Comandos

```bash
npm run lint
npm run test
npm run build
```

Só considerar aprovado se os três passarem.

## Automatizado (`src/test/`)

Cobrir no mínimo:

- `personalizar` define cores, favicon, logo
- Status: `sem_lideranca` / `com_lideranca` / `visita_agendada`
- Vínculo `lideranca.cidade_id`
- Texto de visita sem data → "Não há agendamento"
- Contratos `LiderancaInput` com cidade obrigatória

## Manual (resumo)

Ver `docs/QA-REPORT.md`: hover/tooltip, clique/painel, CRUD liderança, sync 2 abas (Supabase), troca de cor/logo, validação de form, mobile.

## Regressão entre agentes

| Origem | Verificar |
|--------|-----------|
| DBA | Tipos usados em store, services, forms |
| Design | Só `personalizar` + CSS vars |
| UI/UX | Mapa → painel → edição |
| CI | Workflow ainda roda lint/test/build |

## Saída

Resumir: o que rodou, falhas, riscos, e se está ok para integração/deploy.
