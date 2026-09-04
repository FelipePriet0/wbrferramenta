/**
 * Emulação do modelo `altplan-presencial` — porte 1:1 da função `bVe` do bundle
 * legado. Ramifica em titular/terceiro (sem modo ofertado). Validado por diff —
 * ver `altplanPresencial.diff.test.ts`.
 *
 * ⚠️ SEM TEXTO AQUI. O conteúdo mora em `../catalogo/altplanPresencial.ts`,
 * resolvido por `fraseDe`, que aplica o override publicado pela plataforma.
 * Aqui ficam os ramos, a ordem dos blocos, os separadores e os espaços de
 * diagramação (`ESP`) — que o catálogo não guarda porque são invisíveis para
 * quem edita e sumiriam no primeiro save.
 *
 * As cinco frases que vinham de `./frases.ts` também foram para o catálogo. Era
 * lá que morava o `APP "MZNET"`, o que fazia aquele arquivo divergir da WBR.
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
import { SEP } from './frases';
import type { SaidaOS } from './altplanRemoto';
import { fraseDe } from '../catalogo/store';
import { ALTPLAN_PRESENCIAL } from '../catalogo/altplanPresencial';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'altplan-presencial';

const f = fraseDe(SLUG, ALTPLAN_PRESENCIAL);

/** Espaço final que o legado deixava em duas frases. Diagramação, não conteúdo. */
const ESP = ' ';

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

  const base = {
    titular,
    solicitante: sol,
    parente,
    canal,
    contato,
    motivo,
    planoAtual,
    planoEscolhido,
    roteador,
    dataContrato,
    protocolo,
    sinal,
    ligData,
    ligHora,
    protData,
    protHora,
    atendData,
    atendHora,
  };

  const blocoPlano = [f('planoAtual', base), '', f('planoSolicitado', base)];
  const blocoOpcoes = [
    f('roteadorCompativel', base),
    f('opcoesIntro'),
    '',
    f('opcaoVisitaPaga'),
    '',
  ];

  if (tipo === 'terceiro') {
    return {
      protocolo: linhas(
        f('aberturaTerceiro', base),
        '', SEP, '',
        // Sem sinal fecha com ponto; com sinal, acrescenta a nota de oscilação.
        f('statusOnu', base) + (sinal === 'SEM SINAL' ? '.' : ESP + f('semOscilacao')),
        '', SEP,
        f('motivoCliente', base),
        '', ...blocoPlano, '',
        f('acessoTerceiro') + ESP,
        '', '', SEP, ...blocoOpcoes,
        f('opcaoRemota'), f('semCustos'), f('beneficiosAposAssinatura'), '', SEP, '',
        f('aceiteTerceiro', base),
        f('semDuvidas'),
      ),
      os: f('osTerceiro', base),
    };
  }

  // titular (padrão)
  return {
    protocolo: linhas(
      f('aberturaTitular', base),
      '', SEP, '',
      f('statusOnu', base),
      '', SEP,
      f('motivoCliente', base),
      '', ...blocoPlano, '',
      f('acessoTitular') + ESP,
      '', '', SEP, ...blocoOpcoes,
      `${f('opcaoRemota')} ${f('semCustos')}`, '', f('beneficiosAposAssinatura'), '', SEP, '',
      f('aceiteTitular', base),
    ),
    os: f('osTitular', base),
  };
}
