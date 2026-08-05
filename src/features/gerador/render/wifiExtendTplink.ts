/**
 * Emulação do modelo `wifi-extend-tplink` — porte 1:1 da função `Pqe` do bundle
 * legado (conteúdo de O.S do próprio app). ALT de plano com Wi-Fi Extend
 * (2º roteador em mesh) + agendamento de visita técnica isenta.
 *
 * `Pqe` é um builder COMPARTILHADO com assinatura `(valores, isento, modo)`.
 * Para TP-LINK a flag `isento` é o boolean `false` e o `modo` não é 'TPLINK'
 * (fixtures geradas com `Pqe(input, false)`), logo:
 *   - i (ofertado) e a (troca) não têm campo no formulário → sempre false;
 *   - os ramos gated por `troca === 'SIM'` (separador `hqe`, textos técnicos
 *     `Aqe`/`kqe`/`Oqe`) não constam no pacote e são inalcançáveis aqui.
 * Validado por diff contra o legado — ver `wifiExtendTplink.diff.test.ts`.
 */
import {
  maiusc,
  primeiroNome,
  soDigitos,
  type Valores,
} from './helpers';
import type { SaidaOS } from './altplanRemoto';

/** Espaços (legado: gM). */
const esp = (n: number) => ' '.repeat(n);

/** Separador padrão (legado: mqe = `*`.repeat(35)). */
const SEP = '*'.repeat(35);

/** Separador do ramo PJ + troca (legado: hqe = `=`.repeat(47)). */
const SEP_TROCA = '='.repeat(47);

/** Bloco espaçador curto (legado: jqe). */
function jqe(e: string): string {
  return e === 'A' ? '\n' + esp(4) + '\n' : e === 'C' ? '\n' + esp(8) + '\n' : '\n\n';
}

/** Bloco espaçador médio (legado: Mqe). */
function Mqe(e: string): string {
  return e === 'A' ? '\n' + esp(8) + '\n' : e === 'C' ? '\n' + esp(12) + '\n' : '\n\n';
}

/** Bloco espaçador do topo (legado: Nqe). */
function Nqe(e: string): string {
  return e === 'C' ? '\n' + esp(4) + '\n' : '\n\n';
}

/**
 * Sufixo comum das indicações técnicas (legado: `vM`). Todas as variantes
 * (`Dqe`/`Oqe`/`kqe`/`Aqe`) terminam com este mesmo bloco no bundle.
 */
const VM =
  ' EM LOCAL DE CONCORDANCIA DO CLIENTE E NA MELHOR ÁREA DE COBERTURA WI-FI. PADRONIZAR NOME DAS REDES ("NOME DO CLIENTE_WBR"), CONFERIR NAVEGAÇÃO IPv6, PADRONIZAR PORTA E SENHA DE ACESSO REMOTO, LIBERAR ACESSO EXTERNO PELA WAN; TESTAR ABRANGÊNCIA DA REDE WI-FI E EXPLICAR SOBRE COBERTURA, CONECTAR TODOS DISPOSITIVOS QUE APRESENTAR E REALIZAR TESTES, VERIFICAR E EXPLICAR SOBRE EQUIPAMENTOS QUE FUNCIONARAM MELHOR LIGADOS DIRETAMENTE AO ROTEADOR POR CABOS. BAIXAR E INSTALAR OS APP S QUE FAZEM PARTE DO PLANO ESCOLHIDO, TANTO NOS TELEFONES E TV S QUE POSSUÍREM COMPATIBILIDADE PARA FUNCIONAMENTO E NÃO HAVENDO DAR EXPLICAÇÕES. COLHER ASSINATURAS (O.S E CONTRATO), ENTREGAR DOCUMENTAÇÃO (VIAS DO CLIENTE), RECOLHER CARNÊ ANTIGO.';

/** Indicação técnica sem troca (legado: Dqe). */
const DQE_TECNICO =
  'TÉCNICO: PLANO JÁ ALTERADO PARA NOVO PLANO ESCOLHIDO. INSTALAR 2° ROTEADOR (MODELO COMPATIVEL AO PLANO)' +
  VM;

