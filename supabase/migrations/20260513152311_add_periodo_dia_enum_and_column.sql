-- Enum dedicado pra valores válidos do período de instalação.
CREATE TYPE periodo_dia AS ENUM ('manha', 'tarde');

-- Coluna nova em kanban_cards. NULL = sem período definido.
-- Permanece separada de hora_at (que continua sendo time[]).
ALTER TABLE public.kanban_cards
  ADD COLUMN periodo periodo_dia;
