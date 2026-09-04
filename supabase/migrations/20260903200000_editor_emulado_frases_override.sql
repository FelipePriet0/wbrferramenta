-- Editor do Emulado — a líder do suporte edita o texto da O.S pela plataforma.
--
-- Contexto: os textos do Gerador de O.S vivem em `src/features/gerador/render/*.ts`,
-- 47 arquivos e ~5.900 linhas de código imperativo portado 1:1 do bundle legado.
-- Mudar uma vírgula exigia deploy. Esta tabela é a camada que permite alterar o
-- texto sem tocar em código — SEM migrar os 5.900 linhas para o banco.
--
-- O desenho é DEFAULT NO CÓDIGO + OVERRIDE ESPARSO AQUI:
--   - o texto padrão continua em `src/features/gerador/catalogo/*.ts`, versionado
--     no git, revisável em code review, e é o que os testes de diff usam;
--   - esta tabela nasce VAZIA e só ganha linha quando alguém edita de fato;
--   - banco indisponível ou linha ausente = cai no padrão do código. O gerador
--     nunca para de funcionar por causa desta feature.
--
-- APPEND-ONLY. Cada save INSERE uma linha nova; a mais recente de cada
-- (modelo_slug, frase_chave) é a vigente. Não há UPDATE nem DELETE — de
-- propósito, e é por isso que NÃO existe policy para eles mais abaixo:
--   - "voltar ao padrão do código"  → INSERT com texto = NULL
--   - "restaurar a versão de ontem" → INSERT com o texto de ontem
-- Assim o histórico é imutável: ninguém reescreve o passado, nem a líder do
-- suporte, nem quem tem acesso ao banco pela aplicação.
--
-- Quem escreve: gestor + lider_suporte, mesmo par que decide aprovação de Mud End
-- (ver MudEndAprovacaoBar.tsx). O gestor entra porque é admin e enxerga tudo; a
-- decisão de conteúdo é da líder do suporte.

CREATE TABLE public.os_frase_overrides (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- slug do modelo no registry do gerador (ex.: 'manut-sinal-alto').
  modelo_slug  text NOT NULL,
  -- chave da frase dentro do catálogo do modelo (ex.: 'relato').
  frase_chave  text NOT NULL,
  -- texto com placeholders no formato {campo}. NULL = voltar ao padrão do código.
  texto        text,
  autor_id     uuid NOT NULL REFERENCES public.profiles(id),
  criado_em    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.os_frase_overrides IS
  'Override de frase do Gerador de O.S. Append-only: a linha mais recente de cada (modelo_slug, frase_chave) vence; texto NULL volta ao padrão do código.';

-- Serve o DISTINCT ON da view (mesma ordenação) e o histórico de uma frase.
CREATE INDEX os_frase_overrides_vigente_idx
  ON public.os_frase_overrides (modelo_slug, frase_chave, criado_em DESC);

-- Só o modelo_slug: a tela do gerador carrega todas as frases de um modelo de uma vez.
CREATE INDEX os_frase_overrides_modelo_idx
  ON public.os_frase_overrides (modelo_slug);

-- Vigente = última linha de cada (modelo, frase). `security_invoker = on` é
-- OBRIGATÓRIO: sem ele a view roda com os privilégios do owner e fura a RLS da
-- tabela de baixo.
CREATE VIEW public.os_frase_vigente
  WITH (security_invoker = on) AS
SELECT DISTINCT ON (modelo_slug, frase_chave)
       modelo_slug,
       frase_chave,
       texto,
       autor_id,
       criado_em
FROM   public.os_frase_overrides
ORDER  BY modelo_slug, frase_chave, criado_em DESC;

ALTER TABLE public.os_frase_overrides ENABLE ROW LEVEL SECURITY;

-- Leitura liberada a qualquer autenticado: TODO atendente precisa das frases
-- vigentes para gerar a O.S. Restringir aqui quebraria o gerador para o time.
CREATE POLICY os_frase_overrides_select ON public.os_frase_overrides
  FOR SELECT TO authenticated
  USING (true);

-- Escrita: gestor sempre; líder do suporte onde esse papel existir. O `autor_id
-- = auth.uid()` impede assinar alteração como outra pessoa — o histórico só vale
-- se a autoria for confiável.
--
-- Por que o bloco dinâmico em vez de um ARRAY literal: este arquivo roda nos
-- DOIS provedores. Na MZnet o enum `user_role` tem `lider_suporte` e é ela quem
-- edita o texto; na WBR o enum não tem esse valor e a decisão foi deixar a
-- edição com o `gestor`. Um literal `'lider_suporte'::user_role` faria a
-- migration ESTOURAR na WBR — o cast falha para rótulo inexistente. Assim o
-- mesmo arquivo sincroniza e cada banco recebe a policy correta.
DO $$
DECLARE
  papeis text[] := ARRAY['gestor'];
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'lider_suporte'
  ) THEN
    -- O cast é obrigatório: em `text[] || 'literal'` o Postgres tenta ler a
    -- string como literal de array e estoura com "malformed array literal".
    papeis := papeis || 'lider_suporte'::text;
  END IF;

  EXECUTE format(
    'CREATE POLICY os_frase_overrides_insert ON public.os_frase_overrides
       FOR INSERT TO authenticated
       WITH CHECK (
         user_has_role(%L::user_role[])
         AND autor_id = (SELECT auth.uid())
       )',
    papeis
  );
END $$;

-- Sem policy de UPDATE e sem policy de DELETE: com RLS ligada, a ausência de
-- policy nega a operação. É essa ausência que torna o histórico imutável.
