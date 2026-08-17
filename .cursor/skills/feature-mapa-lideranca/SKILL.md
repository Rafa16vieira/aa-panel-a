---
name: feature-mapa-lideranca
description: >-
  Implementa ou altera fluxos do mapa Leaflet, painel de cidade, formulário
  de liderança e sync em tempo real. Use when working on municípios, hover,
  tooltip, CityPanel, LiderancaForm, visitas, ou dataService/store.
---

# Feature mapa / liderança

## Contratos

Respeitar `src/types/index.ts`. Liderança **sempre** com `cidade_id` válido. Visita opcional (`data_hora: null` → UI "Não há agendamento").

## Onde mexer

| Camada | Arquivos típicos |
|--------|------------------|
| UI mapa | `components/map/AlagoasMap.tsx`, `CityPanel.tsx` |
| Form | `components/forms/LiderancaForm.tsx`, pages de liderança |
| Estado | `store/useAppStore.ts` (`getCidadeStatus`, panel open/close) |
| Dados | `services/dataService.ts`, `hooks/useRealtimeData.ts` |
| Cores mapa | `theme/personalizar.ts` (`municipio*`, tooltip) |

## Fluxos obrigatórios

1. Hover município → tooltip (liderança, pessoas, visita)
2. Clique → painel com detalhes + link para edição
3. Salvar form → store/Firestore → mapa atualiza cor/status sem reload
4. Status via `getCidadeStatus`, não campo persistido de cor

## Estilo

Tailwind v4 + `src/styles.css` para compartilhado; cores só via `personalizar` / `var(--cor-*)`.

## Depois de implementar

Rodar skill `qa-painel-alagoas` (lint + test + build).
