/**
 * Catálogo de frases do Gerador de O.S — a camada de TEXTO, separada da camada
 * de LÓGICA que vive em `render/*.ts`.
 *
 * Antes desta separação, cada render misturava as duas coisas: os `if/else` dos
 * ramos e os literais do texto, no mesmo arquivo. Isso tornava o texto ineditável
 * (é código) e o arquivo impossível de sincronizar entre MZnet e WBR (o texto
 * carrega o nome da empresa dentro dele — "APP MZNET" vs "APP WBR").
 *
 * Com o catálogo:
 *   render/*.ts    → lógica pura, idêntica nos dois provedores, sincroniza livre
 *   catalogo/*.ts  → o texto, por provedor, versionado no git
 *   os_frase_overrides (Supabase) → o que a líder do suporte editou, por provedor
 *
 * Ganho lateral: os ramos de um mesmo modelo repetem quase as mesmas frases
 * (no `manut-sinal-alto` são ~8 frases escritas 5 vezes cada). No catálogo cada
 * uma existe UMA vez — editar corrige os 5 ramos de uma vez.
 */

export interface FraseDef {
  /**
   * Nome legível da frase na tela de edição. Escrito para a líder do suporte,
   * não para quem programa: "Termos e custo da visita", não "custoVisita".
   */
  rotulo: string;

  /**
   * Texto padrão, com placeholders no formato `{campo}`. É a fonte da verdade
   * quando não há override no banco, e é SEMPRE ele que os testes de diff usam.
   *
   * Copiado byte a byte do render original na extração — inclusive espaços no
   * fim da linha, que fazem parte da saída conferida contra o legado.
   */
  texto: string;

  /**
   * Placeholders sem os quais a O.S sai incompleta. Salvar um texto que perdeu
   * qualquer um deles é rejeitado no service e desabilita o botão na UI.
   *
   * Aqui entram só os que causam dano real quando somem — uma data de visita
   * ausente vira uma O.S sem agendamento. Não é a lista de todos os campos
   * usados; é a lista dos que não podem faltar.
   */
  obrigatorios: readonly string[];

  /**
   * Trechos literais que a frase NÃO pode perder.
   *
   * Existe por causa de uma armadilha do legado: alguns modelos produzem
   * variantes reescrevendo o texto já gerado com regex — o modo "ofertado" da
   * alteração de plano troca "SOLICITANDO ALTERAÇÃO DE PLANO" por "OFERTEI A
   * ... ALTERAÇÃO DE PLANO", e o encerramento e a instalação com taxa fazem o
   * mesmo tipo de coisa. São 12 modelos.
   *
   * Se quem edita apagar a expressão que a regex procura, a variante para de
   * ser aplicada EM SILÊNCIO: a O.S sai dizendo que o cliente pediu quando na
   * verdade nós ofertamos. E o teste de diff não pega — as fixtures usam o
   * texto padrão, então continuam verdes.
   *
   * Declarar o trecho aqui faz a publicação ser recusada e a tela mostrar o
   * que não pode sumir. Só use para o que a lógica realmente lê de volta.
   */
  trechosProtegidos?: readonly string[];
}

/** Todas as frases de um modelo, indexadas pela chave usada no render. */
export type Catalogo = Record<string, FraseDef>;

/**
 * Extrai os placeholders `{campo}` presentes num texto, sem repetição.
 * Usado na validação e para montar os chips clicáveis do editor.
 */
export function placeholdersDe(texto: string): string[] {
  return [...new Set([...texto.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))];
}

/**
 * Placeholders obrigatórios que o texto perdeu. Vazio = pode salvar.
 * A validação é sobre PRESENÇA do marcador, não sobre o valor — o valor só
 * existe na hora de gerar a O.S.
 */
export function obrigatoriosFaltando(def: FraseDef, texto: string): string[] {
  return def.obrigatorios.filter((campo) => !texto.includes(`{${campo}}`));
}

/**
 * Trechos protegidos que o texto perdeu. Vazio = pode publicar.
 * Comparação literal e sensível a maiúsculas — é o que a regex faz.
 */
export function protegidosFaltando(def: FraseDef, texto: string): string[] {
  return (def.trechosProtegidos ?? []).filter((t) => !texto.includes(t));
}
