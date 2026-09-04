/**
 * Resolução de frase: override do banco vence o padrão do catálogo.
 *
 * Por que um store de módulo e não um hook/contexto: as funções de `render/*.ts`
 * são SÍNCRONAS e PURAS — `(valores: Valores) => SaidaOS`. Elas não podem esperar
 * um `await`, e mudar essa assinatura significaria reescrever os 47 renders e os
 * 47 testes de diff. Então os overrides são carregados ANTES do render, pela tela
 * que sabe fazer I/O (`GeradorOS.tsx`), e ficam aqui.
 *
 * A consequência a respeitar: quem renderiza é responsável por chamar
 * `carregarOverrides` antes. Se não chamar, tudo funciona — só serve o padrão do
 * código. Esse é o comportamento correto para falha de rede e é o comportamento
 * exigido nos testes (ver `limparOverrides`).
 */
import type { Catalogo } from './tipos';

/** Chave achatada `modelo|frase` → texto vigente. */
type MapaOverrides = Record<string, string>;

let vigentes: MapaOverrides = {};

const chaveDe = (modeloSlug: string, fraseChave: string) => `${modeloSlug}|${fraseChave}`;

/**
 * Publica os overrides carregados do banco. Substitui o mapa inteiro em vez de
 * mesclar: o que veio do banco é a verdade completa daquele carregamento, e
 * mesclar deixaria sobra de um modelo aberto antes na mesma sessão.
 */
export function carregarOverrides(mapa: MapaOverrides): void {
  vigentes = { ...mapa };
}

/**
 * Zera os overrides. Chamado no setup dos testes para garantir que os 47 diff
 * tests comparem sempre o PADRÃO DO CÓDIGO contra as fixtures — sem isso, uma
 * edição da líder do suporte quebraria o CI.
 */
export function limparOverrides(): void {
  vigentes = {};
}

/** Só para diagnóstico/teste: quantos overrides estão ativos. */
export function totalOverrides(): number {
  return Object.keys(vigentes).length;
}

/**
 * Interpola `{campo}` com os valores dados. Placeholder sem valor vira string
 * vazia — mesmo comportamento do render legado para campo não preenchido, o que
 * mantém a fidelidade das fixtures.
 */
export function interpolar(texto: string, vars: Record<string, string>): string {
  return texto.replace(/\{(\w+)\}/g, (_, campo: string) => vars[campo] ?? '');
}

/**
 * Uma frase resolvida durante um render, na ordem em que foi pedida.
 * É o que permite à tela de edição saber QUAL trecho da saída é QUAL frase.
 */
export interface FraseResolvida {
  chave: string;
  /** O texto já interpolado — exatamente como entrou na saída. */
  texto: string;
}

let trace: FraseResolvida[] | null = null;

/**
 * Liga o registro das frases resolvidas. O modo de edição chama isto, roda o
 * render normalmente e recebe a lista ordenada — sem que nenhum dos 47 renders
 * precise mudar de assinatura para expor sua estrutura.
 */
export function iniciarTrace(): void {
  trace = [];
}

/** Desliga o registro e devolve o que foi coletado. */
export function pararTrace(): FraseResolvida[] {
  const coletado = trace ?? [];
  trace = null;
  return coletado;
}

/**
 * Cria o resolvedor de frases de um modelo. Uso no render:
 *
 *     const f = fraseDe('manut-sinal-alto', MANUT_SINAL_ALTO);
 *     f('relato', { solicitante: s })
 *
 * Chave inexistente no catálogo é erro de programação (typo na extração), não
 * condição de runtime — por isso estoura em vez de devolver vazio em silêncio.
 */
export function fraseDe(modeloSlug: string, catalogo: Catalogo) {
  return (fraseChave: string, vars: Record<string, string> = {}): string => {
    const def = catalogo[fraseChave];
    if (!def) {
      throw new Error(
        `Frase "${fraseChave}" não existe no catálogo de "${modeloSlug}".`,
      );
    }
    const texto = interpolar(vigentes[chaveDe(modeloSlug, fraseChave)] ?? def.texto, vars);
    trace?.push({ chave: fraseChave, texto });
    return texto;
  };
}

/** True se a frase está sobrescrita — alimenta o marcador "modificada" na UI. */
export function temOverride(modeloSlug: string, fraseChave: string): boolean {
  return chaveDe(modeloSlug, fraseChave) in vigentes;
}

/**
 * Texto vigente CRU — com os `{placeholders}` intactos, sem interpolar.
 *
 * É o que a caixa de edição mostra. Não dá para reaproveitar o trecho que
 * apareceu na saída: aquele já veio interpolado ("QUESTIONADO JOAO"), e salvar
 * a partir dele gravaria o nome de um cliente dentro do modelo.
 */
export function textoVigente(
  modeloSlug: string,
  fraseChave: string,
  catalogo: Catalogo,
): string {
  return vigentes[chaveDe(modeloSlug, fraseChave)] ?? catalogo[fraseChave]?.texto ?? '';
}
