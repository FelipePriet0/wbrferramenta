-- Seed: etiqueta "Urgente" que existia apenas no banco manual, sem migration.
-- ON CONFLICT garante idempotência em bancos que já têm a linha.
-- ROLLBACK: não necessário — DELETE quebraria dados existentes.

INSERT INTO public.card_labels (name, color, active)
VALUES ('Urgente', 'vermelho', true)
ON CONFLICT (name) DO NOTHING;
