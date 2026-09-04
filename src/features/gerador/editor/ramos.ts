/**
 * Em quantos ramos do modelo cada frase aparece.
 *
 * Existe para responder, no cabeçalho do editor, a pergunta que a líder do
 * suporte faz antes de mudar qualquer coisa: "se eu editar aqui, quebra o PJ?".
 * Quase sempre a resposta é "não, é a mesma frase nos 5 tipos" — mas isso
 * precisa estar escrito na tela, não ser descoberto na prática.
 *
 * O número é medido, não declarado: roda o render uma vez por opção do campo
 * variável (tipo de solicitação) e conta em quantas o trace citou a frase.
 * Cinco renders de string custam nada e o resultado nunca desatualiza.
 */
import type { SaidaOS } from '../render/altplanRemoto';
import type { Valores } from '../render/helpers';
import { iniciarTrace, pararTrace } from '../catalogo/store';

export function contarRamos(
  render: (v: Valores) => SaidaOS,
  variavelId: string | undefined,
  opcoes: readonly string[],
  valores: Valores,
): Record<string, number> {
  // Modelo sem campo variável tem um ramo só — toda frase aparece nele.
  const cenarios =
    variavelId && opcoes.length > 0
      ? opcoes.map((o) => ({ ...valores, [variavelId]: o }))
      : [valores];

  const contagem: Record<string, number> = {};

  for (const cenario of cenarios) {
    iniciarTrace();
    try {
      render(cenario);
    } catch {
      // Um ramo que estoura com os valores atuais não invalida a contagem dos
      // outros — o objetivo aqui é informar, não gerar O.S.
      pararTrace();
      continue;
    }
    const chavesDoRamo = new Set(pararTrace().map((f) => f.chave));
    for (const chave of chavesDoRamo) {
      contagem[chave] = (contagem[chave] ?? 0) + 1;
    }
  }

  return contagem;
}
