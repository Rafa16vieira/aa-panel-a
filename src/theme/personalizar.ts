/**
 * ARQUIVO DE PERSONALIZAÇÃO CENTRAL — Painel Alagoas
 *
 * Altere cores, favicon e logo APENAS neste arquivo.
 * Nenhum componente deve definir cores ou ativos visuais diretamente.
 */

export const personalizar = {
  /** Caminho do favicon exibido na aba do navegador */
  favicon: '/aafavicon.png',

  /** Caminho da logo exibida no cabeçalho do dashboard */
  logo: '/MARCA_PRINCIPAL.png',

  /** Nome exibido ao lado da logo */
  nomeSistema: 'Painel AA',

  cores: {
    /** Cor de fundo principal da aplicação */
    fundo: '#F0F4F8',

    /** Cor de fundo do cabeçalho e barra lateral */
    fundoPainel: '#FFFFFF',

    /** Cor primária — botões principais, links ativos, destaques */
    primaria: '#1B4D7A',

    /** Cor secundária — elementos de apoio, badges */
    secundaria: '#E87722',

    /** Cor de destaque — ícones, indicadores importantes */
    destaque: '#FFD166',

    /** Cor de texto principal em fundos claros */
    texto: '#1A2332',

    /** Cor de texto secundário — legendas, placeholders */
    textoSecundario: '#5A6B7D',

    /** Cor de texto em fundos escuros (botões primários, header escuro) */
    textoClaro: '#FFFFFF',

    /** Cor de borda de cards, inputs e divisores */
    borda: '#D8E2EC',

    /** Cor de município COM liderança cadastrada no mapa */
    municipioComLideranca: '#2D8A4E',

    /** Cor de município com visita realizada nos últimos 30 dias (verde mais escuro) */
    municipioVisitaRecente: '#07361b',

    /** Cor de município SEM liderança cadastrada no mapa */
    municipioSemLideranca: '#B8C5D0',

    /**
     * Heatmap cobertura: cor da menor taxa (com liderança).
     * Verde de `municipioComLideranca` — contraste com `municipioSemLideranca`.
     * A maior taxa usa heatmapCoberturaMax.
     */
    heatmapCoberturaMin: '#2D8A4E',

    /**
     * Heatmap cobertura: cor da maior taxa.
     * Verde quase preto — alarga o degradê para o meio termo contrastar.
     */
    heatmapCoberturaMax: '#010805',

    /** Heatmap: município sem liderança — mesma cor do mapa de status */
    heatmapSemLideranca: '#B8C5D0',

    /** Cor de município com visita agendada no mapa */
    municipioVisitaAgendada: '#4A90D9',

    /** Cor de hover ao passar o mouse sobre um município no mapa */
    municipioHover: '#FFD166',

    /** Cor da borda/contorno dos municípios no mapa */
    municipioBorda: '#FFFFFF',

    /** Cor de fundo do tooltip flutuante no mapa */
    tooltipFundo: '#1A2332',

    /** Cor de texto do tooltip flutuante no mapa */
    tooltipTexto: '#FFFFFF',

    /** Cor de fundo do painel lateral/modal de detalhes da cidade */
    painelFundo: '#FFFFFF',

    /** Cor de fundo de inputs e campos de formulário */
    inputFundo: '#FFFFFF',

    /** Cor de borda de inputs em foco */
    inputFoco: '#1B4D7A',

    /** Cor de mensagem de erro/validação */
    erro: '#D64545',

    /** Cor de mensagem de sucesso */
    sucesso: '#2D8A4E',

    /** Cor de sombra suave para cards e modais */
    sombra: 'rgba(26, 35, 50, 0.12)',
  },

  tipografia: {
    /** Família tipográfica principal */
    fonte: "'Segoe UI', system-ui, -apple-system, sans-serif",
  },

  mapa: {
    /** Zoom inicial do mapa de Alagoas */
    zoomInicial: 8,
    /** Centro geográfico aproximado de Alagoas [lat, lng] */
    centro: [-9.5713, -36.782] as [number, number],
    /** Peso da borda municipal no mapa */
    pesoBorda: 1.5,
  },
} as const;

export type Personalizar = typeof personalizar;
