/**
 * Modelo `feedback-sem-sucesso` — Feedback · Sem sucesso (2 tentativas).
 * Portado 1:1 do builder legado `lJe`. Saída única (`feedbackSemSucessoTexto`),
 * mapeada para `saida`. Registro de 2 tentativas de contato sem retorno do
 * cliente + estado da conexão. Ver `docs/gerador/sondagem2-suporte.md`.
 */
import type { Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

import { fraseDe } from '../catalogo/store';
import { FEEDBACK_SEM_SUCESSO } from '../catalogo/feedbackSemSucesso';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'feedback-sem-sucesso';

const f = fraseDe(SLUG, FEEDBACK_SEM_SUCESSO);

export function renderFeedbackSemSucesso(valores: Valores): SaidaOS {
  const v = (id: string) => valores[id] ?? '';
  const canal1 = v('canal1');
  const contato1 = v('contato1').replace(/\D/g, '');
  const dataHora1 = v('dataHora1');
  const canal2 = v('canal2');
  const contato2 = v('contato2').replace(/\D/g, '');
  const dataHora2 = v('dataHora2');
  const sinal = v('sinal');
  const dispositivosRadio = valores['dispositivosRadio'] || 'nao';
  const equipWifi = v('equipWifi');
  const equipCabo = v('equipCabo');

  const base = { canal1, contato1, dataHora1, canal2, contato2, dataHora2, sinal, equipWifi, equipCabo };

  const linhas = [
    f('primeiraTentativa', base),
    ``,
    f('segundaTentativa', base),
    ``,
    f('encerramento'),
    f('conexaoAtiva', base),
    ``,
  ];
  if (dispositivosRadio === 'sim') {
    linhas.push(
      f('dispositivosConectados', base),
    );
  } else {
    linhas.push(f('semDispositivos'));
  }

  return { protocolo: '', os: '', saida: linhas.join('\n') };
}
