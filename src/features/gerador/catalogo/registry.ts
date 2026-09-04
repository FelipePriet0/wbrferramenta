/**
 * Quais modelos já tiveram o texto extraído para catálogo — ou seja, quais são
 * editáveis pela plataforma.
 *
 * A extração é incremental de propósito: os 47 modelos continuam funcionando
 * normalmente, e um entra aqui quando suas frases saem do render. Um modelo
 * ausente deste mapa simplesmente não mostra o botão Editar, e é assim que a
 * tela fica honesta sobre o que dá e o que não dá para mudar hoje.
 */
import type { Catalogo } from './tipos';
import { MANUT_SINAL_ALTO } from './manutSinalAlto';
import { ALTPLAN_PRESENCIAL } from './altplanPresencial';
import { ALTPLAN_REMOTO } from './altplanRemoto';
import { ALTPLAN_SEM_TROCA_VISITA_ISENTA } from './altplanSemTrocaVisitaIsenta';
import { ALTPLAN_SEM_TROCA_VISITA_PAGA } from './altplanSemTrocaVisitaPaga';
import { ALTPLAN_TROCA_VISITA_ISENTA } from './altplanTrocaVisitaIsenta';
import { ALTPLAN_TROCA_VISITA_PAGA } from './altplanTrocaVisitaPaga';
import { MANUT_VISITA_TESTES } from './manutVisitaTestes';
import { MANUT_LUZ_VERMELHA_PJ } from './manutLuzVermelhaPj';
import { MANUT_ROTEADOR_RESET } from './manutRoteadorReset';
import { MANUT_FONTE_QUEIMADA } from './manutFonteQueimada';
import { MANUT_ONU_QUEIMADA } from './manutOnuQueimada';
import { MANUT_ONT_QUEIMADA } from './manutOntQueimada';
import { MANUT_ROTEADOR_QUEIMADO } from './manutRoteadorQueimado';
import { MANUT_OCAS_FIBRA } from './manutOcasFibra';
import { MANUT_LUZ_VERMELHA_ISENTO } from './manutLuzVermelhaIsento';
import { MANUT_REALOC_FIBRA } from './manutRealocFibra';
import { MANUT_MUD_PONTO_INT } from './manutMudPontoInt';
import { MANUT_OCAS_CONECTOR } from './manutOcasConector';
import { MANUT_FIBRA_EXTERNA } from './manutFibraExterna';
import { MANUT_LUZ_VERMELHA } from './manutLuzVermelha';
import { FEEDBACK_SEM_SUCESSO } from './feedbackSemSucesso';
import { FEEDBACK_MAN_OCASIONADO } from './feedbackManOcasionado';
import { FEEDBACK_MAN_EXTERNA } from './feedbackManExterna';
import { FEEDBACK_TROCA_EQUIP } from './feedbackTrocaEquip';
import { FEEDBACK_MUDANCA_PONTO } from './feedbackMudancaPonto';
import { FEEDBACK_STB_ROKU } from './feedbackStbRoku';
import { FEEDBACK_ALTPLAN } from './feedbackAltplan';
import { FEEDBACK_WIFI_EXTEND } from './feedbackWifiExtend';
import { SENHA_ALTERA_SENHA } from './senhaAlteraSenha';
import { TERMO_RESP_PADRAO } from './termoRespPadrao';
import { MIDIA_ROKU_PADRAO } from './midiaRokuPadrao';
import { MIDIA_ROKU_PRESENCIAL } from './midiaRokuPresencial';
import { MIDIA_STB_PADRAO } from './midiaStbPadrao';
import { WIFI_EXTEND_ZTE } from './wifiExtendZte';
import { WIFI_EXTEND_TPLINK } from './wifiExtendTplink';
import { WIFI_EXTEND_PONTO } from './wifiExtendPonto';
import { ENCE_PADRAO_CASA } from './encePadraoCasa';
import { ENCE_PADRAO_EMPRESA } from './encePadraoEmpresa';
import { ENCE_PADRAO_CASA_EXTEND } from './encePadraoCasaExtend';
import { ENCE_ALTPLAN_REMOTO } from './enceAltplanRemoto';
import { INST_GRATIS_RESIDENCIAL } from './instGratisResidencial';
import { INST_GRATIS_EMPRESARIAL } from './instGratisEmpresarial';
import { INST_TAXA_RESIDENCIAL } from './instTaxaResidencial';
import { INST_TAXA_EMPRESARIAL } from './instTaxaEmpresarial';

