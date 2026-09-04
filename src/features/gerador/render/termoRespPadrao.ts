/**
 * Emulação do modelo `termo-resp-padrao` — porte 1:1 da função `iJe` do bundle
 * legado (conteúdo de O.S do próprio app). Termo de responsabilidade de acesso
 * ao roteador em comodato. SEM variável de tipo. 2º arg = operador (não usado no
 * corpo do texto). Validado por diff contra o legado — ver
 * `termoRespPadrao.diff.test.ts`.
 */
import { maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

import { fraseDe } from '../catalogo/store';
import { TERMO_RESP_PADRAO } from '../catalogo/termoRespPadrao';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'termo-resp-padrao';

const f = fraseDe(SLUG, TERMO_RESP_PADRAO);

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
  const base = {
    cliente: n, canal: maiusc(r), contato: i, sinalONU: a, roteador: o,
    mac: c, user: l, senha: u, protocolo: s,
  };

  const blocoAcesso =
    String(t.testouSenha ?? '') === 'nao'
      ? f('naoTestouSenha', base)
      : `${f('repasseiAcesso', base)}

${f('linhaUsuario', base)}
${f('linhaSenha', base)}

${f('confirmouAcesso', base)}`;

  const protocolo = `${f('abertura', base)}

===============================

${f('statusOnu', base)}

===============================

${f('pedidoAcesso', base)}

${f('motivoAcesso')}

===============================

${f('assumeResponsabilidade', base)}

${f('acessoAdministrador')}

${f('taxaDesconfiguracao')}

===============================

${f('termoEncaminhado', base)}

${f('printAnexo')}

===============================

${blocoAcesso}

===============================
===============================

${f('instrucaoAviso')}
${f('instrucaoObservacoes')}

${f('avisoAcesso')} ${''}
${f('avisoProtocolo', base)}`;

  // Termo para o CLIENTE ler e assinar (legado: termoRespTextoCliente). Estava
  // faltando no porte anterior, que só emitia o protocolo interno.
  const termoCliente = `${f('termoCliente', base)}

${f('termoAceite')}

`;

  return { protocolo, os: '', termo: termoCliente };
}
