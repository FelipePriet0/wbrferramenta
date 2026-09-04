'use client';

/**
 * Estado do Editor do Emulado para um modelo.
 *
 * Cuida da ponte entre o banco (assíncrono) e os renders (síncronos): busca os
 * overrides, publica no store de módulo e expõe uma `versao` que a tela usa
 * para refazer o `useMemo` do render. Sem essa `versao`, o texto novo só
 * apareceria quando o operador mexesse em algum campo do formulário.
 *
 * Falha de rede não bloqueia nada: o store fica vazio, os renders servem o
 * padrão do código e o gerador continua utilizável. O erro vai para `erro`
 * apenas para a tela poder avisar que a edição está indisponível.
 */
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { podeEditarEmulado } from '@/lib/access';
import { carregarOverrides, limparOverrides } from '../catalogo/store';
import { catalogoDoModelo } from '../catalogo/registry';
import {
  carregarEstadoDoModelo,
  listarHistoricoFrase,
  publicarFrase,
  voltarAoPadrao,
  type FraseHistorico,
  type MetaFrase,
} from '@/services/osFrases';

export function useEditorEmulado(modeloSlug: string) {
  const { role } = useAuth();
  const catalogo = catalogoDoModelo(modeloSlug);

  const [editando, setEditando] = useState(false);
  const [metas, setMetas] = useState<Record<string, MetaFrase>>({});
  const [versao, setVersao] = useState(0);
  const [erro, setErro] = useState<string | null>(null);

  /** Só quem pode editar E num modelo já extraído vê o botão. */
  const disponivel = podeEditarEmulado(role) && catalogo !== null;

  /**
   * `vivo` evita atualizar estado de um modelo que já saiu da tela: a resposta
   * do banco pode chegar depois de o operador ter navegado para outro modelo, e
   * aplicá-la aqui publicaria no store o texto do modelo errado.
   */
  const recarregar = useCallback(
    async (vivo: () => boolean = () => true) => {
      if (!catalogo) return;
      try {
        const { overrides, metas: m } = await carregarEstadoDoModelo(modeloSlug);
        if (!vivo()) return;
        carregarOverrides(overrides);
        setMetas(m);
        setErro(null);
      } catch (e) {
        if (!vivo()) return;
        // Mantém o padrão do código: o gerador não pode parar por causa disto.
        limparOverrides();
        setMetas({});
        setErro(e instanceof Error ? e.message : 'Falha ao carregar os textos.');
      } finally {
        if (vivo()) setVersao((v) => v + 1);
      }
    },
    [modeloSlug, catalogo],
  );

  // Carrega ao abrir o modelo e limpa ao sair, para o store não vazar os
  // overrides de um modelo para o próximo na navegação client-side.
  useEffect(() => {
    let ativo = true;
    // A regra não enxerga através do `await`: nenhum setState daqui é síncrono,
    // todos acontecem depois da resposta do banco, e o guarda `ativo` impede
    // que cheguem a um modelo que já saiu da tela.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void recarregar(() => ativo);
    return () => {
      ativo = false;
      limparOverrides();
    };
  }, [recarregar]);

  const publicar = useCallback(
    async (fraseChave: string, texto: string) => {
      if (!catalogo) return;
      await publicarFrase({ modeloSlug, fraseChave, texto, catalogo });
      await recarregar();
    },
    [modeloSlug, catalogo, recarregar],
  );

  const restaurarPadrao = useCallback(
    async (fraseChave: string) => {
      await voltarAoPadrao(modeloSlug, fraseChave);
      await recarregar();
    },
    [modeloSlug, recarregar],
  );

  const historico = useCallback(
    (fraseChave: string): Promise<FraseHistorico[]> =>
      listarHistoricoFrase(modeloSlug, fraseChave),
    [modeloSlug],
  );

  return {
    catalogo,
    disponivel,
    editando,
    setEditando,
    metas,
    versao,
    erro,
    publicar,
    restaurarPadrao,
    historico,
  };
}
