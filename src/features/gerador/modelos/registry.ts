/**
 * Registro de modelos portados: form (config da UI) + render (emulação).
 * Só os modelos já implementados. Ver `docs/gerador/sondagem2-suporte.md`.
 */
import { renderAltplanRemoto } from '../render/altplanRemoto';
import { renderAltplanPresencial } from '../render/altplanPresencial';
import { renderAltplanSemTrocaVisitaIsenta } from '../render/altplanSemTrocaVisitaIsenta';
import { renderAltplanSemTrocaVisitaPaga } from '../render/altplanSemTrocaVisitaPaga';
import { renderAltplanTrocaVisitaIsenta } from '../render/altplanTrocaVisitaIsenta';
import { renderAltplanTrocaVisitaPaga } from '../render/altplanTrocaVisitaPaga';
import type { SaidaOS } from '../render/altplanRemoto';
import type { Valores } from '../render/helpers';
import { ALTPLAN_REMOTO_FORM, type ModeloForm } from './altplanRemotoForm';
import { ALTPLAN_PRESENCIAL_FORM } from './altplanPresencialForm';
import { ALTPLAN_SEM_TROCA_VISITA_ISENTA_FORM } from './altplanSemTrocaVisitaIsentaForm';
import { ALTPLAN_SEM_TROCA_VISITA_PAGA_FORM } from './altplanSemTrocaVisitaPagaForm';
import { ALTPLAN_TROCA_VISITA_ISENTA_FORM } from './altplanTrocaVisitaIsentaForm';
import { ALTPLAN_TROCA_VISITA_PAGA_FORM } from './altplanTrocaVisitaPagaForm';
// Manutenção
import { renderManutLuzVermelha } from '../render/manutLuzVermelha';
import { renderManutLuzVermelhaPj } from '../render/manutLuzVermelhaPj';
import { renderManutFibraExterna } from '../render/manutFibraExterna';
import { renderManutOcasConector } from '../render/manutOcasConector';
import { renderManutOcasFibra } from '../render/manutOcasFibra';
import { renderManutLuzVermelhaIsento } from '../render/manutLuzVermelhaIsento';
import { renderManutSinalAlto } from '../render/manutSinalAlto';
import { renderManutRealocFibra } from '../render/manutRealocFibra';
import { renderManutMudPontoInt } from '../render/manutMudPontoInt';
import { renderManutVisitaTestes } from '../render/manutVisitaTestes';
import { renderManutFonteQueimada } from '../render/manutFonteQueimada';
import { renderManutOntQueimada } from '../render/manutOntQueimada';
import { renderManutOnuQueimada } from '../render/manutOnuQueimada';
import { renderManutRoteadorQueimado } from '../render/manutRoteadorQueimado';
import { renderManutRoteadorReset } from '../render/manutRoteadorReset';
// Conversores / TV, Wi-Fi Extend, Senha, Feedback, Termo
import { renderMidiaRokuPadrao } from '../render/midiaRokuPadrao';
import { renderMidiaRokuPresencial } from '../render/midiaRokuPresencial';
import { renderMidiaStbPadrao } from '../render/midiaStbPadrao';
import { renderWifiExtendZte } from '../render/wifiExtendZte';
import { renderWifiExtendTplink } from '../render/wifiExtendTplink';
import { renderWifiExtendPonto } from '../render/wifiExtendPonto';
import { renderSenhaAlteraSenha } from '../render/senhaAlteraSenha';
import { renderFeedbackManExterna } from '../render/feedbackManExterna';
import { renderFeedbackManOcasionado } from '../render/feedbackManOcasionado';
import { renderFeedbackTrocaEquip } from '../render/feedbackTrocaEquip';
import { renderFeedbackMudancaPonto } from '../render/feedbackMudancaPonto';
import { renderFeedbackAltplan } from '../render/feedbackAltplan';
import { renderFeedbackStbRoku } from '../render/feedbackStbRoku';
import { renderFeedbackWifiExtend } from '../render/feedbackWifiExtend';
import { renderFeedbackSemSucesso } from '../render/feedbackSemSucesso';
import { renderTermoRespPadrao } from '../render/termoRespPadrao';
// Cadastro (instalação grátis/taxa) + Instalação (encerramentos)
import { renderInstGratisResidencial } from '../render/instGratisResidencial';
import { renderInstGratisEmpresarial } from '../render/instGratisEmpresarial';
import { renderInstTaxaResidencial } from '../render/instTaxaResidencial';
import { renderInstTaxaEmpresarial } from '../render/instTaxaEmpresarial';
import { renderEncePadraoCasa } from '../render/encePadraoCasa';
import { renderEncePadraoEmpresa } from '../render/encePadraoEmpresa';
import { renderEncePadraoCasaExtend } from '../render/encePadraoCasaExtend';
import { renderEnceAltplanRemoto } from '../render/enceAltplanRemoto';
import { MANUT_LUZ_VERMELHA_FORM } from './manutLuzVermelhaForm';
import { MANUT_LUZ_VERMELHA_PJ_FORM } from './manutLuzVermelhaPjForm';
import { MANUT_FIBRA_EXTERNA_FORM } from './manutFibraExternaForm';
import { MANUT_OCAS_CONECTOR_FORM } from './manutOcasConectorForm';
import { MANUT_OCAS_FIBRA_FORM } from './manutOcasFibraForm';
import { MANUT_LUZ_VERMELHA_ISENTO_FORM } from './manutLuzVermelhaIsentoForm';
import { MANUT_SINAL_ALTO_FORM } from './manutSinalAltoForm';
import { MANUT_REALOC_FIBRA_FORM } from './manutRealocFibraForm';
import { MANUT_MUD_PONTO_INT_FORM } from './manutMudPontoIntForm';
import { MANUT_VISITA_TESTES_FORM } from './manutVisitaTestesForm';
import { MANUT_FONTE_QUEIMADA_FORM } from './manutFonteQueimadaForm';
import { MANUT_ONT_QUEIMADA_FORM } from './manutOntQueimadaForm';
import { MANUT_ONU_QUEIMADA_FORM } from './manutOnuQueimadaForm';
import { MANUT_ROTEADOR_QUEIMADO_FORM } from './manutRoteadorQueimadoForm';
import { MANUT_ROTEADOR_RESET_FORM } from './manutRoteadorResetForm';
import { MIDIA_ROKU_PADRAO_FORM } from './midiaRokuPadraoForm';
import { MIDIA_ROKU_PRESENCIAL_FORM } from './midiaRokuPresencialForm';
import { MIDIA_STB_PADRAO_FORM } from './midiaStbPadraoForm';
import { WIFI_EXTEND_ZTE_FORM } from './wifiExtendZteForm';
import { WIFI_EXTEND_TPLINK_FORM } from './wifiExtendTplinkForm';
import { WIFI_EXTEND_PONTO_FORM } from './wifiExtendPontoForm';
import { SENHA_ALTERA_SENHA_FORM } from './senhaAlteraSenhaForm';
import { FEEDBACK_MAN_EXTERNA_FORM } from './feedbackManExternaForm';
import { FEEDBACK_MAN_OCASIONADO_FORM } from './feedbackManOcasionadoForm';
import { FEEDBACK_TROCA_EQUIP_FORM } from './feedbackTrocaEquipForm';
import { FEEDBACK_MUDANCA_PONTO_FORM } from './feedbackMudancaPontoForm';
import { FEEDBACK_ALTPLAN_FORM } from './feedbackAltplanForm';
import { FEEDBACK_STB_ROKU_FORM } from './feedbackStbRokuForm';
import { FEEDBACK_WIFI_EXTEND_FORM } from './feedbackWifiExtendForm';
import { FEEDBACK_SEM_SUCESSO_FORM } from './feedbackSemSucessoForm';
import { TERMO_RESP_PADRAO_FORM } from './termoRespPadraoForm';
import { INST_GRATIS_RESIDENCIAL_FORM } from './instGratisResidencialForm';
import { INST_GRATIS_EMPRESARIAL_FORM } from './instGratisEmpresarialForm';
import { INST_TAXA_RESIDENCIAL_FORM } from './instTaxaResidencialForm';
import { INST_TAXA_EMPRESARIAL_FORM } from './instTaxaEmpresarialForm';
import { ENCE_PADRAO_CASA_FORM } from './encePadraoCasaForm';
import { ENCE_PADRAO_EMPRESA_FORM } from './encePadraoEmpresaForm';
import { ENCE_PADRAO_CASA_EXTEND_FORM } from './encePadraoCasaExtendForm';
import { ENCE_ALTPLAN_REMOTO_FORM } from './enceAltplanRemotoForm';

