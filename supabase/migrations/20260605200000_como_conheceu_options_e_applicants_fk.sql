-- "Como conheceu a WBR": tabela de domínio (fonte única das opções) + FK na ficha.
--
-- Backend-first: as opções do dropdown vivem no banco, não no front. A escolha
-- do cliente fica gravada em applicants.como_conheceu_id (FK). Vale para PF, PJ
-- e Rural (todas usam a tabela applicants).

CREATE TABLE public.como_conheceu_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.como_conheceu_options ENABLE ROW LEVEL SECURITY;

-- Leitura para qualquer autenticado; escrita só gestor (espelha card_labels).
CREATE POLICY como_conheceu_options_select ON public.como_conheceu_options
  FOR SELECT TO authenticated USING (true);

CREATE POLICY como_conheceu_options_insert ON public.como_conheceu_options
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_role(ARRAY['gestor']::user_role[]));

CREATE POLICY como_conheceu_options_update ON public.como_conheceu_options
  FOR UPDATE TO authenticated
  USING (public.user_has_role(ARRAY['gestor']::user_role[]))
  WITH CHECK (public.user_has_role(ARRAY['gestor']::user_role[]));

CREATE POLICY como_conheceu_options_no_delete ON public.como_conheceu_options
  FOR DELETE TO authenticated USING (false);

INSERT INTO public.como_conheceu_options (code, label, display_order) VALUES
  ('outdoor',           'Outdoor',                         1),
  ('radio',             'Rádio',                           2),
  ('instagram',         'Instagram',                       3),
  ('facebook',          'Facebook',                        4),
  ('indicacao_cliente', 'Indicação de outro cliente WBR',  5),
  ('panfleto',          'Panfleto',                        6),
  ('eventos',           'Eventos',                         7);

ALTER TABLE public.applicants
  ADD COLUMN como_conheceu_id uuid
    REFERENCES public.como_conheceu_options(id) ON DELETE SET NULL;
