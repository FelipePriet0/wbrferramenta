/**
 * Modelo `feedback-sem-sucesso` — Feedback · Sem sucesso (2 tentativas).
 * Portado 1:1 do builder legado `lJe`. Saída única (`feedbackSemSucessoTexto`),
 * mapeada para `saida`. Registro de 2 tentativas de contato sem retorno do
 * cliente + estado da conexão. Ver `docs/gerador/sondagem2-suporte.md`.
 */
import type { Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

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

  const linhas = [
    `TENTATIVA DE FEEDBACK VIA ${canal1} (${contato1}) DIA ${dataHora1}, E NÃO FUI ATENDIDO`,
    ``,
    `TENTATIVA DE CONTATO VIA ${canal2} (${contato2}) DIA ${dataHora2}. NÃO HOUVE RETORNO POR PARTE DO CLIENTE`,
    ``,
    `PROTOCOLO SERÁ ENCERRADO COMO CONCLUÍDO`,
    `CONEXÃO ATIVA COM IP E SINAL DE FIBRA (${sinal})`,
    ``,
  ];
  if (dispositivosRadio === 'sim') {
    linhas.push(
      `(${equipWifi}) EQUIPAMENTO(S) CONECTADO(S) VIA WI-FI. E (${equipCabo}) VIA CABO DE REDE (PRINT EM ANEXO)`,
    );
  } else {
    linhas.push(`NÃO HÁ DISPOSITIVOS CONECTADOS NA INTERNET NO MOMENTO (PRINT EM ANEXO)`);
  }

  return { protocolo: '', os: '', saida: linhas.join('\n') };
}