const CATALOGOS: Record<string, Catalogo> = {
  'manut-sinal-alto': MANUT_SINAL_ALTO,
  'altplan-presencial': ALTPLAN_PRESENCIAL,
  'altplan-remoto': ALTPLAN_REMOTO,
  'altplan-sem-troca-visita-isenta': ALTPLAN_SEM_TROCA_VISITA_ISENTA,
  'altplan-sem-troca-visita-paga': ALTPLAN_SEM_TROCA_VISITA_PAGA,
  'altplan-troca-visita-isenta': ALTPLAN_TROCA_VISITA_ISENTA,
  'altplan-troca-visita-paga': ALTPLAN_TROCA_VISITA_PAGA,
  'manut-visita-testes': MANUT_VISITA_TESTES,
  'manut-luz-vermelha-pj': MANUT_LUZ_VERMELHA_PJ,
  'manut-roteador-reset': MANUT_ROTEADOR_RESET,
  'manut-fonte-queimada': MANUT_FONTE_QUEIMADA,
  'manut-onu-queimada': MANUT_ONU_QUEIMADA,
  'manut-ont-queimada': MANUT_ONT_QUEIMADA,
  'manut-roteador-queimado': MANUT_ROTEADOR_QUEIMADO,
  'manut-ocas-fibra': MANUT_OCAS_FIBRA,
  'manut-luz-vermelha-isento': MANUT_LUZ_VERMELHA_ISENTO,
  'manut-realoc-fibra': MANUT_REALOC_FIBRA,
  'manut-mud-ponto-int': MANUT_MUD_PONTO_INT,
  'manut-ocas-conector': MANUT_OCAS_CONECTOR,
  'manut-fibra-externa': MANUT_FIBRA_EXTERNA,
  'manut-luz-vermelha': MANUT_LUZ_VERMELHA,
  'feedback-sem-sucesso': FEEDBACK_SEM_SUCESSO,
  'feedback-man-ocasionado': FEEDBACK_MAN_OCASIONADO,
  'feedback-man-externa': FEEDBACK_MAN_EXTERNA,
  'feedback-troca-equip': FEEDBACK_TROCA_EQUIP,
  'feedback-mudanca-ponto': FEEDBACK_MUDANCA_PONTO,
  'feedback-stb-roku': FEEDBACK_STB_ROKU,
  'feedback-altplan': FEEDBACK_ALTPLAN,
  'feedback-wifi-extend': FEEDBACK_WIFI_EXTEND,
  'senha-altera-senha': SENHA_ALTERA_SENHA,
  'termo-resp-padrao': TERMO_RESP_PADRAO,
  'midia-roku-padrao': MIDIA_ROKU_PADRAO,
  'midia-roku-presencial': MIDIA_ROKU_PRESENCIAL,
  'midia-stb-padrao': MIDIA_STB_PADRAO,
  'wifi-extend-zte': WIFI_EXTEND_ZTE,
  'wifi-extend-tplink': WIFI_EXTEND_TPLINK,
  'wifi-extend-ponto': WIFI_EXTEND_PONTO,
  'ence-padrao-casa': ENCE_PADRAO_CASA,
  'ence-padrao-empresa': ENCE_PADRAO_EMPRESA,
  'ence-padrao-casa-extend': ENCE_PADRAO_CASA_EXTEND,
  'ence-altplan-remoto': ENCE_ALTPLAN_REMOTO,
  'inst-gratis-residencial': INST_GRATIS_RESIDENCIAL,
  'inst-gratis-empresarial': INST_GRATIS_EMPRESARIAL,
  'inst-taxa-residencial': INST_TAXA_RESIDENCIAL,
  'inst-taxa-empresarial': INST_TAXA_EMPRESARIAL,
};

/** Catálogo do modelo, ou null se ele ainda não foi extraído. */
export function catalogoDoModelo(slug: string): Catalogo | null {
  return CATALOGOS[slug] ?? null;
}

/** True se o texto deste modelo já pode ser editado pela plataforma. */
export function modeloEhEditavel(slug: string): boolean {
  return slug in CATALOGOS;
}

/** Slugs extraídos — usado em teste e diagnóstico. */
export function modelosEditaveis(): string[] {
  return Object.keys(CATALOGOS);
}

/**
 * Todos os catálogos, para os testes de consistência varrerem sem lista manual.
 *
 * Antes o teste tinha os catálogos escritos à mão; com 45 modelos essa lista
 * ficaria desatualizada e as guardas parariam de cobrir os novos em silêncio —
 * que é o pior tipo de teste, o que dá verde sem olhar.
 */
export function todosCatalogos(): [string, Catalogo][] {
  return Object.entries(CATALOGOS);
}

/**
 * Para cada frase de um modelo, em quantos OUTROS modelos o mesmo texto existe.
 *
 * Alimenta a nota "este texto também existe em outros N modelos — editar aqui
 * não altera os outros", que é como a tela cumpre a decisão de escopo: a edição
 * é sempre de um modelo por vez.
 *
 * A contagem cobre só os modelos já extraídos. Enquanto a extração avança o
 * número cresce — é menos do que a duplicação real (há texto repetido nos
 * renders ainda não extraídos), mas é o que dá para afirmar com certeza. Vale
 * mais um número comprovável do que um palpite exibido como fato.
 */
export function contarTambemEm(slug: string, catalogo: Catalogo): Record<string, number> {
  const contagem: Record<string, number> = {};

  for (const [chave, def] of Object.entries(catalogo)) {
    let outros = 0;
    for (const [outroSlug, outroCat] of Object.entries(CATALOGOS)) {
      if (outroSlug === slug) continue;
      if (Object.values(outroCat).some((d) => d.texto === def.texto)) outros += 1;
    }
    contagem[chave] = outros;
  }
  return contagem;
}