/** Indicação técnica com troca — TP-LINK, cliente PF (legado: kqe). */
const KQE_TECNICO =
  'TÉCNICO: PLANO JÁ ALTERADO PARA NOVO PLANO ESCOLHIDO. CONFERIR INSTALAÇÃO E EQUIPAMENTOS EM COMODATO, NÃO HAVENDO DANOS SUBSTITUIR ROTEADOR ATUAL (PRIMÁRIO) POR ONT TPLINK. INSTALAR 2° ROTEADOR (MODELO COMPATIVEL AO PLANO)' +
  VM;

/** Indicação técnica com troca — TP-LINK, cliente PJ (legado: Aqe). */
const AQE_TECNICO =
  'TÉCNICO: PLANO JÁ ALTERADO PARA NOVO PLANO ESCOLHIDO. CONFERIR INSTALAÇÃO E EQUIPAMENTOS EM COMODATO, NÃO HAVENDO DANOS SUBSTITUIR ROTEADOR ATUAL (PRIMÁRIO) POR ONT TPLINK . INSTALAR 2° ROTEADOR (MODELO COMPATIVEL AO PLANO)' +
  VM;

export function renderWifiExtendTplink(valores: Valores): SaidaOS {
  const v: Valores = {};
  for (const [k, val] of Object.entries(valores)) v[k] = String(val ?? '');

  // Flag `isento` (2º arg de Pqe) — para TP-LINK é o boolean false.
  const isento = false;

  const r = String(v.segmento ?? 'PF') === 'PJ';
  const i = String(v.origem ?? 'SOLICITADO') === 'OFERTADO';
  const a = String(v.troca ?? 'NAO') === 'SIM';
  const o = maiusc(v.cliente);
  const s = primeiroNome(o);
  const c = primeiroNome(maiusc(v.solicitante));
  const l = maiusc(v.cargo);
  const u = String(v.canal ?? '');
  const d = soDigitos(v.contato);
  const f = maiusc(v.sinalONU);
  const p = maiusc(v.bairro);
  const m = String(v.planoAtual ?? '');
  const h = String(v.planoEscolhido ?? '');
  const g = maiusc(v.roteador);
  const _ = maiusc(v.roteadorAtual);
  const y = String(v.dataVisita ?? '');
  const b = String(v.horaVisita ?? '');
  const x = String(v.protocolo ?? '');
  const S = String(v.vencimentoData ?? '');
  const C = String(v.obsLocal ?? '');
  const w = maiusc(C === 'OUTRO' ? v.obsOutro : C);
  const operador = maiusc(v.operadorPrimeiroNome); // técnico que gera a O.S — "(TÉCNICO)" da agenda

  const T = r ? `${c} (${l})` : s;
  const E = r ? c : s;
  // D = (r && a) ? hqe : mqe — separador `=`×47 no ramo PJ + troca, senão `*`×35.
  const D = r && a ? SEP_TROCA : SEP;
  const O = i ? 'C' : a ? 'B' : 'A';
  const k = r && !i;

  // Conexão do 2º roteador — usada no corpo da O.S e (junto com obsLocal) na
  // agenda, para não depender de o operador digitar cabeado/mesh à mão. Sem
  // seleção, mantém-se a redação original ("TRABALHA NA REDE MESH") no corpo.
  const conexao = String(v.conexaoExtend ?? '');
  const trechoConexao =
    conexao === 'CABO'
      ? 'CONECTADO VIA CABO AO ROTEADOR PRINCIPAL'
      : conexao === 'MESH'
        ? 'TRABALHA NA REDE MESH (SEM FIO)'
        : 'TRABALHA NA REDE MESH';

  const A = i
    ? `POR ${u} (${d}) OFERTEI À ${T} ALTERAÇÃO DE PLANO COM WI-FI EXTEND.`
    : `${T} ENTROU EM CONTATO VIA ${u} (${d}) SOLICITANDO INFORMAÇÕES SOBRE WI-FI EXTEND.`;
  const j = `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${f}`;
  const M = `QUESTIONADO, ${E} INFORMOU QUE SUA ${r ? 'EMPRESA' : 'RESIDÊNCIA'} É GRANDE E A REDE WI-FI NÃO ABRANGE TODA A ÁREA DE SUA ${r ? 'EMPRESA' : 'RESIDÊNCIA'}.`;
  const N = `PLANO ATUAL: ${m} CONTRATADO EM ${v.dataContrato ?? ''} COM FIDELIDADE DE 12 MESES. ROTEADOR: ${a ? _ : g}`;
  const P = `PLANO ${i ? 'OFERTADO' : 'ESCOLHIDO'}: ${h};\nFIDELIDADE DE 12 MESES`;
  const F = `${E} ESTÁ CIENTE DA RENOVAÇÃO DA FIDELIDADE POR 12 MESES E CONCORDOU COM OS TERMOS, E VISITA TÉCNICA ISENTA DE CUSTOS FOI AGENDADA PARA O DIA ${y} ÀS ${b} HRS, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO.`;

  const I = jqe(O);
  const R = Mqe(O);
  const z = Nqe(O);

  let B =
    A +
    `\n\n` +
    D +
    R +
    j +
    R +
    D +
    z +
    M +
    I +
    `INFORMEI AO CLIENTE QUE PARA CASOS COMO ESTE (RESIDENCIA GRANDE, SOBRADO, AREA DE LAZER ETC) TRABALHAMOS COM OS PLANOS QUE POSSUEM O WI-FI EXTEND.` +
    I +
    `EM RESUMO EXPLIQUEI QUE WI-FI EXTEND CONSISTE NUM SEGUNDO ROTEADOR ADICIONAL QUE ${trechoConexao}. ESTE EM SI UTILIZA O MESMO NOME DE REDE E SENHA DO ROTEADOR PRINCIPAL SENDO COMO UM ESCRAVO.\nESTE 2° ROTEADOR FICA EMPRESTADO EM REGIME DE COMODATO.` +
    I +
    N +
    I +
    P +
    I +
    D +
    I +
    `INFORMEI A NECESSIDADE DO AGENDAMENTO DE VISITA TÉCNICA PARA INSTALAÇÃO E CONFIGURAÇÃO DO ROTEADOR ADICIONAL, REALIZAR OS TESTES DE ABRANGÊNCIA, QUALIDADE, VELOCIDADE E SANAR TODAS AS DÚVIDAS QUE CLIENTE/USUÁRIOS POSSAM TER. \nVISITA ISENTA DE CUSTOS.` +
    I +
    D +
    I +
    F;
  if (k) {
    B += `\n\n` + D + `\n\nOBS.: ${w}\n\n`;
  }

  const V = i
    ? `POR ${u} (${d}) OFERTEI À ${T} ALTERAÇÃO DE PLANO DE INTERNET: PLANO ATUAL: ${m}. PLANO ESCOLHIDO: ${h}; VENCIMENTO: DIA ${S} DO MÊS; VIGÊNCIA DO CONTRATO: 12 MESES (VIDE CONTRATO). VISITA AGENDADA PARA ${y} ÀS ${b} HRS.`
    : `${T} SOLICITOU POR ${u} (${d}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${m}. PLANO ESCOLHIDO: ${h}; VENCIMENTO: DIA ${S} DO MÊS; VIGÊNCIA DO CONTRATO: 12 MESES (VIDE CONTRATO). VISITA AGENDADA PARA ${y} ÀS ${b} HRS.`;
  // ee = a ? (n==='TPLINK' ? (r?Aqe:kqe) : Oqe) : Dqe. Variante TP-LINK: com
  // troca, PJ → Aqe, PF → kqe; sem troca → Dqe.
  const ee = a ? (r ? AQE_TECNICO : KQE_TECNICO) : DQE_TECNICO;
  const te = V + `\n\n` + D + `\n\nINDICAÇÃO TÉCNICA:\n\n` + ee;

  const conexaoAgenda = conexao === 'CABO' ? 'CABEADO' : conexao === 'MESH' ? 'MESH (SEM FIO)' : '';
  const localEConexao = [w, conexaoAgenda].filter(Boolean).join(' - ');
  const H = `ALT PLANO + WIFI EXTEND ${o} PROT:${x} ISENTO (${operador}) - ${p} // ${localEConexao}`;

  return { protocolo: B, os: te, agenda: H };
}
