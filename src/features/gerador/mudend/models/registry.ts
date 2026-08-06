/**
 * Registry dos modelos de mud-end: mapeia slug -> {defaults, builder, createsCard}.
 *
 * É o ponto único que o modal consome para: (1) listar os modelos no seletor,
 * (2) obter os fields declarativos de cada um, (3) gerar os 3 textos, e
 * (4) decidir se cria card na agenda (createsCard:false só p/ inviabilidade).
 *
 * Cada `getDefaults()` retorna o catálogo declarativo do modelo (fields +
 * outputTemplate). Cada `buildTextos(values, operadorPrimeiroNome)` devolve o
 * dicionário de placeholders ({ mudEndTextoProtocolo, ...OS, ...Agenda }) que o
 * outputTemplate renderiza — portados 1:1 do gerador-os.
 *
 * Modelos são adicionados conforme as etapas: padrão+comFibra (PR 1),
 * equipamentos (PR 2), altplan pago/proposta (PR 3), inviabilidade (PR 4).
 */
import type { OsTemplateField } from '@/features/gerador/mudend/osTemplateField'
import { getMudEndPadraoDefaults, buildMudEndPadraoTextos } from './padrao'
import { getMudEndComFibraDefaults, buildMudEndComFibraTextos } from './comFibra'
import { getMudEndEquipamentosDefaults, buildMudEndEquipamentosTextos } from './equipamentos'
import { getMudEndAltplanPagoDefaults, buildMudEndAltplanPagoTextos } from './altplanPago'
import { getMudEndAltplanPropostaDefaults, buildMudEndAltplanPropostaTextos } from './altplanProposta'
import { getMudEndInviabilidadeDefaults, buildMudEndInviabilidadeTextos } from './inviabilidade'

export interface MudEndModelDefaults {
  slug: string
  title: string
  outputTemplate: string
  demandCategory: string
  fields: OsTemplateField[]
}

export interface MudEndModel {
  slug: string
  getDefaults: () => MudEndModelDefaults
  buildTextos: (
    values: Record<string, unknown>,
    operadorPrimeiroNome: string,
  ) => Record<string, string>
  /** false SÓ para inviabilidade — não cria card na agenda (decisão travada). */
  createsCard: boolean
}

export const MUD_END_MODELS: MudEndModel[] = [
  {
    slug: 'mud-end-padrao',
    getDefaults: getMudEndPadraoDefaults,
    buildTextos: buildMudEndPadraoTextos,
    createsCard: true,
  },
  {
    slug: 'mud-end-com-fibra',
    getDefaults: getMudEndComFibraDefaults,
    buildTextos: buildMudEndComFibraTextos,
    createsCard: true,
  },
  {
    slug: 'mud-end-buscar-equipamentos',
    getDefaults: getMudEndEquipamentosDefaults,
    buildTextos: buildMudEndEquipamentosTextos,
    createsCard: true,
  },
  {
    slug: 'mud-end-altplan-pago',
    getDefaults: getMudEndAltplanPagoDefaults,
    buildTextos: buildMudEndAltplanPagoTextos,
    createsCard: true,
  },
  {
    slug: 'mud-end-altplan-proposta',
    getDefaults: getMudEndAltplanPropostaDefaults,
    buildTextos: buildMudEndAltplanPropostaTextos,
    createsCard: true,
  },
  {
    slug: 'mud-end-inviabilidade',
    getDefaults: getMudEndInviabilidadeDefaults,
    // inviabilidade tem 1 só arg (sem operador) → adapta a assinatura do registry.
    buildTextos: (v) => buildMudEndInviabilidadeTextos(v),
    createsCard: false,
  },
]

export const MUD_END_MODEL_BY_SLUG: Record<string, MudEndModel> =
  Object.fromEntries(MUD_END_MODELS.map((m) => [m.slug, m]))
