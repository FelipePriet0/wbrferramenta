/**
 * Emulação do modelo `manut-luz-vermelha-isento` — porte 1:1 da função `wWe` do
 * bundle legado (conteúdo de O.S do próprio app). Manutenção de "luz vermelha"
 * (ONU desconectada) com visita técnica ISENTA dentro de 7 dias. Ramifica nos 4
 * tipos de solicitação (titular/terceiro × acompanhamento). Retorna também
 * `agenda`. O 2º argumento do builder legado (`t`) é o primeiro nome do
 * operador, lido aqui de `valores.operadorPrimeiroNome`. Validado por diff
 * contra o legado — ver `manutLuzVermelhaIsento.diff.test.ts`.
 */
import { linhas, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';
import { fraseDe } from '../catalogo/store';
import { MANUT_LUZ_VERMELHA_ISENTO } from '../catalogo/manutLuzVermelhaIsento';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'manut-luz-vermelha-isento';

// `frase` e não `f`: `f` já é a ONU em maiúsculo (nome herdado do bundle).
const frase = fraseDe(SLUG, MANUT_LUZ_VERMELHA_ISENTO);

/** Espaço final que o legado deixava em várias linhas do Protocolo. */
const ESP = ' ';

/** Separador do fluxo titular-solicita-titular (default) — 28 iguais. (legado: dA) */
const SEP_MAN = '='.repeat(28);
/** Separador antes da INDICAÇÃO TÉCNICA na O.S — 39 iguais. (legado: pA) */
const SEP_OS = '='.repeat(39);
/**
 * Separador dos fluxos com terceiro (legado: fA). Sem fixtures que exercitem
 * esses fluxos e sem definição no pacote; adotado igual ao SEP_MAN. Só o fluxo
 * default (titular-solicita-titular) é validado por diff.
 */
const SEP_TERCEIRO = '='.repeat(28);
/** Bloco "INFORMEI QUE É NECESSÁRIA VISITA..." do Protocolo. (legado: mA) */
const INFO_VISITA = () => frase('visitaIsenta');

/** Espaços em branco. (legado: vA) */
function esp(n: number): string {
  return ' '.repeat(n);
}

/** Indicação técnica da O.S. (legado: yA) */
function indicacaoTecnica(nome: string): string {
  return frase('indicacaoTecnica', { pessoa: nome });
}

/** Bloco CTO da O.S (após o corpo). (legado: SWe) */
function ctoBloco(tipo: string, cto: string, passante: string): string {
  if (tipo === 'CTOE') return `\nCTOE: ${cto} // ${passante}.\n`;
  if (tipo === 'CTOI') return `\nCTOI // ${passante}.\n`;
  return '';
}

/**
 * Descrição do alarme na agenda (legado: xWe). Sem definição no pacote e sem
 * fixtures com alarme preenchido; adotado como MAIÚSCULO + trim (vazio → '').
 */
function descreveAlarme(v: unknown): string {
  return maiusc(v);
}

/** Linha da agenda de instalação. (legado: CWe) */
function montaAgenda(v: Valores, clienteMaiusc: string, operador: string): string {
  const tipo = v.ctoType || 'CTOE';
  let linha = frase('agenda', {
    alarme: descreveAlarme(v.alarme ?? ''),
    clienteCompleto: clienteMaiusc,
    protocolo: v.protocolo ?? '',
    tecnico: operador,
    bairro: maiusc(v.bairro),
  });
  if (tipo === 'CTOI') linha += ' *CTOI*';
  return linha;
}

export function renderManutLuzVermelhaIsento(valores: Valores): SaidaOS {
  const v: Valores = {};
  for (const [k, val] of Object.entries(valores)) v[k] = String(val ?? '');

  const tipo = v.tipoSolicitacao || 'titular-solicita-titular-acompanha';
  const operador = primeiroNome(maiusc(v.operadorPrimeiroNome));
  const clienteMaiusc = maiusc(v.cliente); // i
  const a = primeiroNome(clienteMaiusc); // a = _A(i)
  const solFull = maiusc(v.solicitante); // o
  const s = primeiroNome(solFull); // s = _A(o)
  const c = maiusc(v.parente); // c
  const l = v.canal ?? ''; // canal (raw)
  const u = soDigitos(v.contato); // u
  const d = soDigitos(v.contatoSol); // d
  const f = maiusc(v.onu); // f
  const p = primeiroNome(f); // p = _A(f)
  const m = maiusc(v.alarme); // m
  const h = v.dataVisita ?? ''; // h
  // 'apos-11' = janela de sábado ("Após às 11:00"): rende "A PARTIR DAS 11:00"
  // em vez de horário exato. Demais opções mantêm "AS <hora>".
  const gRaw = v.horaVisita ?? '';
  const g = gRaw === 'apos-11' ? 'A PARTIR DAS 11:00' : `AS ${gRaw}`; // g
  const cto = ctoBloco(v.ctoType || 'CTOE', maiusc(v.cto), maiusc(v.passante)); // _
  const agenda = montaAgenda(v, clienteMaiusc, operador); // v

  const base = {
    cliente: a, solicitante: s, parente: c, canal: l, onu: p,
    equipamento: f, alarme: m,
  };

  const montar = (protoLinhas: string[], osTexto: string): SaidaOS => ({
    protocolo: linhas(...protoLinhas),
    os: osTexto,
    agenda,
  });

  if (tipo === 'terceiro-solicita-terceiro-acompanha') {
    return montar(
      [
        frase('aberturaTerceiro', { ...base, contatoUsado: d }),
        '', SEP_TERCEIRO, esp(4),
        frase('statusOnu', base),
        esp(4), SEP_TERCEIRO, esp(4),
        frase('alarmeRelato', base),
        esp(4),
        frase('verificacaoRemota', base) + ESP,
        frase('orientacaoReinicio', { ...base, pessoa: s }) + ESP,
        esp(4),
        frase('perguntaIntervencao', { ...base, pessoa: s }) + ESP,
        '', SEP_TERCEIRO, '', INFO_VISITA(), '', SEP_TERCEIRO, '', '',
        `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${l} (${u}) COM ${a} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solFull} (${c}) ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${h} ${g} HRS.`,
        '',
        frase('semDuvidas'),
      ],
      `${s} (${c} DE ${a}) ENTROU EM CONTATO POR ${l} (${d}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE ${p} ESTA COM ${m}". REMOTAMENTE VERIFIQUEI QUE ${p} ESTA DESCONECTADO/APAGADA. ORIENTEI ${s} A DESCONECTAR EQUIPAMENTO (${f}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI A ${s} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIA VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E RESTABELECER A CONEXAO. VISITA ISENTA MEDIANTE EQUIPAMENTOS EMPRESTADOS ESTAREM EM PERFEITO ESTADO DE CONSERVACAO E INSTALACAO REALIZADA DENTRO DE 07 DIAS. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${l} (${u}) COM ${a} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solFull} (${c}) ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${h} ${g} HRS.` +
        cto +
        `${SEP_OS}\n${esp(18)}\nINDICACAO TECNICA:\n${esp(20)}\n${indicacaoTecnica(s)}`,
    );
  }

  if (tipo === 'terceiro-solicita-titular-acompanha') {
    return montar(
      [
        frase('aberturaTerceiro', { ...base, contatoUsado: d }),
        '', SEP_TERCEIRO, esp(4),
        frase('statusOnu', base),
        esp(4), SEP_TERCEIRO, esp(4),
        frase('alarmeRelato', base),
        esp(4),
        frase('verificacaoRemota', base) + ESP,
        `ORIENTEI ${s} A DESCONECTAR EQUIPAMENTOS (${f}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. `,
        esp(4),
        frase('perguntaIntervencao', { ...base, pessoa: s }) + ESP,
        esp(4), SEP_TERCEIRO, '', INFO_VISITA(), '', SEP_TERCEIRO, '',
        `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${l} (${u}) COM ${a} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${h} ${g} HRS.`,
        '',
        frase('semDuvidas'),
      ],
      `${s} (${c} DE ${a}) ENTROU EM CONTATO POR ${l} (${d}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE ${p} ESTA COM ${m}". REMOTAMENTE VERIFIQUEI QUE ${p} ESTA DESCONECTADO/APAGADA. ORIENTEI ${s} A DESCONECTAR EQUIPAMENTOS (${f}) DA REDE ELETRICA E RECONECTA-LOS APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI A ${s} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIA VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E RESTABELECER A CONEXAO. VISITA ISENTA MEDIANTE EQUIPAMENTOS EMPRESTADOS ESTAREM EM PERFEITO ESTADO DE CONSERVACAO E INSTALACAO REALIZADA DENTRO DE 07 DIAS. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${l} (${u}) COM ${a} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${h} ${g} HRS.` +
        cto +
        `${SEP_OS}\n\nINDICACAO TECNICA:\n\n${indicacaoTecnica(s)}`,
    );
  }

  if (tipo === 'titular-solicita-terceiro-acompanha') {
    return montar(
      [
        frase('aberturaTitular', { ...base, contatoUsado: u }),
        esp(20), SEP_TERCEIRO, esp(24),
        frase('statusOnu', base),
        esp(24), SEP_TERCEIRO, esp(24),
        frase('alarmeRelato', base),
        esp(24),
        frase('verificacaoRemota', base) + ESP,
        `ORIENTEI ${a} A DESCONECTAR EQUIPAMENTOS (${f}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. `,
        esp(24),
        frase('perguntaIntervencao', { ...base, pessoa: a }) + ESP,
        esp(24), SEP_TERCEIRO, esp(20), INFO_VISITA(), esp(20), SEP_TERCEIRO, esp(20),
        `${a} CONCORDOU COM OS TERMOS DA VISITA TECNICA. ${a} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solFull} (${c}) A ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${h} ${g} HRS.`,
        '',
        frase('semDuvidas'),
      ],
      `${a} ENTROU EM CONTATO POR ${l} (${u}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE ${p} ESTA COM ${m}". REMOTAMENTE VERIFIQUEI QUE ${p} ESTA DESCONECTADO/APAGADA. ORIENTEI ${a} A DESCONECTAR EQUIPAMENTOS (${f}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI A ${a} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIA VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E RESTABELECER A CONEXAO. VISITA ISENTA MEDIANTE EQUIPAMENTOS EMPRESTADOS ESTAREM EM PERFEITO ESTADO DE CONSERVACAO E INSTALACAO REALIZADA DENTRO DE 07 DIAS. ${a} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solFull} (${c}) A ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${h} ${g} HRS.` +
        cto +
        `${SEP_OS}\n\nINDICACAO TECNICA:\n${esp(20)}\n${indicacaoTecnica(a)}`,
    );
  }

  // titular-solicita-titular-acompanha (default)
  return montar(
    [
      frase('aberturaTitular', { ...base, contatoUsado: u }),
      '', SEP_MAN, '',
      frase('statusOnu', base),
      esp(8), SEP_MAN, esp(8),
      frase('alarmeRelato', base),
      esp(8),
      frase('verificacaoRemota', base) + ESP,
      `ORIENTEI ${a} A DESCONECTAR EQUIPAMENTOS (${f}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. `,
      esp(8),
      `PERGUNTEI A ${a} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.`,
      esp(8), SEP_MAN, '', INFO_VISITA(), esp(8), SEP_MAN, esp(8),
      `${a} CONCORDOU COM OS TERMOS DA VISITA TECNICA. DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${h} ${g} HRS.`,
      '',
      frase('semDuvidas'),
    ],
    `${a} ENTROU EM CONTATO POR ${l} (${u}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE ${p} ESTA COM ${m}". REMOTAMENTE VERIFIQUEI QUE ${p} ESTA DESCONECTADO/APAGADA. ORIENTEI ${a} A DESCONECTAR EQUIPAMENTOS (${f}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI A ${a} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIA VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E RESTABELECER A CONEXAO. VISITA ISENTA MEDIANTE EQUIPAMENTOS EMPRESTADOS ESTAREM EM PERFEITO ESTADO DE CONSERVACAO E INSTALACAO REALIZADA DENTRO DE 07 DIAS. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${h} ${g} HRS.` +
      cto +
      `${SEP_OS}\n\nINDICACAO TECNICA:\n\n${indicacaoTecnica(a)}`,
  );
}
