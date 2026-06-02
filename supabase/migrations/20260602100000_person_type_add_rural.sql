-- Adiciona o valor 'Rural' ao enum person_type.
-- DEVE ser aplicada e committada ANTES de qualquer migration que use o literal 'Rural'
-- (Postgres não permite usar um valor de enum recém-adicionado na mesma transação).
-- Aditivo e de baixo risco; irreversível (não há DROP VALUE em enum).

ALTER TYPE public.person_type ADD VALUE IF NOT EXISTS 'Rural';
