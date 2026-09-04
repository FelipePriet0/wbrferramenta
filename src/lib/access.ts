import type { UserRole } from '@/lib/types';

/**
 * Regras de acesso por papel — versão da WBR.
 *
 * Na toolmznet este arquivo é bem maior: cobre também as rotas restritas dos
 * papéis `suporte` e `lider_suporte`, que existem lá. Aqui o enum `user_role`
 * tem apenas vendedor / analista / gestor / instalador / leitor, então só ficou
 * o que faz sentido neste banco.
 *
 * Ao sincronizar da toolmznet, NÃO sobrescreva este arquivo inteiro: ele é uma
 * redução deliberada, não uma cópia desatualizada.
 */

/** True só para o gestor. */
export function isGestor(role: UserRole | null | undefined): boolean {
  return role === 'gestor';
}

/**
 * Quem pode editar o texto emulado da O.S pela plataforma.
 *
 * Na toolmznet são o gestor e a líder do suporte (`lider_suporte`). Aqui esse
 * papel não existe no enum, e a decisão foi deixar a edição com o `gestor`.
 *
 * Isto é camada de UX: esconde o botão. A trava real é a policy de INSERT em
 * `os_frase_overrides`, que repete este gate no banco — e a migration se adapta
 * sozinha, montando o array de papéis a partir do que o enum tem.
 */
export function podeEditarEmulado(role: UserRole | null | undefined): boolean {
  return isGestor(role);
}
