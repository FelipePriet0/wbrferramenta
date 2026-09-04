/**
 * Catálogo de frases do modelo `ence-padrao-casa`.
 * Texto de encerramento de instalação residencial — um checklist do que o
 * técnico executou.
 *
 * ⚠️ VAZAMENTO DE BRANDING: `appProvedor` e as duas linhas de `appTv` citam
 * "APP MZNET" e "APP MZTV". Foram os PRIMEIROS vazamentos que encontrei nesta
 * sessão, ainda na comparação inicial entre os repos — este arquivo já divergia
 * entre MZnet e WBR só por causa deles.
 *
 * ⚠️ TRECHOS PROTEGIDOS: as frases de fixação precisam começar com "SOLTO" ou
 * "FIXADO". O render deriva a forma feminina ("SOLTA"/"FIXADA") com um replace
 * ancorado no início da frase, porque ONU é feminino e ROTEADOR/ONT masculinos.
 * Perder o começo quebra a concordância em silêncio.
 */
import type { Catalogo } from './tipos';

export const ENCE_PADRAO_CASA: Catalogo = {
  titulo: { rotulo: 'Título do encerramento', texto: 'PADRAO CASA:', obrigatorios: [] },
  ctoOculta: { rotulo: 'CTO sem identificação', texto: 'CTO: XXXX', obrigatorios: [] },
  cto: { rotulo: 'CTO', texto: 'CTO: {cto}', obrigatorios: [] },
  sinal: { rotulo: 'Sinal', texto: 'SINAL: {sinal}', obrigatorios: [] },
  porta: { rotulo: 'Porta', texto: 'PORTA: {porta}', obrigatorios: [] },
  passagemCabo: {
    rotulo: 'Passagem do cabo drop',
    texto: 'PASSAGEM DO CABO DROP: {passagemCabo} A PEDIDO DO CLIENTE.',
    obrigatorios: [],
  },
  possuiPassante: { rotulo: 'Possui passante', texto: 'POSSUI PASSANTE: SIM', obrigatorios: [] },
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
    texto: 'FIXADO NA PAREDE COM BUCHA E PARAFUSO A PEDIDO DO CLIENTE.',
    obrigatorios: [],
    trechosProtegidos: ['FIXADO'],
  },
  fixacaoMovel: {
    rotulo: 'Equipamento fixado no móvel',
    texto: 'FIXADO NO MÓVEL COM {tipoFixacaoMovel} A PEDIDO DO CLIENTE.',
    obrigatorios: [],
    trechosProtegidos: ['FIXADO'],
  },

  // Serve tanto o fluxo "ONU + Roteador" quanto o "Somente ONU" — o legado
  // repetia a mesma linha nos dois. Uma chave só.
  linhaOnu: { rotulo: 'Linha da ONU', texto: 'ONU {onu} MAC {macOnu} {fixacao}', obrigatorios: [] },
  linhaRoteador: { rotulo: 'Linha do roteador', texto: 'ROTEADOR {roteador} MAC {macRoteador} {fixacao}', obrigatorios: [] },
  linhaOnt: { rotulo: 'Linha da ONT', texto: '{ont} MAC {macOnt} {fixacao}', obrigatorios: [] },

  testeNotebook: {
    rotulo: 'Teste no notebook do técnico',
    texto: 'TESTE REALIZADO NO NOTEBOOK DO TÉCNICO, VIA CABO, AFERIU {testeNotebook} MEGA DE DOWNLOAD.',
    obrigatorios: [],
  },
  testeCliente: {
    rotulo: 'Teste no dispositivo do cliente',
    texto: 'TESTE FEITO NO {dispositivoTeste} {marcaModeloTeste} DO CLIENTE AFERIU {velocidadeTeste} MEGA DE DOWNLOAD.',
    obrigatorios: [],
  },
  cienciaAdaptador: {
    rotulo: 'Ciência sobre riscos do adaptador elétrico',
    texto:
      'CLIENTE: {nomeClienteEnergia} ACOMPANHOU A ORDEM DE SERVIÇO E ESTÁ CIENTE DE QUE O ADAPTADOR PODE DESLIGAR OU ATÉ MESMO QUEIMAR OS EQUIPAMENTOS EMPRESTADOS EM COMODATO.',
    obrigatorios: [],
  },
  testeCobertura: {
    rotulo: 'Teste de cobertura Wi-Fi',
    texto: 'TESTE DE COBERTURA WI-FI FOI REALIZADO NA PRESENÇA DE {testeCobertura}',
    obrigatorios: [],
  },
  appProvedor: {
    // ⚠️ Cita o app do provedor.
    rotulo: 'App do provedor instalado',
    texto: 'APP WBR: CELULAR {appCelular} DE {testeCobertura}, ESTE APP CONCEDE ACESSO AOS BOLETOS E CONTRATO.',
    obrigatorios: [],
  },
  appTvSim: {
    // ⚠️ Cita o app de TV do provedor.
    rotulo: 'App de TV instalado — sim',
    texto: 'APP MZTV OU CDNTV: SIM - DISPOSITIVO: {dispositivoTv}',
    obrigatorios: [],
  },
  appTvNao: {
    rotulo: 'App de TV instalado — não',
    texto: 'APP MZTV OU CDNTV: NÃO',
    obrigatorios: [],
  },
  ligacoesEletricas: { rotulo: 'Ligações elétricas', texto: 'LIGAÇÕES ELÉTRICAS: {ligacaoEletrica}', obrigatorios: [] },
  orientacaoRiscos: {
    rotulo: 'Orientação sobre riscos da ligação elétrica',
    texto: '{testeCobertura} RECEBEU ORIENTAÇÃO SOBRE OS RISCOS DE USAR {ligacaoEletrica}.',
    obrigatorios: [],
  },
  dispositivosConectados: {
    rotulo: 'Dispositivos conectados na rede',
    texto: 'DISPOSITIVOS CONECTADOS NA REDE: {dispositivosConectados}',
    obrigatorios: [],
  },
  pagamentoSim: { rotulo: 'Houve pagamento', texto: 'PAGAMENTO (X)SIM ( )NAO', obrigatorios: [] },
  pagamentoNao: { rotulo: 'Não houve pagamento', texto: 'PAGAMENTO ( )SIM (X)NAO', obrigatorios: [] },
  valorPagamento: { rotulo: 'Valor pago', texto: 'VALOR R$: {valorPagamento}', obrigatorios: [] },
  formaPagamento: { rotulo: 'Forma de pagamento', texto: 'FORMA PAGAMENTO {formaPagamento}', obrigatorios: [] },
  observacoes: { rotulo: 'Observações', texto: 'OBS.: {observacoes}', obrigatorios: [] },
};
