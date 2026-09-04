/**
 * Frases do Gerador de O.S — leitura das vigentes e publicação de alterações.
 *
 * Conversa direto com o Supabase pelo client, como o resto de `src/services/*`.
 * Não há API route: a segurança é a RLS de `os_frase_overrides` (SELECT para
 * autenticado, INSERT só para gestor/lider_suporte e em nome próprio).
 *
 * A tabela é append-only: publicar é INSERT, voltar ao padrão é INSERT com
 * texto NULL, restaurar versão antiga é INSERT com o texto antigo. Nada aqui
 * faz UPDATE ou DELETE — o banco nem tem policy para isso.
 */
import { supabase } from '@/lib/supabase';
import {
  obrigatoriosFaltando,
  protegidosFaltando,
  type Catalogo,
} from '@/features/gerador/catalogo/tipos';

export interface FraseVigente {
  modelo_slug: string;
  frase_chave: string;
  /** NULL = a linha vigente manda usar o padrão do código. */
  texto: string | null;
  autor_id: string;
  criado_em: string;
}

export interface FraseHistorico extends FraseVigente {
  id: string;
  autor_nome: string | null;
}

/**
 * Overrides vigentes de um modelo, no formato que o store consome
 * (`'modelo|frase'` → texto).
 *
 * Linhas com `texto: null` são omitidas de propósito: elas significam "voltou ao
 * padrão", e a ausência da chave no mapa é exatamente como o store representa
 * isso. Sem esse filtro, a frase revertida viraria string vazia na O.S.
 */
export async function carregarOverridesDoModelo(
  modeloSlug: string,
): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('os_frase_vigente')
    .select('modelo_slug, frase_chave, texto')
    .eq('modelo_slug', modeloSlug);

  if (error) throw new Error(error.message);

  const mapa: Record<string, string> = {};
  for (const linha of (data ?? []) as Pick<
    FraseVigente,
    'modelo_slug' | 'frase_chave' | 'texto'
  >[]) {
    if (linha.texto === null) continue;
    mapa[`${linha.modelo_slug}|${linha.frase_chave}`] = linha.texto;
  }
  return mapa;
}

/** Quem editou a frase e quando — alimenta o "editada por Marina · 12/09". */
export interface MetaFrase {
  autor_nome: string | null;
  criado_em: string;
}

/**
 * Tudo o que a tela precisa de uma vez: os overrides para o store e os metadados
 * para os marcadores de "modificada".
 *
 * São duas consultas porque `os_frase_vigente` é uma VIEW — o PostgREST não
 * detecta a FK para `profiles` através dela, então o embed não funciona. A
 * segunda busca só os autores que de fato aparecem.
 */
export async function carregarEstadoDoModelo(modeloSlug: string): Promise<{
  overrides: Record<string, string>;
  metas: Record<string, MetaFrase>;
}> {
  const { data, error } = await supabase
    .from('os_frase_vigente')
    .select('modelo_slug, frase_chave, texto, autor_id, criado_em')
    .eq('modelo_slug', modeloSlug);

  if (error) throw new Error(error.message);
  const linhas = (data as FraseVigente[]) ?? [];

  const nomes = await nomesDeAutores(linhas.map((l) => l.autor_id));

  const overrides: Record<string, string> = {};
  const metas: Record<string, MetaFrase> = {};
  for (const l of linhas) {
    // texto NULL = voltou ao padrão: sem override E sem marcador de modificada.
    if (l.texto === null) continue;
    overrides[`${l.modelo_slug}|${l.frase_chave}`] = l.texto;
    metas[l.frase_chave] = {
      autor_nome: nomes[l.autor_id] ?? null,
      criado_em: l.criado_em,
    };
  }
  return { overrides, metas };
}

async function nomesDeAutores(ids: string[]): Promise<Record<string, string | null>> {
  const unicos = [...new Set(ids)];
  if (unicos.length === 0) return {};

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', unicos);

  // Falhar aqui não pode derrubar a tela: sem o nome, o marcador mostra só a
  // data. É informação secundária.
  if (error) return {};

  const mapa: Record<string, string | null> = {};
  for (const p of (data ?? []) as { id: string; full_name: string | null }[]) {
    mapa[p.id] = p.full_name;
  }
  return mapa;
}

