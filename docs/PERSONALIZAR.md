# Personalização Visual — Painel Alagoas

Todas as customizações visuais do sistema estão centralizadas em um único arquivo:

```
src/theme/personalizar.ts
```

## Como alterar cores

1. Abra `src/theme/personalizar.ts`
2. Localize o objeto `cores`
3. Altere o valor hexadecimal da cor desejada
4. Cada cor possui um comentário indicando exatamente onde é usada

Exemplo — mudar a cor de municípios com liderança:

```typescript
/** Cor de município COM liderança cadastrada no mapa */
municipioComLideranca: '#50e689ff',  // ← altere aqui
```

As cores são propagadas automaticamente via CSS custom properties no hook `useTheme`.

## Como alterar o favicon

1. Coloque seu arquivo em `public/` (ex: `public/meu-favicon.svg`)
2. Atualize em `personalizar.ts`:

```typescript
favicon: '/meu-favicon.svg',
```

## Como alterar a logo

1. Coloque seu arquivo em `public/` (ex: `public/minha-logo.svg`)
2. Atualize em `personalizar.ts`:

```typescript
logo: '/minha-logo.svg',
```

## Regra importante

Nenhum componente deve definir cores, favicon ou logo diretamente. Sempre importe de `personalizar.ts`:

```typescript
import { personalizar } from '../theme/personalizar';
```

## Nome do sistema

Altere `nomeSistema` em `personalizar.ts` para mudar o título da aba e o texto do cabeçalho.
