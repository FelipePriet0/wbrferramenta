/**
 * Catálogo de frases do modelo `ence-padrao-casa-extend`.
 * Encerramento de instalação residencial com pontos Wi-Fi Extend adicionais.
 *
 * EXTRAÇÃO PARCIAL: boa parte do texto é montada por laço sobre pontos
 * numerados (`equip_1`, `mac_equip_2`, `ligacao_eletrica_3`…) com ordinais
 * calculados. Esses blocos ficam travados. Extraí as frases fixas — incluindo
 * as que carregam branding e as de fixação, que precisam de proteção.
 *
 * ⚠️ VAZAMENTO DE BRANDING: `appProvedor` e `appTvSim`/`appTvNao`.
 * ⚠️ TRECHOS PROTEGIDOS: fixação precisa começar com SOLTO/FIXADO — o render
 * deriva a forma feminina com replace ancorado no início.
 */
import type { Catalogo } from './tipos';

export const ENCE_PADRAO_CASA_EXTEND: Catalogo = {
  passagemCabo: { rotulo: 'Passagem do cabo drop', texto: 'PASSAGEM DO CABO DROP: {passagemCabo}.', obrigatorios: [] },
  motivoPassante: { rotulo: 'Motivo do passante', texto: 'MOTIVO DO PASSANTE: {motivoPassante}', obrigatorios: [] },
  localPassante: { rotulo: 'Local do passante', texto: 'LOCAL DO PASSANTE: {localPassante}', obrigatorios: [] },
  autorizadoPor: { rotulo: 'Quem autorizou o passante', texto: 'AUTORIZADO POR: {autorizadoPor}', obrigatorios: [] },
  fixacaoSolto: {
    rotulo: 'Equipamento solto em cima do móvel',
    texto:
      'SOLTO EM CIMA DO MÓVEL: {descricaoMovel}. MOTIVO DE NÃO FIXAR: {motivoNaoFixado}. O CLIENTE ESTÁ CIENTE DOS RISCOS CASO O EQUIPAMENTO SOFRA DANO POR QUEDA.',
    obrigatorios: [],
    trechosProtegidos: ['SOLTO'],
  },
  fixacaoParede: {
    rotulo: 'Equipamento fixado na parede',
    texto: 'FIXADO NA PAREDE COM AUTORIZAÇÃO DO CLIENTE.',
    obrigatorios: [],
    trechosProtegidos: ['FIXADO'],
  },
  fixacaoMovel: {
    rotulo: 'Equipamento fixado no móvel',
    texto: 'FIXADO NO MÓVEL COM {tipoFixacaoMovel} A PEDIDO DO CLIENTE.',
    obrigatorios: [],
    trechosProtegidos: ['FIXADO'],
  },
  appProvedor: {
    // ⚠️ Cita o app do provedor.
    rotulo: 'App do provedor instalado',
    texto: 'APP WBR: CELULAR {appCelular}',
    obrigatorios: [],
  },
  appTvSim: {
    // ⚠️ Cita o app de TV do provedor.
    rotulo: 'App de TV instalado — sim',
    texto: 'APP MZTV OU CDNTV: {dispositivoTv}',
    obrigatorios: [],
  },
  appTvNao: { rotulo: 'App de TV instalado — não', texto: 'APP MZTV OU CDNTV: NÃO', obrigatorios: [] },
  dispositivosConectados: {
    rotulo: 'Dispositivos conectados na rede',
    texto: 'DISPOSITIVOS CONECTADOS NA REDE: {dispositivosConectados}',
    obrigatorios: [],
  },
  formaPagamento: { rotulo: 'Forma de pagamento', texto: 'FORMA PAGAMENTO {formaPagamento}', obrigatorios: [] },
};
