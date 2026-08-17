# Relatório de Testes QA — Painel Alagoas

**Data:** 03/08/2026  
**Status:** Aprovado para integração

## Casos de teste automatizados

| ID | Caso | Resultado |
|----|------|-----------|
| QA-01 | Arquivo `personalizar` define cores, favicon e logo | ✅ Passou |
| QA-02 | Cidade sem liderança retorna status `sem_lideranca` | ✅ Passou |
| QA-03 | Cidade com liderança retorna status `com_lideranca` | ✅ Passou |
| QA-04 | Cidade com visita agendada retorna status `visita_agendada` | ✅ Passou |
| QA-05 | Vínculo liderança ↔ cidade via `cidade_id` | ✅ Passou |
| QA-06 | Texto "Não há agendamento" quando `data_hora` é null | ✅ Passou |
| QA-07 | Contratos DBA — LiderancaInput com cidade obrigatória | ✅ Passou |

## Casos de teste manuais (checklist)

| ID | Fluxo | Como testar | Esperado |
|----|-------|-------------|----------|
| QA-08 | Hover no mapa | Passar mouse sobre município | Tooltip com nome, liderança, pessoas e visita |
| QA-09 | Clique no mapa | Clicar em município | Painel lateral com dados completos |
| QA-10 | Cadastro de liderança | Menu → Lideranças → preencher form | Mapa atualiza cor do município |
| QA-11 | Edição de liderança | Clicar cidade com liderança → Editar | Dados carregados no formulário |
| QA-12 | Tempo real (Supabase) | Abrir 2 abas, salvar em uma | Segunda aba atualiza sem reload |
| QA-13 | Personalização | Alterar cor em `personalizar.ts` | Toda UI reflete a mudança |
| QA-14 | Favicon/logo | Trocar paths em `personalizar.ts` | Novo favicon e logo no header |
| QA-15 | Validação formulário | Enviar form vazio | Mensagens de erro exibidas |
| QA-16 | Responsividade | Redimensionar janela | Layout adapta em mobile |

## Regressão entre agentes

- **DBA → Dev:** Tipos em `src/types/index.ts` usados por store, services e forms ✅
- **Design → Dev:** Cores centralizadas em `personalizar.ts`, CSS usa variáveis ✅
- **UI/UX → Dev:** Fluxos mapa → painel → edição implementados ✅
- **CI/CD → QA:** Pipeline executa lint + test + build antes de deploy ✅

## Ambientes

| Ambiente | Modo dados | Deploy |
|----------|-----------|--------|
| Desenvolvimento | Local (localStorage) ou Supabase (.env) | `npm run dev` |
| Homologação | Supabase (branch develop) | GitHub Actions |
| Produção | Supabase (branch main) | GitHub Pages |

## Observações

- Sem variáveis Supabase, o sistema opera em modo local com persistência via localStorage.
- GeoJSON de municípios carregado de `/public/geo/alagoas-municipios.geojson` (102 municípios).
