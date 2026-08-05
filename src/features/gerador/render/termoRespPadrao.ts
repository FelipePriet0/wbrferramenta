/**
 * Emulação do modelo `termo-resp-padrao` — porte 1:1 da função `iJe` do bundle
 * legado (conteúdo de O.S do próprio app). Termo de responsabilidade de acesso
 * ao roteador em comodato. SEM variável de tipo. 2º arg = operador (não usado no
 * corpo do texto). Validado por diff contra o legado — ver
 * `termoRespPadrao.diff.test.ts`.
 */
import { maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

export function renderTermoRespPadrao(valores: Valores): SaidaOS {
  const t: Record<string, string> = {};
  for (const [k, val] of Object.entries(valores)) t[k] = String(val ?? '');

  const n = primeiroNome(maiusc(t.cliente));
  const r = t.canal;
  const i = soDigitos(t.contato);
  let a = maiusc(t.sinalONU);
  const o = maiusc(t.roteador);
  const s = t.protocolo;
  const c = maiusc(t.mac);
  const l = t.user ?? '';
  const u = t.senha ?? '';
  if (a === '') a = 'SEM SINAL';

  // Bloco final: só repassa usuário/senha e afirma "CONFIRMOU ACESSO" quando o
  // cliente de fato testou a nova senha. No ramo 'nao' evita imprimir campos
  // vazios e uma confirmação falsa.
  const blocoAcesso =
    String(t.testouSenha ?? '') === 'nao'
      ? `${n} NÃO TESTOU A NOVA SENHA; ACESSO A SER CONFIRMADO POSTERIORMENTE.`
      : `REPASSEI O ACESSO A ${n}:

USUÁRIO: ${l}
SENHA: ${u}

${n} CONFIRMOU ACESSO E NÃO TEM DÚVIDAS.`;

  const protocolo = `${n} ENTROU EM CONTATO VIA ${maiusc(r)} (${i}) E SOLICITOU ACESSO AO ROTEADOR EM COMODATO.

===============================

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO, E ONU ${a}.

===============================

QUESTIONADO, ${n} DISSE QUE DESEJA O ACESSO AO ROTEADOR QUE É EMPRESTADO EM REGIME DE COMODATO (MODELO: ${o} / MAC Nº: ${c} ).

DISSE QUE QUER TER O ACESSO ÀS CONFIGURAÇÕES PARA FAZER ALTERAÇÕES EM NOME DE REDE, SENHA, ATUALIZAÇÃO DO FIRMWARE, ETC, POR CONTA PRÓPRIA SEM PRECISAR DO SUPORTE DA EMPRESA.

===============================

EXPLIQUEI E DEIXEI ${n} CIENTE DE QUE, A PARTIR DO MOMENTO EM QUE A SENHA FOR INFORMADA, O CLIENTE ASSUME TOTAL RESPONSABILIDADE PELO EQUIPAMENTO.

DESTAQUEI QUE O ACESSO FORNECIDO É DE ADMINISTRADOR E RECOMENDEI QUE NÃO SEJAM REALIZADAS ATUALIZAÇÕES DE FIRMWARE NEM O BLOQUEIO DO NOSSO ACESSO REMOTO, A FIM DE GARANTIR QUE A WBR POSSA FORNECER O SUPORTE NECESSÁRIO NO FUTURO.

INFORMEI TAMBÉM QUE, CASO O EQUIPAMENTO SOFRA QUALQUER DESCONFIGURAÇÃO (ESPONTÂNEA OU POR OUTRA RAZÃO), E SEJA NECESSÁRIO O ENVIO DE UM TÉCNICO AO LOCAL, SERÁ COBRADA UMA TAXA DE DESLOCAMENTO TÉCNICO NO VALOR DE R$50,00.

===============================

FOI ENCAMINHADO TERMO DE RESPONSABILIDADE, E ${n} CONCORDOU, E SENDO ASSIM ESTÁ CIENTE DE SUAS RESPONSABILIDADES PARA COM O REFERIDO EQUIPAMENTO EM COMODATO.

SEGUE PRINT EM ANEXO.

===============================

${blocoAcesso}

===============================
===============================

>>> Insira esse texto no aviso do PESSOAS OU EMPRESAS <<<
>>> Inserir TAMBÉM na área de OBSERVAÇÕES (dentro da aba TÉCNICO > EDITAR) <<<

CLIENTE TEM ACESSO AO ROTEADOR. ${''}
PROTOCOLO Nº ${s}`;

  // Termo para o CLIENTE ler e assinar (legado: termoRespTextoCliente). Estava
  // faltando no porte anterior, que só emitia o protocolo interno.
  const termoCliente = `${n} ENTROU EM CONTATO VIA ${maiusc(r)} (${i}) E SOLICITOU DESBLOQUEIO E LIBERAÇÃO PARA ACESSO AO ROTEADOR DA EMPRESA, QUE É EMPRESTADO EM REGIME DE COMODATO (MODELO: ${o} / MAC Nº: ${c}). MOTIVO: DISSE QUE QUER TER O ACESSO ÀS CONFIGURAÇÕES PARA FAZER ALTERAÇÕES EM NOME DE REDE, SENHA, ATUALIZAÇÃO DO FIRMWARE, ETC, POR CONTA PRÓPRIA SEM PRECISAR DO SUPORTE DA EMPRESA. EXPLIQUEI E DEIXEI ${n} CIENTE DE QUE ALTERANDO A CONFIGURAÇÃO PADRÃO DO EQUIPAMENTO QUE É REALIZADO PELO PROVEDOR, PERDEMOS O ACESSO REMOTO IMPEDINDO SUPORTE TÉCNICO REMOTO QUANDO SOLICITADO, OU SEJA, TODA INTERVENÇÃO AO EQUIPAMENTO POR PARTE DO PROVEDOR, PASSARÁ A SER POR VISITA TÉCNICA PRESENCIAL COM COBRANÇA DO SERVIÇO PRESTADO OU, CLIENTE OU QUEM ELE DESIGNAR TRAZER O EQUIPAMENTO À EMPRESA ISENTANDO ASSIM DE CUSTOS DE VISITAS. EXPLIQUEI E DEIXEI ${n} CIENTE DE QUE QUALQUER ALTERAÇÃO DE CONFIGURAÇÃO, ATUALIZAÇÃO DE FIRMWARE, ETC. QUE VIER A DANIFICAR O EQUIPAMENTO, ESTE SERÁ INUTILIZADO PELO PROVEDOR E CLIENTE TERÁ QUE ARCAR COM SEU VALOR ATUAL, PASSANDO ASSIM A SER DONO DO ROTEADOR E CASO ACONTEÇA, A EMPRESA PODERÁ INSTALAR OUTRO ROTEADOR EM REGIME DE COMODATO. ${n} DISSE ESTAR CIENTE DE SUAS RESPONSABILIDADES COM REFERIDO EQUIPAMENTO, E SOLICITOU LIBERAÇÃO E DESBLOQUEIO.

*ESTANDO DE ACORDO, RESPONDA: SIM ou CONCORDO.*

`;

  return { protocolo, os: '', termo: termoCliente };
}
