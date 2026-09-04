// ---------------------------------------------------------------------------
// Editor do Emulado: os diff tests comparam a saída dos renders contra as
// fixtures do bundle legado. Sem zerar o store, um override publicado em
// produção passaria a valer nos testes e quebraria o CI.
// ---------------------------------------------------------------------------
import { beforeEach } from 'vitest';
import { limparOverrides } from './src/features/gerador/catalogo/store';

beforeEach(() => {
  limparOverrides();
});
