/**
 * Catálogo de frases do modelo `ence-altplan-remoto`.
 * Encerramento de alteração de plano executada remotamente.
 *
 * ⚠️ VAZAMENTO DE BRANDING: as linhas de aplicativo citam "MZNET-PLAY" e
 * "MZNET-PLAY PLUS (ITTV)".
 */
import type { Catalogo } from './tipos';

export const ENCE_ALTPLAN_REMOTO: Catalogo = {
  trocaRoteador: {
    rotulo: 'Troca do roteador',
    texto: 'DESINSTALEI ROTEADOR {rotRetirou} MAC: {macRotRetirou} E INSTALEI ROTEADOR {rotInstalou} MAC: {macRotInstalou}.',
    obrigatorios: [],
  },
  semTrocaRoteador: {
    rotulo: 'Roteador mantido',
    texto: 'ROTEADOR JÁ INSTALADO {rotSemTroca} MAC: {macRotSemTroca}.',
    obrigatorios: [],
  },
  equipamentoInstalado: { rotulo: 'Equipamento já instalado', texto: 'EQUIPAMENTO {onu} JÁ INSTALADO, MAC {macONU}', obrigatorios: [] },
  fixacaoRoteador: { rotulo: 'Fixação do roteador', texto: 'ROTEADOR FIXADO COM BUCHA E PARAFUSO: {fixacaoRoteador}', obrigatorios: [] },
  localizacaoEquipamento: { rotulo: 'Localização do equipamento não fixado', texto: 'LOCALIZAÇÃO DO EQUIPAMENTO: {local}', obrigatorios: [] },
  fixacaoOnu: { rotulo: 'Fixação da ONU', texto: 'ONU FIXADA COM BUCHA E PARAFUSO: {fixacaoONU}', obrigatorios: [] },
  testeCabo: { rotulo: 'Teste via cabo', texto: 'TESTE NO NOTEBOOK DO KIT VIA CABO {testeCabo} MBPS', obrigatorios: [] },
  testeWifi: { rotulo: 'Teste via Wi-Fi', texto: 'TESTE NO NOTEBOOK DO KIT VIA WI-FI 5G {testeWifi} MBPS', obrigatorios: [] },
  testeDispositivo: {
    rotulo: 'Teste no dispositivo do cliente',
    texto: 'TESTE EM {dispositivo} DO CLIENTE: {marcaModelo} VIA {meioAfericao} AFERIU A VELOCIDADE DE {velocidade} MBPS',
    obrigatorios: [],
  },
  compatibilidade: { rotulo: 'Compatibilidade do aparelho', texto: 'APARELHO {compat} COMPATÍVEL COM A VELOCIDADE CONTRATADA.', obrigatorios: [] },
  testeCobertura: { rotulo: 'Teste de cobertura Wi-Fi', texto: 'REALIZOU TESTES DE COBERTURA WI-FI? {testeCobertura}', obrigatorios: [] },
  motivoNaoTeste: { rotulo: 'Motivo de não testar cobertura', texto: 'MOTIVO: {motivoNaoTeste}', obrigatorios: [] },
  ligacaoEletrica: { rotulo: 'Ligação elétrica', texto: 'LIGAÇÃO ELÉTRICA: {ligacaoEletrica}', obrigatorios: [] },
  observacaoLigacao: { rotulo: 'Observação da ligação elétrica', texto: 'OBSERVAÇÃO: {observacaoLigacao}', obrigatorios: [] },
  appPlay: {
    // ⚠️ Cita o app do provedor.
    rotulo: 'App de TV instalado',
    texto: 'APLICATIVO WBR-PLAY INSTALADO EM: {appMznet}',
    obrigatorios: [],
  },
  appPlayPlus: {
    // ⚠️ Cita o app do provedor.
    rotulo: 'App de TV plus instalado',
    texto: 'APLICATIVO WBR-PLAY PLUS (ITTV) INSTALADO EM: {appMznetPlus}',
    obrigatorios: [],
  },
  appDeezer: { rotulo: 'App Deezer instalado', texto: 'APLICATIVO DEEZER INSTALADO EM: {appDeezer}', obrigatorios: [] },
  custos: { rotulo: 'Custos da O.S', texto: 'O.S {custos} CUSTOS', obrigatorios: [] },
  valorCustos: { rotulo: 'Valor cobrado', texto: 'VALOR: R${valorCustos}', obrigatorios: [] },
  formaPagamento: { rotulo: 'Forma de pagamento', texto: 'FORMA DE PAGAMENTO: {formaPagamento}', obrigatorios: [] },
  observacoes: { rotulo: 'Observações', texto: 'OBSERVAÇÕES: {observacoes}', obrigatorios: [] },
  semDuvidas: { rotulo: 'Encerramento', texto: 'CLIENTE SEM DÚVIDAS.', obrigatorios: [] },
};
