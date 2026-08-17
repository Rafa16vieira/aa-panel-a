import { useEffect } from 'react';
import { personalizar } from '../theme/personalizar';

export function useTheme() {
  useEffect(() => {
    const root = document.documentElement;
    const c = personalizar.cores;

    root.style.setProperty('--cor-fundo', c.fundo);
    root.style.setProperty('--cor-fundo-painel', c.fundoPainel);
    root.style.setProperty('--cor-primaria', c.primaria);
    root.style.setProperty('--cor-secundaria', c.secundaria);
    root.style.setProperty('--cor-destaque', c.destaque);
    root.style.setProperty('--cor-texto', c.texto);
    root.style.setProperty('--cor-texto-secundario', c.textoSecundario);
    root.style.setProperty('--cor-texto-claro', c.textoClaro);
    root.style.setProperty('--cor-borda', c.borda);
    root.style.setProperty('--cor-municipio-com-lideranca', c.municipioComLideranca);
    root.style.setProperty('--cor-municipio-visita-recente', c.municipioVisitaRecente);
    root.style.setProperty('--cor-heatmap-cobertura-min', c.heatmapCoberturaMin);
    root.style.setProperty('--cor-heatmap-cobertura-max', c.heatmapCoberturaMax);
    root.style.setProperty('--cor-municipio-sem-lideranca', c.municipioSemLideranca);
    root.style.setProperty('--cor-municipio-visita', c.municipioVisitaAgendada);
    root.style.setProperty('--cor-municipio-hover', c.municipioHover);
    root.style.setProperty('--cor-tooltip-fundo', c.tooltipFundo);
    root.style.setProperty('--cor-tooltip-texto', c.tooltipTexto);
    root.style.setProperty('--cor-painel-fundo', c.painelFundo);
    root.style.setProperty('--cor-input-fundo', c.inputFundo);
    root.style.setProperty('--cor-input-foco', c.inputFoco);
    root.style.setProperty('--cor-erro', c.erro);
    root.style.setProperty('--cor-sucesso', c.sucesso);
    root.style.setProperty('--cor-sombra', c.sombra);

    document.body.style.fontFamily = personalizar.tipografia.fonte;

    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = personalizar.favicon;

    document.title = personalizar.nomeSistema;
  }, []);
}
