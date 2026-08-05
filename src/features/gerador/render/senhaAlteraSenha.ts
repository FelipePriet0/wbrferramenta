/**
 * Emulação do modelo `senha-altera-senha` — porte 1:1 da função `uqe` do bundle
 * legado (conteúdo de O.S do próprio app). Alteração de SSID/Senha do Wi-Fi:
 * sem visita técnica, saída única de Protocolo (a O.S sai sempre vazia). Sem
 * variável `tipoSolicitacao`; a ramificação (bloco SSID / bloco senha) vem do
 * campo `solicitacao`. O 2º argumento do builder legado é o
 * `operadorPrimeiroNome`, que este modelo não usa no corpo do texto.
 * Validado por diff contra o legado — ver `senhaAlteraSenha.diff.test.ts`.
 */
import { maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

/** Separador de asteriscos no Protocolo. (legado: oqe) */
const SEP = '*'.repeat(23);
/** Solicitação: só SSID. (legado: sM) */
const SO_SSID = 'SSID';
/** Solicitação: só senha. (legado: oM) */
const SO_SENHA = 'SENHA';
/** Solicitação: SSID e senha. (legado: cM) */
const SO_SSID_SENHA = 'SSID E SENHA';

export function renderSenhaAlteraSenha(valores: Valores): SaidaOS {
  const t: Valores = {};
  for (const [k, val] of Object.entries(valores)) t[k] = String(val ?? '');

  const n = primeiroNome(maiusc(t.cliente));
  const r = t.canal;
  const i = soDigitos(t.contato);
  const a = maiusc(t.sinalONU);
  const o = maiusc(t.solicitacao);
  const s = t.atualSSID;
  const c = t.novoSSID;
  const l = t.atualSenha;
  const u = t.novaSenha;
  const mostraSSID = o === SO_SSID || o === SO_SSID_SENHA;
  const mostraSenha = o === SO_SENHA || o === SO_SSID_SENHA;
  // Regência do artigo em núcleos compostos: "DA SSID E DA SENHA" / "A SSID E A
  // SENHA" (o artigo isolado só concordaria com o primeiro núcleo).
  const oComDe = o === SO_SSID_SENHA ? 'SSID E DA SENHA' : o;
  const oComA = o === SO_SSID_SENHA ? 'SSID E A SENHA' : o;

  const p = [
    `${n} ENTROU EM CONTATO POR ${r} (${i}) E SOLICITOU A ALTERAÇÃO DA ${oComDe} DO WI-FI.`,
    '',
    SEP,
    '',
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO, E ONU ${a} SEM OSCILAÇÃO.`,
    '',
    SEP,
    '',
    `QUESTIONADO, ${n} DESEJA ALTERAR A ${oComA} DE SUA REDE WI-FI POR MOTIVO PESSOAL.`,
    '    ',
  ];

  if (mostraSSID) p.push(`SSID ATUAL: ${s}`, `SSID NOVA: ${c}`);
  if (mostraSSID && mostraSenha) p.push('');
  if (mostraSenha) p.push(`SENHA ATUAL: ${l}`, `SENHA NOVA: ${u}`);
  const alterado = o === SO_SSID_SENHA ? 'ALTERADAS' : 'ALTERADA';
  p.push('', '    ', `${o} ${alterado} COM SUCESSO E ${n} CONFIRMOU CONEXÃO.`);

  return { protocolo: p.join('\n'), os: '' };
}