export type RenderFn = (v: Valores) => SaidaOS;

interface ModeloRegistrado {
  form: ModeloForm;
  render: RenderFn;
}

export const REGISTRO: Record<string, ModeloRegistrado> = {
  'altplan-remoto': { form: ALTPLAN_REMOTO_FORM, render: renderAltplanRemoto },
  'altplan-presencial': { form: ALTPLAN_PRESENCIAL_FORM, render: renderAltplanPresencial },
  'altplan-sem-troca-visita-isenta': { form: ALTPLAN_SEM_TROCA_VISITA_ISENTA_FORM, render: renderAltplanSemTrocaVisitaIsenta },
  'altplan-sem-troca-visita-paga': { form: ALTPLAN_SEM_TROCA_VISITA_PAGA_FORM, render: renderAltplanSemTrocaVisitaPaga },
  'altplan-troca-visita-isenta': { form: ALTPLAN_TROCA_VISITA_ISENTA_FORM, render: renderAltplanTrocaVisitaIsenta },
  'altplan-troca-visita-paga': { form: ALTPLAN_TROCA_VISITA_PAGA_FORM, render: renderAltplanTrocaVisitaPaga },
  // Manutenção
  'manut-luz-vermelha': { form: MANUT_LUZ_VERMELHA_FORM, render: renderManutLuzVermelha },
  'manut-luz-vermelha-pj': { form: MANUT_LUZ_VERMELHA_PJ_FORM, render: renderManutLuzVermelhaPj },
  'manut-fibra-externa': { form: MANUT_FIBRA_EXTERNA_FORM, render: renderManutFibraExterna },
  'manut-ocas-conector': { form: MANUT_OCAS_CONECTOR_FORM, render: renderManutOcasConector },
  'manut-ocas-fibra': { form: MANUT_OCAS_FIBRA_FORM, render: renderManutOcasFibra },
  'manut-luz-vermelha-isento': { form: MANUT_LUZ_VERMELHA_ISENTO_FORM, render: renderManutLuzVermelhaIsento },
  'manut-sinal-alto': { form: MANUT_SINAL_ALTO_FORM, render: renderManutSinalAlto },
  'manut-realoc-fibra': { form: MANUT_REALOC_FIBRA_FORM, render: renderManutRealocFibra },
  'manut-mud-ponto-int': { form: MANUT_MUD_PONTO_INT_FORM, render: renderManutMudPontoInt },
  'manut-visita-testes': { form: MANUT_VISITA_TESTES_FORM, render: renderManutVisitaTestes },
  'manut-fonte-queimada': { form: MANUT_FONTE_QUEIMADA_FORM, render: renderManutFonteQueimada },
  'manut-ont-queimada': { form: MANUT_ONT_QUEIMADA_FORM, render: renderManutOntQueimada },
  'manut-onu-queimada': { form: MANUT_ONU_QUEIMADA_FORM, render: renderManutOnuQueimada },
  'manut-roteador-queimado': { form: MANUT_ROTEADOR_QUEIMADO_FORM, render: renderManutRoteadorQueimado },
  'manut-roteador-reset': { form: MANUT_ROTEADOR_RESET_FORM, render: renderManutRoteadorReset },
  // Conversores / TV
  'midia-roku-padrao': { form: MIDIA_ROKU_PADRAO_FORM, render: renderMidiaRokuPadrao },
  'midia-roku-presencial': { form: MIDIA_ROKU_PRESENCIAL_FORM, render: renderMidiaRokuPresencial },
  'midia-stb-padrao': { form: MIDIA_STB_PADRAO_FORM, render: renderMidiaStbPadrao },
  // Wi-Fi Extend
  'wifi-extend-zte': { form: WIFI_EXTEND_ZTE_FORM, render: renderWifiExtendZte },
  'wifi-extend-tplink': { form: WIFI_EXTEND_TPLINK_FORM, render: renderWifiExtendTplink },
  'wifi-extend-ponto': { form: WIFI_EXTEND_PONTO_FORM, render: renderWifiExtendPonto },
  // Senha / SSID
  'senha-altera-senha': { form: SENHA_ALTERA_SENHA_FORM, render: renderSenhaAlteraSenha },
  // Feedback
  'feedback-man-externa': { form: FEEDBACK_MAN_EXTERNA_FORM, render: renderFeedbackManExterna },
  'feedback-man-ocasionado': { form: FEEDBACK_MAN_OCASIONADO_FORM, render: renderFeedbackManOcasionado },
  'feedback-troca-equip': { form: FEEDBACK_TROCA_EQUIP_FORM, render: renderFeedbackTrocaEquip },
  'feedback-mudanca-ponto': { form: FEEDBACK_MUDANCA_PONTO_FORM, render: renderFeedbackMudancaPonto },
  'feedback-altplan': { form: FEEDBACK_ALTPLAN_FORM, render: renderFeedbackAltplan },
  'feedback-stb-roku': { form: FEEDBACK_STB_ROKU_FORM, render: renderFeedbackStbRoku },
  'feedback-wifi-extend': { form: FEEDBACK_WIFI_EXTEND_FORM, render: renderFeedbackWifiExtend },
  'feedback-sem-sucesso': { form: FEEDBACK_SEM_SUCESSO_FORM, render: renderFeedbackSemSucesso },
  // Termo
  'termo-resp-padrao': { form: TERMO_RESP_PADRAO_FORM, render: renderTermoRespPadrao },
  // Cadastro (instalação grátis/taxa)
  'inst-gratis-residencial': { form: INST_GRATIS_RESIDENCIAL_FORM, render: renderInstGratisResidencial },
  'inst-gratis-empresarial': { form: INST_GRATIS_EMPRESARIAL_FORM, render: renderInstGratisEmpresarial },
  'inst-taxa-residencial': { form: INST_TAXA_RESIDENCIAL_FORM, render: renderInstTaxaResidencial },
  'inst-taxa-empresarial': { form: INST_TAXA_EMPRESARIAL_FORM, render: renderInstTaxaEmpresarial },
  // Instalação (encerramentos)
  'ence-padrao-casa': { form: ENCE_PADRAO_CASA_FORM, render: renderEncePadraoCasa },
  'ence-padrao-empresa': { form: ENCE_PADRAO_EMPRESA_FORM, render: renderEncePadraoEmpresa },
  'ence-padrao-casa-extend': { form: ENCE_PADRAO_CASA_EXTEND_FORM, render: renderEncePadraoCasaExtend },
  'ence-altplan-remoto': { form: ENCE_ALTPLAN_REMOTO_FORM, render: renderEnceAltplanRemoto },
};

/** Lista os modelos registrados de uma demanda (categoria). Ordem de inserção. */
export function listarModelosPorDemanda(demanda: string): { slug: string; form: ModeloForm }[] {
  return Object.entries(REGISTRO)
    .filter(([, m]) => m.form.demanda === demanda)
    .map(([slug, m]) => ({ slug, form: m.form }));
}

export function getModelo(slug: string): ModeloRegistrado | null {
  return REGISTRO[slug] ?? null;
}
