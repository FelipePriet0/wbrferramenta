-- Coluna do telefone do emprego (linha PROFISSÃO | EMPRESA | TEL da ficha Rural).
-- Aditivo, nullable; tabela rural_fichas é nova/vazia → zero risco.

ALTER TABLE public.rural_fichas ADD COLUMN IF NOT EXISTS tel_empresa text;
