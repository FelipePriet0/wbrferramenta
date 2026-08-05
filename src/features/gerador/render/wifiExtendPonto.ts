/**
 * Emulação do modelo `wifi-extend-ponto` — porte 1:1 da função `Jqe` do bundle
 * legado (venda de ponto adicional / roteador extend). SEM variável de tipo;
 * ramifica só em segmento (PF/PJ) e troca do roteador primário. 2º arg =
 * operador. Validado por diff contra o legado — ver `wifiExtendPonto.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

/** Separador da O.S (legado: mqe). */
const SEP_OS = '*'.repeat(35);

/** Indicação técnica padrão, sem troca do roteador primário (legado: Kqe). */
const INDICACAO_PADRAO =
  'TÉCNICO: INSTALAR ROTEADOR (MODELO COMPATIVEL AO PLANO) EM LOCAL DE CONCORDANCIA DO CLIENTE E NA MELHOR ÁREA DE COBERTURA WI-FI. CONFIGURAR REDE, CONECTAR TODOS DISPOSITIVOS QUE APRESENTAREM, REALIZAR TESTES DA FUNCIONALIDADE DA INTERNET, AFERIR PLANO COM DISPOSITIVOS DO CLIENTE E OUTROS QUE ESTIVEREM NO LOCAL, FOTOGRAFAR, FILMAR, COMPARAR E EXPLICAR. CORRIGIR QUALQUER INCONSISTÊNCIAS NA INSTALAÇÃO QUE NÃO ESTIVER NO PADRÃO. RECEBER O VALOR DO EQUIPAMENTO E SERVIÇO NA FORMA COMBINADA. TEMPO ESTIMADO 60 MIN.';

/** Indicação técnica com troca do roteador primário (legado: qqe). */
function indicacaoTroca(roteador: string): string {
  return `TÉCNICO: CONFERIR INSTALAÇÃO E EQUIPAMENTOS EM COMODATO, NÃO HAVENDO DANOS SUBSTITUIR ROTEADOR ${roteador} POR ROTEADOR ZTE H-199A E CONFIGURAR COMO PONTO PRINCIPAL. INSTALAR ROTEADOR EXTEND ZTE H-199A OU H-196A EM LOCAL DE CONCORDANCIA DO CLIENTE E NA MELHOR ÁREA DE COBERTURA WI-FI. PADRONIZAR NOME DAS REDES ("NOME DO CLIENTE_WBR"), CONFERIR NAVEGAÇÃO IPv6, PADRONIZAR PORTA E SENHA DE ACESSO REMOTO, LIBERAR ACESSO EXTERNO PELA WAN; TESTAR ABRANGÊNCIA DA REDE WI-FI E EXPLICAR SOBRE COBERTURA, CONECTAR TODOS DISPOSITIVOS QUE APRESENTAR E REALIZAR TESTES, VERIFICAR E EXPLICAR SOBRE EQUIPAMENTOS QUE FUNCIONARAM MELHOR LIGADOS DIRETAMENTE AO ROTEADOR POR CABOS. BAIXAR E INSTALAR OS APP S QUE FAZEM PARTE DO PLANO ESCOLHIDO, TANTO NOS TELEFONES E TV S QUE POSSUÍREM COMPATIBILIDADE PARA FUNCIONAMENTO E NÃO HAVENDO DAR EXPLICAÇÕES. RECEBER O VALOR DO EQUIPAMENTO E SERVIÇO NA FORMA COMBINADA. TEMPO ESTIMADO 60 MIN.`;
}

export function renderWifiExtendPonto(valores: Valores): SaidaOS {
  const v: Valores = {};
  for (const [k, val] of Object.entries(valores)) v[k] = String(val ?? '');

  const operador = v.operadorPrimeiroNome ?? '';
  const ehPJ = maiusc(v.segmento ?? 'PF') === 'PJ';
  const ehTroca = String(v.troca ?? 'NAO') === 'SIM';
  const cliente = maiusc(v.cliente);
  const clientePrimeiro = primeiroNome(cliente);
  const solicitante = primeiroNome(maiusc(v.solicitante));
  const cargo = maiusc(v.cargo);
  const canal = v.canal ?? '';
  const contato = soDigitos(v.contato);
  const bairro = maiusc(v.bairro);
  const dataVisita = v.dataVisita ?? '';
  const horaVisita = v.horaVisita ?? '';
  const protocolo = v.protocolo ?? '';
  const parcela = v.parcela ?? '';
  const formaPag = v.formaPag ?? '';
  const roteador = maiusc(v.roteador);

  const quem = ehPJ ? `${solicitante} (${cargo})` : clientePrimeiro;
  const local = ehPJ ? 'EMPRESA' : 'RESIDÊNCIA';
  const ponto = ehTroca ? `(${roteador})` : '(ROTEADOR PRIMÁRIO)';
  const pagFrase = fraseFormaPag(formaPag);

  const os =
    `POR ${canal} (${contato}) ${quem} SOLICITOU A COMPRA DE 01 ROTEADOR ADICIONAL PARA EXPANDIR A ABRANGÊNCIA DA REDE WI-FI DENTRO DA MESMA ${local} EM QUE FOI INSTALADO O PONTO PRINCIPAL ${ponto}. VALOR ACORDADO DO ROTEADOR R$360,00 QUE SERÁ PAGO EM ${parcela} ${pagFrase}. E INSTALAÇÃO/CONFIGURAÇÃO GRÁTIS. VISITA AGENDADA PARA INSTALAÇÃO DO EQUIPAMENTO EM ${dataVisita} ÀS ${horaVisita} HORAS.`;

  const indicacao = ehTroca ? indicacaoTroca(roteador) : INDICACAO_PADRAO;

  const pontoTextoOS = `${os}\n\n${SEP_OS}\n\nINDICAÇÃO TÉCNICA:\n\n${indicacao}`;
  const pontoTextoAgenda = `PONTO ADICIONAL ${cliente} PROT:${protocolo} ${maiusc(formaPag)} (${operador}) - ${bairro}`;

  return { protocolo: '', os: pontoTextoOS, agenda: pontoTextoAgenda };
}
