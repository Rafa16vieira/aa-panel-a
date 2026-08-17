---
name: personalizar-theme
description: >-
  Altera cores, logo, favicon, tipografia ou config do mapa via
  src/theme/personalizar.ts e useTheme. Use when the user asks to change
  theme, brand colors, logo, favicon, nome do sistema, or personalização visual.
---

# Personalizar tema — Painel Alagoas

## Quando usar

Mudanças de identidade visual ou aparência do mapa/UI.

## Passos

1. **Perguntar** ao usuário o padrão de cores (se for paleta nova), conforme regra de estilo.
2. Editar **apenas** `src/theme/personalizar.ts`.
3. Colocar arquivos de logo/favicon em `public/` e atualizar paths em `personalizar`.
4. Se criar **nova chave** em `cores`:
   - Adicionar comentário de uso
   - Mapear em `src/hooks/useTheme.ts` para `--cor-*`
   - Usar `var(--cor-...)` / Tailwind com a variável no CSS
   - Atualizar `src/test/personalizar.test.ts` e `docs/PERSONALIZAR.md` se necessário
5. Não hardcodar hex em componentes.

## Checklist

- [ ] Só `personalizar.ts` (e `useTheme` se chave nova) mudou para marca/cores
- [ ] Logo/favicon apontam para `public/`
- [ ] Comentários nas cores novas
- [ ] Teste de personalizar passa
