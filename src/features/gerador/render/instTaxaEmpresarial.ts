/**
 * Emulação do modelo `inst-taxa-empresarial` — porte 1:1 da função `BZe` do
 * bundle legado (instalação com taxa, empresarial). Assinatura original
 * `(valores, operadorPrimeiroNome)`. Saída = protocolo + O.S (texto fixo).
 * Validado por diff contra o legado — ver `instTaxaEmpresarial.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

import { fraseDe } from '../catalogo/store';
import { INST_TAXA_EMPRESARIAL } from '../catalogo/instTaxaEmpresarial';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'inst-taxa-empresarial';

const frase = fraseDe(SLUG, INST_TAXA_EMPRESARIAL);

/**
 * Modos do solicitante — os 4 tipos do legado (builder VXe: WN/OXe/GN/KN).
 * O sujeito muda quando é TERCEIRO quem solicita; o fecho muda entre o TITULAR
 * (proprietário) acompanhar ou AUTORIZAR o terceiro a acompanhar.
 */
const TITULAR_ACOMPANHA = 'titular-acompanha'; // WN — titular solicita e acompanha
const TITULAR_AUTORIZA = 'titular-autoriza'; // OXe — titular solicita e autoriza terceiro
const TERCEIRO_AUTORIZA = 'terceiro-autoriza'; // GN — terceiro solicita, titular autoriza terceiro
const TERCEIRO_ACOMPANHA = 'terceiro-acompanha'; // KN — terceiro solicita, titular acompanha

/** Texto de O.S fixo (legado: IZe). */
const OS_TEXTO = () => frase('indicacaoTecnica');

const CANAIS_COM_CONTATO = ['VIA LIGAÇÃO', 'VIA WHATSAPP'];

/**
 * Remove o benefício "INSTALAÇÃO/ATIVAÇÃO GRÁTIS" do value do plano — os modelos
 * COM TAXA cobram a instalação, então o benefício grátis embutido no catálogo
 * geraria contradição na mesma O.S.
 */
function removerInstalacaoGratis(plano: string): string {
  return plano
    .replace(/ ?\+ ?INSTALAÇÃO\/ATIVAÇÃO GRÁTIS/g, '')
    .replace(/INSTALAÇÃO\/ATIVAÇÃO GRÁTIS ?\+ ?/g, '');
}

export function renderInstTaxaEmpresarial(valores: Valores): SaidaOS {
  const t: Valores = {};
  for (const [k, val] of Object.entries(valores)) t[k] = String(val ?? '');

  const tipo = t.tipoSolicitacao || TITULAR_ACOMPANHA;
  const proprietario = primeiroNome(maiusc(t.cliente));
  const solicitantePrimeiro = primeiroNome(maiusc(t.solicitante || ''));
  const solicitante = maiusc(t.solicitante || '');
  const parente = maiusc(t.parente || '');
  const canal = t.canal || '';
  const canalTexto = CANAIS_COM_CONTATO.includes(canal)
    ? `${canal} ${soDigitos(t.contato || '')}`
    : canal;
  const filtroPlano = t.filtroPlano || '150';
  const planoMap: Record<string, string> = {
    '150': t.plano150,
    '300': t.plano300,
    '600': t.plano600,
    '1g': t.plano1g,
    ittv: t.planoIttv,
  };
  const plano = planoMap[filtroPlano] ?? '';
  // O value do catálogo já começa pela velocidade: usar o plano inteiro como
  // PLANO DE ACESSO (sem split) e ler a taxa de um campo próprio. Como este é o
  // modelo COM TAXA, remove o benefício "INSTALAÇÃO/ATIVAÇÃO GRÁTIS" do plano.
  const planoAcesso = removerInstalacaoGratis(plano);
  const taxa = maiusc(t.valorTaxa || '');
  const vencimento = t.vencimento || '';
  const dataVisita = t.dataVisita || '';
  const horaVisita = t.horaVisita || '';
  const parcelas = maiusc(t.parcelas || '1X');
  // Regência da forma de pagamento (NO CARTÃO / EM DINHEIRO / VIA PIX).
  const formaPagFrase = fraseFormaPag(t.formaPag || '');

  // Terceiro é o sujeito quando ele solicita (autoriza ou acompanha); caso
  // contrário, o próprio proprietário da empresa.
  const quemSolicitou =
    tipo === TERCEIRO_AUTORIZA || tipo === TERCEIRO_ACOMPANHA
      ? `${solicitantePrimeiro} (${parente}, REPRESENTANTE DE ${proprietario})`
      : `${proprietario} (PROPRIETÁRIO DA EMPRESA)`;
  // Proprietário acompanha em WN/KN; nos demais, autoriza o terceiro a acompanhar.
  const acompanhamento =
    tipo === TITULAR_ACOMPANHA || tipo === TERCEIRO_ACOMPANHA
      ? `${proprietario} ACOMPANHARÁ INSTALAÇÃO.`
      : `${proprietario} ASSINOU CONTRATO DIGITALMENTE E AUTORIZOU ${solicitante} (${parente}) A ACOMPANHAR INSTALAÇÃO.`;

  const protocolo = `${frase('protocolo', { sujeito: quemSolicitou, canal: canalTexto, plano: planoAcesso, vencimento: vencimento, dataVisita: dataVisita, horaVisita: horaVisita })} ${acompanhamento} ${frase('taxaInstalacao', { taxa: taxa, parcelas, formaPagFrase })}`;

  return { protocolo, os: OS_TEXTO() };
}
