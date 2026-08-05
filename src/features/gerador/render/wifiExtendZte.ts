/**
 * Emulação do modelo `wifi-extend-zte` — porte 1:1 da função `Pqe` do bundle
 * legado (conteúdo de O.S do próprio app). Alteração de plano com Wi-Fi Extend
 * (2º roteador em mesh), ramo ZTE.
 *
 * `Pqe` é o builder COMPARTILHADO com `wifi-extend-tplink`; o 3º arg (`n`)
 * distingue a variante. Para ZTE `n` NÃO é 'TPLINK', logo:
 *   - `k` (bloco OBS.) = `r && !i` (só PJ sem oferta), diferente de TP-LINK
 *     (sempre true);
 *   - a indicação técnica com troca usa `Oqe` (substituir por ROTEADOR ZTE
 *     H199-A), não `kqe`/`Aqe`.
 * O modelo não expõe `origem` no formulário, então `i` (ofertado) fica sempre
 * false. `troca` e `conexaoExtend` são reconstruções fiéis do legado.
 * Validado por diff contra o legado — ver `wifiExtendZte.diff.test.ts`.
 */
import { maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
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
 * Sufixo comum das indicações técnicas (legado: `vM`). Tanto `Dqe` quanto `Oqe`
 * terminam com este mesmo bloco no bundle.
 */
const VM =
  ' EM LOCAL DE CONCORDANCIA DO CLIENTE E NA MELHOR ÁREA DE COBERTURA WI-FI. PADRONIZAR NOME DAS REDES ("NOME DO CLIENTE_WBR"), CONFERIR NAVEGAÇÃO IPv6, PADRONIZAR PORTA E SENHA DE ACESSO REMOTO, LIBERAR ACESSO EXTERNO PELA WAN; TESTAR ABRANGÊNCIA DA REDE WI-FI E EXPLICAR SOBRE COBERTURA, CONECTAR TODOS DISPOSITIVOS QUE APRESENTAR E REALIZAR TESTES, VERIFICAR E EXPLICAR SOBRE EQUIPAMENTOS QUE FUNCIONARAM MELHOR LIGADOS DIRETAMENTE AO ROTEADOR POR CABOS. BAIXAR E INSTALAR OS APP S QUE FAZEM PARTE DO PLANO ESCOLHIDO, TANTO NOS TELEFONES E TV S QUE POSSUÍREM COMPATIBILIDADE PARA FUNCIONAMENTO E NÃO HAVENDO DAR EXPLICAÇÕES. COLHER ASSINATURAS (O.S E CONTRATO), ENTREGAR DOCUMENTAÇÃO (VIAS DO CLIENTE), RECOLHER CARNÊ ANTIGO.';

/** Indicação técnica sem troca (legado: Dqe). */
const DQE_TECNICO =
  'TÉCNICO: PLANO JÁ ALTERADO PARA NOVO PLANO ESCOLHIDO. INSTALAR 2° ROTEADOR (MODELO COMPATIVEL AO PLANO)' +
  VM;

/** Indicação técnica com troca — ramo ZTE (legado: Oqe). */
const OQE_TECNICO =
  'TÉCNICO: PLANO JÁ ALTERADO PARA NOVO PLANO ESCOLHIDO. CONFERIR INSTALAÇÃO E EQUIPAMENTOS EM COMODATO, NÃO HAVENDO DANOS SUBSTITUIR ROTEADOR ATUAL (PRIMÁRIO) POR ROTEADOR ZTE H199-A. INSTALAR 2° ROTEADOR H-199A OU H-196A' +
  VM;

export function renderWifiExtendZte(valores: Valores): SaidaOS {
  const v: Valores = {};
  for (const [k, val] of Object.entries(valores)) v[k] = String(val ?? '');

  const r = String(v.segmento ?? 'PF') === 'PJ'; // PJ?  (legado: r)
  const i = String(v.origem ?? 'SOLICITADO') === 'OFERTADO'; // ofertado? (legado: i)
  const a = String(v.troca ?? 'NAO') === 'SIM'; // troca do roteador principal? (legado: a)
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
  const g = maiusc(v.roteador); // roteador atual (legado: g)
  const _ = maiusc(v.roteadorAtual); // roteador que sai na troca (legado: _)
  const y = String(v.dataVisita ?? '');
  const b = String(v.horaVisita ?? '');
  const x = String(v.protocolo ?? '');
  const S = String(v.vencimentoData ?? '');
  const C = String(v.obsLocal ?? '');
  const w = maiusc(C === 'OUTRO' ? v.obsOutro : C);
  const operador = maiusc(v.operadorPrimeiroNome); // técnico que gera a O.S — "(TÉCNICO)" da agenda

  const T = r ? `${c} (${l})` : s; // legado: T
  const E = r ? c : s; // legado: E
  // D = (r && a) ? hqe : mqe — separador `=`×47 no ramo PJ + troca, senão `*`×35.
  const D = r && a ? SEP_TROCA : SEP;
  const O = i ? 'C' : a ? 'B' : 'A';
  // k = n==='TPLINK' ? true : r && !i — ZTE (n≠TPLINK): só PJ sem oferta.
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
  // ee = a ? (n==='TPLINK' ? … : Oqe) : Dqe. Variante ZTE: com troca → Oqe;
  // sem troca → Dqe.
  const ee = a ? OQE_TECNICO : DQE_TECNICO;
  const te = V + `\n\n` + D + `\n\nINDICAÇÃO TÉCNICA:\n\n` + ee;

  const conexaoAgenda = conexao === 'CABO' ? 'CABEADO' : conexao === 'MESH' ? 'MESH (SEM FIO)' : '';
  const localEConexao = [w, conexaoAgenda].filter(Boolean).join(' - ');
  const H = `ALT PLANO + WIFI EXTEND ${o} PROT:${x} ISENTO (${operador}) - ${p} // ${localEConexao}`;

  return { protocolo: B, os: te, agenda: H };
}
