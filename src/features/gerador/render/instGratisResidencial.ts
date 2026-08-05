/**
 * Emulação do modelo `inst-gratis-residencial` — porte 1:1 da função `VXe` do
 * bundle legado (conteúdo de O.S do próprio app). Instalação grátis, residencial
 * (PF). Assinatura original `(valores, operadorPrimeiroNome)`. Saída = protocolo
 * + O.S (texto fixo). Validado por diff contra o legado — ver
 * `instGratisResidencial.diff.test.ts`.
 */
import { maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

/**
 * Modos do solicitante — os 4 tipos do legado (builder VXe: WN/OXe/GN/KN).
 * O sujeito muda quando é TERCEIRO quem solicita; o fecho muda entre TITULAR
 * acompanhar ou AUTORIZAR o terceiro a acompanhar.
 */
const TITULAR_ACOMPANHA = 'titular-acompanha'; // WN — titular solicita e acompanha
const TITULAR_AUTORIZA = 'titular-autoriza'; // OXe — titular solicita e autoriza terceiro
const TERCEIRO_AUTORIZA = 'terceiro-autoriza'; // GN — terceiro solicita, titular autoriza terceiro
const TERCEIRO_ACOMPANHA = 'terceiro-acompanha'; // KN — terceiro solicita, titular acompanha

/** Texto fixo da O.S (legado: LXe). */
const OS_TEXTO =
  'INSTALAR OS EQUIPAMENTOS EM LOCAL DE CONCORDÂNCIA DO CLIENTE, HABILITAR/ATIVAR PLANO ESCOLHIDO. CONFIGURAR REDE WI-FI, PADRONIZAR COM "NOME DO CLIENTE_WBR", SOLICITAR ESCOLHA DA SENHA. CONECTAR TODOS DISPOSITIVOS QUE APRESENTAREM, REALIZAR TESTES DA FUNCIONALIDADE DA INTERNET, AFERIR PLANO COM DISPOSITIVOS DO CLIENTE E OUTROS QUE ESTIVEREM NO LOCAL, FOTOGRAFAR, FILMAR, COMPARAR E EXPLICAR. TESTAR ABRANGÊNCIA DA WI-FI E EXPLICAR SOBRE COBERTURA. CONFERIR NAVEGAÇÃO IPv6, PADRONIZAR PORTA E SENHA DE ACESSO REMOTO, LIBERAR ACESSO EXTERNO PELA WAN. BAIXAR E INSTALAR OS APPS QUE FAZEM PARTE DO PLANO ESCOLHIDO, TANTO NOS TELEFONES E TVS QUE POSSUÍREM COMPATIBILIDADE PARA FUNCIONAMENTO E NÃO HAVENDO DAR EXPLICAÇÕES. COLHER ASSINATURAS, ENTREGAR VIA DO CONTRATO E CARNÊ DE PAGAMENTO.';

const CANAIS_COM_CONTATO = ['VIA LIGAÇÃO', 'VIA WHATSAPP'];

export function renderInstGratisResidencial(valores: Valores): SaidaOS {
  const t: Valores = {};
  for (const [k, val] of Object.entries(valores)) t[k] = String(val ?? '');

  const n = t.tipoSolicitacao || TITULAR_ACOMPANHA;
  const r = primeiroNome(maiusc(t.cliente));
  const i = primeiroNome(maiusc(t.solicitante || ''));
  const a = maiusc(t.solicitante || '');
  const o = maiusc(t.parente || '');
  const s = t.canal || '';
  const c = CANAIS_COM_CONTATO.includes(s)
    ? `${s} ${soDigitos(t.contato || '')}`
    : s;
  const l = t.filtroPlano || '150';
  const planoMap: Record<string, string> = {
    '150': t.plano150,
    '300': t.plano300,
    '600': t.plano600,
    '1g': t.plano1g,
    ittv: t.planoIttv,
  };
  const u = planoMap[l] ?? '';
  const d = t.vencimento || '';
  const f = t.dataVisita || '';
  const p = t.horaVisita || '';

  // Terceiro é o sujeito quando ele solicita (autoriza ou acompanha).
  const sujeito =
    n === TERCEIRO_AUTORIZA || n === TERCEIRO_ACOMPANHA
      ? `${i} (${o} DE ${r})`
      : r;
  // Titular acompanha em WN/KN; nos demais, autoriza o terceiro a acompanhar.
  const acompanhamento =
    n === TITULAR_ACOMPANHA || n === TERCEIRO_ACOMPANHA
      ? `${r} ACOMPANHARÁ INSTALAÇÃO.`
      : `${r} ASSINOU CONTRATO DIGITALMENTE E AUTORIZOU ${a} (${o}) A ACOMPANHAR INSTALAÇÃO.`;

  const protocolo = `${sujeito} SOLICITOU ${c} A INSTALAÇÃO DE INTERNET PARA O ENDEREÇO CITADO NA O.S, PLANO DE ACESSO: ${u}; VENCIMENTO: DIA ${d} DO MÊS; VIGÊNCIA DO CONTRATO: 12 MESES. INSTALAÇÃO AGENDADA PARA ${f} ${p}. ${acompanhamento}`;

  return { protocolo, os: OS_TEXTO };
}
