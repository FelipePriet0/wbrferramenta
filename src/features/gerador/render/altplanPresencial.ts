/**
 * Emulação do modelo `altplan-presencial` — porte 1:1 da função `bVe` do bundle
 * legado. Ramifica em titular/terceiro (sem modo ofertado). Validado por diff —
 * ver `altplanPresencial.diff.test.ts`.
 */
import {
  descreveSinal,
  linhas,
  maiusc,
  parteData,
  primeiroNome,
  soDigitos,
  type Valores,
} from './helpers';
import {
  BENEFICIOS_APOS_ASSINATURA,
  OPCAO_REMOTA,
  OPCAO_VISITA_PAGA,
  OPCOES_INTRO,
  SEM_CUSTOS,
  SEP,
} from './frases';
import type { SaidaOS } from './altplanRemoto';

export function renderAltplanPresencial(valores: Valores): SaidaOS {
  const v: Valores = {};
  for (const [k, val] of Object.entries(valores)) v[k] = String(val ?? '');

  const tipo = v.tipoSolicitacao || 'titular';
  const titular = primeiroNome(maiusc(v.cliente));
  const sol = primeiroNome(maiusc(v.solicitante));
  const parente = maiusc(v.parente);
  const canal = v.canal ?? '';
  const contato = soDigitos(v.contato);
  const motivo = maiusc(v.motivo);
  const planoAtual = v.planoAtual ?? '';
  const planoEscolhido = v.planoEscolhido ?? '';
  const roteador = maiusc(v.roteador);
  const dataContrato = maiusc(v.dataContrato);
  const protocolo = v.protocolo ?? '';
  const sinal = descreveSinal(v);
  const [ligData, ligHora] = parteData(v.dataLigacao);
  const [protData, protHora] = parteData(v.dataProtocolo);
  const [atendData, atendHora] = parteData(v.dataAtendimento);

  const blocoPlano = [
    `PLANO ATUAL: ${planoAtual} CONTRATADO EM ${dataContrato} COM FIDELIDADE DE 12 MESES. ROTEADOR: ${roteador}`,
    '',
    `PLANO SOLICITADO: ${planoEscolhido}`,
  ];
  const blocoOpcoes = [
    `INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${roteador}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA.`,
    OPCOES_INTRO,
    '',
    OPCAO_VISITA_PAGA,
    '',
  ];

  if (tipo === 'terceiro') {
    return {
      protocolo: linhas(
        `${sol} (${parente} DE ${titular}) COMPARECEU À LOJA E SOLICITOU ALTERAÇÃO DE PLANO.`,
        '', SEP, '',
        `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinal}${sinal === 'SEM SINAL' ? '.' : ' SEM OSCILAÇÃO.'}`,
        '', SEP,
        `QUESTIONADO, CLIENTE DISSE QUE "${motivo}".`,
        '', ...blocoPlano, '',
        'ACESSO LIBERADO PARA SMARTPHONE OU TV SMART QUE POSSUA COMPATIBILIDADE. ',
        '', '', SEP, ...blocoOpcoes, OPCAO_REMOTA, SEM_CUSTOS, BENEFICIOS_APOS_ASSINATURA, '', SEP, '',
        `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO COM ${titular} (ASSINANTE) POR ${canal} QUE CONFIRMOU E AUTORIZOU O UPGRADE, ACORDO FIRMADO POR ${canal} (${contato}) SOB PROTOCOLO ${protocolo} EM ${ligData} ÀS ${ligHora}. ${titular} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES.`,
        'CLIENTE NÃO TEM DÚVIDAS.',
      ),
      os: `${sol} (${parente} DE ${titular}) COMPARECEU NA LOJA E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${planoAtual}. PLANO ESCOLHIDO: ${planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. NÃO É NECESSÁRIA VISITA TÉCNICA, O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${sol} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, EQUIPAMENTO PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO COM ${titular} (ASSINANTE) POR ${canal} QUE CONFIRMOU E AUTORIZOU O UPGRADE, ACORDO FIRMADO POR ${canal} (${contato}) SOB PROTOCOLO Nº${protocolo} EM ${ligData} ÀS ${ligHora} HRS.`,
    };
  }

  // titular (padrão)
  return {
    protocolo: linhas(
      `${titular} COMPARECEU À LOJA E SOLICITOU ALTERAÇÃO DE PLANO.`,
      '', SEP, '',
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinal}`,
      '', SEP,
      `QUESTIONADO, CLIENTE DISSE QUE "${motivo}".`,
      '', ...blocoPlano, '',
      'APLICATIVOS DISPONÍVEIS PARA SMARTPHONE OU SMART-TV QUE POSSUA COMPATIBILIDADE. ',
      '', '', SEP, ...blocoOpcoes, `${OPCAO_REMOTA} ${SEM_CUSTOS}`, '', BENEFICIOS_APOS_ASSINATURA, '', SEP, '',
      `${titular} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VALIDAÇÃO FEITA PRESENCIALMENTE DIA ${atendData} ÀS ${atendHora} HRS`,
    ),
    os: `${titular} COMPARECEU À LOJA E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${planoAtual}. PLANO ESCOLHIDO: ${planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. NÃO É NECESSÁRIA VISITA TÉCNICA, O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${titular} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, EQUIPAMENTO PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO. PROTOCOLO Nº${protocolo} EM ${protData} ÀS ${protHora} HRS.`,
  };
}