/**
 * Publica uma alteração de frase. Vale para todos os atendentes imediatamente —
 * não há rascunho, por decisão de produto.
 *
 * Valida os placeholders obrigatórios ANTES de bater no banco: perder um
 * `{dataVisita}` produz uma O.S sem agendamento, e esse é o tipo de erro que
 * ninguém percebe até o técnico chegar na casa errada no dia errado.
 */
export async function publicarFrase(params: {
  modeloSlug: string;
  fraseChave: string;
  texto: string;
  catalogo: Catalogo;
}): Promise<void> {
  const { modeloSlug, fraseChave, texto, catalogo } = params;

  const def = catalogo[fraseChave];
  if (!def) {
    throw new Error(`Frase "${fraseChave}" não existe no catálogo de "${modeloSlug}".`);
  }

  const faltando = obrigatoriosFaltando(def, texto);
  if (faltando.length > 0) {
    throw new Error(
      `Faltam campos obrigatórios: ${faltando.map((c) => `{${c}}`).join(', ')}.`,
    );
  }

  // Sem isto, uma edição inocente desliga uma variante do modelo em silêncio.
  const protegidos = protegidosFaltando(def, texto);
  if (protegidos.length > 0) {
    throw new Error(
      `Estes trechos não podem ser removidos: ${protegidos.map((t) => `"${t}"`).join(', ')}.`,
    );
  }

  // Texto igual ao padrão não vira override — vira reversão. Assim a frase
  // perde o marcador "modificada" em vez de ficar sobrescrita com o próprio
  // padrão, o que confundiria na hora de um sync trazer texto novo do código.
  const ehPadrao = texto === def.texto;
  await inserir(modeloSlug, fraseChave, ehPadrao ? null : texto);
}

/** Volta a frase ao padrão do código (INSERT com texto NULL, não DELETE). */
export async function voltarAoPadrao(
  modeloSlug: string,
  fraseChave: string,
): Promise<void> {
  await inserir(modeloSlug, fraseChave, null);
}

/**
 * Histórico completo de uma frase, do mais recente para o mais antigo.
 * Como nada é apagado, isto é o registro íntegro de quem mudou o quê e quando.
 */
export async function listarHistoricoFrase(
  modeloSlug: string,
  fraseChave: string,
): Promise<FraseHistorico[]> {
  const { data, error } = await supabase
    .from('os_frase_overrides')
    .select('id, modelo_slug, frase_chave, texto, autor_id, criado_em, profiles(full_name)')
    .eq('modelo_slug', modeloSlug)
    .eq('frase_chave', fraseChave)
    .order('criado_em', { ascending: false });

  if (error) throw new Error(error.message);

  // O supabase-js tipa todo embed como array, mesmo quando a FK é
  // muitos-para-um e o retorno em runtime é um objeto só. Aceitamos as duas
  // formas em vez de forçar o cast para uma delas — a que chegar, funciona.
  type Autor = { full_name: string | null };
  type Linha = Omit<FraseHistorico, 'autor_nome'> & {
    profiles: Autor | Autor[] | null;
  };

  return ((data ?? []) as unknown as Linha[]).map(({ profiles, ...resto }) => ({
    ...resto,
    autor_nome:
      (Array.isArray(profiles) ? profiles[0]?.full_name : profiles?.full_name) ?? null,
  }));
}

/** INSERT único de toda a escrita — o `autor_id` é exigido pela policy de RLS. */
async function inserir(
  modeloSlug: string,
  fraseChave: string,
  texto: string | null,
): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) throw new Error('Sessão expirada — entre novamente para publicar.');

  const { error } = await supabase.from('os_frase_overrides').insert({
    modelo_slug: modeloSlug,
    frase_chave: fraseChave,
    texto,
    autor_id: uid,
  });

  if (error) throw new Error(error.message);
}
