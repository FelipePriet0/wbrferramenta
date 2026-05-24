-- =========================================================================
-- 07. Seed
-- =========================================================================

INSERT INTO card_labels (name, color, active)
VALUES ('Preenchida', 'azul', true)
ON CONFLICT (name) DO NOTHING;
