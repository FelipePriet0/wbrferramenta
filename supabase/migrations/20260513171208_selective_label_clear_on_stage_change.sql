-- Substitui a função da trigger kanban_cards_clear_labels_on_stage_change.
--
-- Versão anterior (em 20260512121122_clear_card_labels_on_stage_change)
-- deletava TODAS as card_label_assignments do card em qualquer mudança
-- de stage ou area — perdia silenciosamente a etiqueta "Urgente".
--
-- Nova regra:
--   - "Preenchida" cai em qualquer SAÍDA da coluna 'preenchidas'
--     (preenchidas → em_analise / aprovados / negados / canceladas / ...)
--   - "Urgente" e demais etiquetas persistem por default — nenhum DELETE.
--
-- A trigger continua a mesma (AFTER UPDATE OF stage, area), só o corpo
-- da função muda via CREATE OR REPLACE.

CREATE OR REPLACE FUNCTION public.trg_clear_card_labels_on_stage_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_old_stage text := lower(coalesce(OLD.stage, ''));
  v_new_stage text := lower(coalesce(NEW.stage, ''));
BEGIN
  -- Só atua quando stage ou area realmente mudaram.
  IF v_old_stage IS DISTINCT FROM v_new_stage
     OR OLD.area IS DISTINCT FROM NEW.area THEN

    -- "Preenchida": cai em qualquer SAÍDA da coluna 'preenchidas'.
    IF v_old_stage = 'preenchidas' AND v_new_stage <> 'preenchidas' THEN
      DELETE FROM public.card_label_assignments cla
      USING public.card_labels cl
      WHERE cla.card_id = NEW.id
        AND cla.label_id = cl.id
        AND cl.name = 'Preenchida';
    END IF;

    -- "Urgente" e demais etiquetas: persistem por default. Nenhum DELETE.
  END IF;
  RETURN NEW;
END;
$function$;
