/**
 * Catálogo de opções dos selects do gerador (planos, canais…).
 * Portado das opções seed do bundle legado. ⚠️ No legado, catálogos são dados
 * dinâmicos (Firestore, área admin "Catálogo"); aqui ficam em código como seed —
 * migração pra tabela/CRUD é follow-up (igual Modelos de O.S).
 */

export interface Opcao { value: string; label: string; }

export const PLANOS_ATUAIS: Opcao[] = [
  {
    "value": "100 MEGA/59,90",
    "label": "100MB/59,90"
  },
  {
    "value": "100 MEGA/79,90",
    "label": "100MB/79,90"
  },
  {
    "value": "150 MEGA/59,90",
    "label": "150MB/59,90"
  },
  {
    "value": "250 MEGA/69,90",
    "label": "250MB/69,90"
  },
  {
    "value": "300 MEGA/69,90",
    "label": "300MB/69,90"
  },
  {
    "value": "400 MEGA/79,90",
    "label": "400MB/79,90"
  },
  {
    "value": "500 MEGA/79,90",
    "label": "500MB/79,90"
  },
  {
    "value": "500 MEGA/99,90",
    "label": "500MB/99,90"
  },
  {
    "value": "600 MEGA/79,90",
    "label": "600MB/79,90"
  },
  {
    "value": "1000 MEGA/99,90",
    "label": "1000MB/99,90"
  },
  {
    "value": "1000 MEGA/149,80",
    "label": "1000MB/149,80"
  },
  {
    "value": "500 MEGA + WI-FI EXTEND/119,90",
    "label": "500MB/119,90 — WI-FI EXTEND (CGNAT)"
  },
  {
    "value": "1000 MEGA + WI-FI EXTEND/139,90",
    "label": "1000MB/139,90 — WI-FI EXTEND (CGNAT)"
  }
];

export const PLANOS_ESCOLHIDOS: Opcao[] = [
  {
    "value": "150 MEGA/59,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)",
    "label": "150 MEGA/59,90 + MZTV (CDNTV+)"
  },
  {
    "value": "300 MEGA/69,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)",
    "label": "300 MEGA/69,90 + MZTV (CDNTV+)"
  },
  {
    "value": "600 MEGA/79,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)",
    "label": "600 MEGA/79,90 + MZTV (CDNTV+)"
  },
  {
    "value": "1 GIGA (1.000 MEGA) R$99,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD",
    "label": "1000 MEGA/99,90 + MZTV (CDNTV+) + VOD"
  },
  {
    "value": "150 MEGA/80,00 + IP PUBLICO DINAMICO. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)",
    "label": "150 MEGA/80,00 + MZTV (CDNTV+) + IP DIN"
  },
  {
    "value": "300 MEGA/90,00 + IP PUBLICO DINAMICO. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)",
    "label": "300 MEGA/90,00 + MZTV (CDNTV+) + IP DIN"
  },
  {
    "value": "600 MEGA/100,00 + IP PUBLICO DINAMICO. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)",
    "label": "600 MEGA/100,00 + MZTV (CDNTV+) + IP DIN"
  },
  {
    "value": "1 GIGA (1.000 MEGA) R$120,00 + IP PUBLICO DINAMICO. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD",
    "label": "1000 MEGA/120,00 + MZTV (CDNTV+) + VOD + IP DIN"
  },
  {
    "value": "600 MEGA/109,90 + ITTV PLUS (1 LICENÇA). BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV",
    "label": "600 MEGA/109,90 + MZTV + VOD + ITTV PLUS (1 LICENÇA)"
  },
  {
    "value": "1 GIGA (1.000 MEGA) R$129,90 + ITTV PLUS (1 LICENÇA). BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV + VOD",
    "label": "1000 MEGA/129,90 + MZTV + VOD + ITTV PLUS (1 LICENÇA)"
  },
  {
    "value": "600 MEGA; + WI-FI EXTEND (ROTEADOR ADICIONAL) MENSALIDADE: R$114,90; EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS; BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)",
    "label": "600 MEGA/114,90 + BENEFÍCIOS + WI-FI EXTEND"
  },
  {
    "value": "1 GIGA (1.000 MEGA); + WI-FI EXTEND (ROTEADOR ADICIONAL)  MENSALIDADE: R$134,90; EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS; BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD",
    "label": "1000 MEGA/134,90 + BENEFÍCIOS + WI-FI EXTEND"
  }
];

/**
 * Planos escolhidos do fluxo Wi-Fi Extend (ALTERAÇÃO de plano). Catálogo próprio
 * (não compartilhado com altplan/PLANOS_ESCOLHIDOS) portado do símbolo `wqe` do
 * bundle legado — inclui as opções com 1, 2 e 3 WI-FI EXTEND (roteadores
 * adicionais) e as variantes com IP público dinâmico. Usado pelos formulários
 * `wifi-extend-zte` e `wifi-extend-tplink`.
 */
export const PLANOS_EXTEND: Opcao[] = [
  {
    "value": "600 MEGA; + WI-FI EXTEND (ROTEADOR ADICIONAL) MENSALIDADE: R$114,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO GRATUITO AO APP MZTV (CDNTV+)",
    "label": "600 MEGA/114,90 + BENEFÍCIOS + WI-FI EXTEND"
  },
  {
    "value": "1 GIGA (1.000 MEGA); + WI-FI EXTEND (ROTEADOR ADICIONAL)  MENSALIDADE: R$134,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD",
    "label": "1000 MEGA/134,90 + BENEFÍCIOS + WI-FI EXTEND"
  },
  {
    "value": "600 MEGA; + WI-FI EXTEND (2 ROTEADORES ADICIONAIS) MENSALIDADE: R$144,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO GRATUITO AO APP MZTV (CDNTV+)",
    "label": "600 MEGA/144,90 + BENEFÍCIOS + WI-FI EXTEND (2 UNIDADES)"
  },
  {
    "value": "1 GIGA (1.000 MEGA); + WI-FI EXTEND (2 ROTEADORES ADICIONAIS)  MENSALIDADE: R$164,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD",
    "label": "1000 MEGA/164,90 + BENEFÍCIOS + WI-FI EXTEND (2 UNIDADES)"
  },
  {
    "value": "600 MEGA; + WI-FI EXTEND (3 ROTEADORES ADICIONAIS) MENSALIDADE: R$174,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO GRATUITO AO APP MZTV (CDNTV+)",
    "label": "600 MEGA/174,90 + BENEFÍCIOS + WI-FI EXTEND (3 UNIDADES)"
  },
  {
    "value": "1 GIGA (1.000 MEGA); + WI-FI EXTEND (3 ROTEADORES ADICIONAIS)  MENSALIDADE: R$194,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD",
    "label": "1000 MEGA/194,90 + BENEFÍCIOS + WI-FI EXTEND (3 UNIDADES)"
  },
  {
    "value": "600 MEGA; + IP PUBLICO DINAMICO + WI-FI EXTEND (ROTEADOR ADICIONAL) MENSALIDADE: R$135,00; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD",
    "label": "600 MEGA/135,00 + BENEFÍCIOS + WI-FI EXTEND + IP DIN"
  },
  {
    "value": "1 GIGA (1.000 MEGA); + WI-FI EXTEND (ROTEADOR ADICIONAL) MENSALIDADE: R$155,00; + EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + IP PUBLICO DINAMICO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS; BENEFÍCIOS: ACESSO GRATUITO AO APP WBR PLAY + ACESSO GRATUITO AO APP (CDNTV+) + VOD",
    "label": "1000 MEGA/155,00 + BENEFÍCIOS + WI-FI EXTEND + IP DIN"
  }
];

/**
 * Canal de atendimento. O `value` é o que entra no texto da O.S (CAIXA-ALTA,
 * como no legado); o `label` é o rótulo curto no select. Ver auditoria de
 * contexto: o porte anterior usava o label como value ('Telefone'/'WhatsApp'),
 * quebrando o caixa-alta do documento.
 */
export const CANAIS: Opcao[] = [
  { value: 'LIGAÇÃO', label: 'Telefone' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
];

/**
 * Canal para os modelos de INSTALAÇÃO. No legado esses templates comparam contra
 * 'VIA LIGAÇÃO'/'VIA WHATSAPP' e injetam o valor direto ("SOLICITOU VIA LIGAÇÃO
 * <contato> A INSTALAÇÃO"), então o value precisa do prefixo "VIA ".
 */
export const CANAIS_INST: Opcao[] = [
  { value: 'VIA LIGAÇÃO', label: 'Telefone' },
  { value: 'VIA WHATSAPP', label: 'WhatsApp' },
  { value: 'PRESENCIALMENTE', label: 'Presencialmente' },
];


/* Planos de acesso por velocidade (instalação) — seed do bundle legado.
   O `value` é o texto que entra na O.S; o `label` é o rótulo curto do select. */

export const PLANOS_150: Opcao[] = [
  { value: "150 MEGA; MENSALIDADE: R$59,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP WBR TV (CDNTV)", label: "150 Mega — R$59,90 (CDNTV)" },
  { value: "150 MEGA + IP PÚBLICO DINAMICO; MENSALIDADE: R$80,00; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP WBR TV (CDNTV)", label: "150 Mega — R$80,00 + IP Dinâmico" },
  { value: "150 MEGA + IP FIXO; MENSALIDADE: R$259,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP WBR TV (CDNTV)", label: "150 Mega — R$259,90 + IP Fixo" },
];

export const PLANOS_300: Opcao[] = [
  { value: "300 MEGA; MENSALIDADE: R$69,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP WBR TV (CDNTV)", label: "300 Mega — R$69,90 (CDNTV)" },
  { value: "300 MEGA + IP PÚBLICO DINAMICO; MENSALIDADE: R$90,00; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP WBR TV (CDNTV)", label: "300 Mega — R$90,00 + IP Dinâmico" },
  { value: "300 MEGA + IP FIXO; MENSALIDADE: R$269,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP WBR TV (CDNTV)", label: "300 Mega — R$269,90 + IP Fixo" },
  { value: "300 MEGA + 01 WI-FI EXTEND (ROTEADOR ADICIONAL), MENSALIDADE: R$104,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP WBR TV (CDNTV)", label: "300 Mega + 1 Extend — R$104,90" },
];

export const PLANOS_600: Opcao[] = [
  { value: "600 MEGA; MENSALIDADE: R$79,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP WBR TV (CDNTV)", label: "600 Mega — R$79,90 (CDNTV)" },
  { value: "600 MEGA + IP PÚBLICO DINAMICO; MENSALIDADE: R$100,00; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP WBR TV (CDNTV)", label: "600 Mega — R$100,00 + IP Dinâmico" },
  { value: "600 MEGA + IP FIXO; MENSALIDADE: R$279,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP WBR TV (CDNTV)", label: "600 Mega — R$279,90 + IP Fixo" },
  { value: "600 MEGA + 01 WI-FI EXTEND (ROTEADOR ADICIONAL), MENSALIDADE: R$114,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP WBR TV (CDNTV)", label: "600 Mega + 1 Extend — R$114,90" },
  { value: "600 MEGA + 02 WI-FI EXTEND (02 ROTEADORES ADICIONAIS), MENSALIDADE: R$144,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP WBR TV (CDNTV)", label: "600 Mega + 2 Extend — R$144,90" },
  { value: "600 MEGA + 03 WI-FI EXTEND (03 ROTEADORES ADICIONAIS), MENSALIDADE: R$174,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP WBR TV (CDNTV)", label: "600 Mega + 3 Extend — R$174,90" },
];

export const PLANOS_1G: Opcao[] = [
  { value: "1 GIGA (1.000 MEGA); MENSALIDADE: R$99,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP WBR TV (CDNTV) COM WBR CINE-PLAY (VOD)", label: "1 Giga — R$99,90 + VOD" },
  { value: "1 GIGA (1.000 MEGA) + IP PÚBLICO DINAMICO; MENSALIDADE: R$120,00; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP WBR TV (CDNTV) COM WBR CINE-PLAY (VOD)", label: "1 Giga — R$120,00 + IP Dinâmico + VOD" },
  { value: "1 GIGA (1.000 MEGA) + IP FIXO; MENSALIDADE: R$299,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP WBR TV (CDNTV) COM WBR CINE-PLAY (VOD)", label: "1 Giga — R$299,90 + IP Fixo + VOD" },
  { value: "1 GIGA (1.000 MEGA) + 01 WI-FI EXTEND (ROTEADOR ADICIONAL), MENSALIDADE: R$134,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP WBR TV (CDNTV) COM WBR CINE-PLAY (VOD)", label: "1 Giga + 1 Extend — R$134,90 + VOD" },
  { value: "1 GIGA (1.000 MEGA) + 02 WI-FI EXTEND (02 ROTEADORES ADICIONAIS), MENSALIDADE: R$164,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP WBR TV (CDNTV) COM WBR CINE-PLAY (VOD)", label: "1 Giga + 2 Extend — R$164,90 + VOD" },
  { value: "1 GIGA (1.000 MEGA) + 03 WI-FI EXTEND (03 ROTEADORES ADICIONAIS), MENSALIDADE: R$194,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP WBR TV (CDNTV) COM WBR CINE-PLAY (VOD)", label: "1 Giga + 3 Extend — R$194,90 + VOD" },
];

export const PLANOS_ITTV: Opcao[] = [
  { value: "600 MEGA/94,90 + MZTV (CDNTV+) + DEEZER PREMIUM (1 LICENÇA)", label: "600 Mega — R$94,90 + Deezer Premium" },
  { value: "600 MEGA/109,90 + MZTV (CDNTV+) + ITTV-PLUS (1 LICENÇA)", label: "600 Mega — R$109,90 + ITTV-Plus" },
  { value: "1000 MEGA/114,90 + MZTV (CDNTV+) + VOD + DEEZER PREMIUM (1 LICENÇA)", label: "1 Giga — R$114,90 + VOD + Deezer Premium" },
  { value: "1000 MEGA/129,90 + MZTV (CDNTV+) + VOD + ITTV-PLUS (1 LICENÇA)", label: "1 Giga — R$129,90 + VOD + ITTV-Plus" },
];


/* Dia de vencimento (instalação). */

export const DIAS_VENCIMENTO: Opcao[] = [
  { value: "5", label: "Dia 5" },
  { value: "10", label: "Dia 10" },
  { value: "15", label: "Dia 15" },
  { value: "20", label: "Dia 20" },
  { value: "25", label: "Dia 25" },
];

/* Listas de select compartilhadas (instalação/encerramento/mídia) — seed do bundle legado. */

export const HORARIOS_VISITA: Opcao[] = [
  { value: "ÀS 08:00", label: "08:00" },
  { value: "ÀS 08:30", label: "08:30" },
  { value: "ÀS 09:00", label: "09:00" },
  { value: "ÀS 09:30", label: "09:30" },
  { value: "ÀS 10:00", label: "10:00" },
  { value: "ÀS 10:30", label: "10:30" },
  { value: "ÀS 11:00", label: "11:00" },
  { value: "ÀS 11:30", label: "11:30" },
  { value: "ÀS 13:00", label: "13:00" },
  { value: "ÀS 13:30", label: "13:30" },
  { value: "ÀS 14:00", label: "14:00" },
  { value: "ÀS 14:30", label: "14:30" },
  { value: "ÀS 15:00", label: "15:00" },
  { value: "ÀS 15:30", label: "15:30" },
  { value: "ÀS 17:00", label: "17:00 (somente com autorização)" },
  { value: "APÓS AS 11:00", label: "Após às 11:00 (aos sábados)" },
  { value: "NO PERÍODO DA MANHÃ", label: "Período manhã" },
  { value: "NO PERÍODO DA TARDE", label: "Período tarde" },
];

/**
 * Horários de visita com valor "nu" (sem preposição), para moldes que já
 * imprimem "ÀS ${horaVisita} HRS" — usar HORARIOS_VISITA aqui duplicaria o "ÀS".
 */
export const HORARIOS_VISITA_SIMPLES: Opcao[] = [
  { value: "08:00", label: "08:00" },
  { value: "08:30", label: "08:30" },
  { value: "09:00", label: "09:00" },
  { value: "09:30", label: "09:30" },
  { value: "10:00", label: "10:00" },
  { value: "10:30", label: "10:30" },
  { value: "11:00", label: "11:00" },
  { value: "11:30", label: "11:30" },
  { value: "13:00", label: "13:00" },
  { value: "13:30", label: "13:30" },
  { value: "14:00", label: "14:00" },
  { value: "14:30", label: "14:30" },
  { value: "15:00", label: "15:00" },
  { value: "15:30", label: "15:30" },
  { value: "16:00", label: "16:00" },
  { value: "16:30", label: "16:30" },
  { value: "17:00", label: "17:00" },
  { value: "17:30", label: "17:30" },
  { value: "18:00", label: "18:00" },
  { value: "18:30", label: "18:30" },
];

export const ONU_TIPO: Opcao[] = [
  { value: "ONU", label: "ONU" },
  { value: "ONT", label: "ONT" },
];

export const ONT_MODELOS: Opcao[] = [
  { value: "ONT ZTE F 670-L", label: "ONT ZTE F 670-L" },
  { value: "ONT TP-LINK XC220", label: "ONT TP-LINK XC220" },
  { value: "ONT TP-LINK XC230", label: "ONT TP-LINK XC230" },
  { value: "ONT TP-LINK X530v1", label: "ONT TP-LINK X530v1" },
  { value: "ONT TP-LINK X530v2", label: "ONT TP-LINK X530v2" },
];

export const ONU_MODELOS: Opcao[] = [
  { value: "C-DATA", label: "C-DATA" },
  { value: "TENDA", label: "TENDA" },
  { value: "SHORELINE", label: "SHORELINE" },
  { value: "FIBERHOME", label: "FIBERHOME" },
  { value: "ZTE", label: "ZTE" },
];

/**
 * Modelos de equipamento (roteador/ONT) do parque atual. Usado nos popovers de
 * modelo dos formulários de alteração de plano e do feedback de troca de
 * equipamento. O value entra no texto da O.S como está (caixa-alta via maiusc).
 */
export const MODELOS_EQUIP: Opcao[] = [
  { value: 'MULTILASER', label: 'MULTILASER' },
  { value: 'INTELBRAS', label: 'INTELBRAS' },
  { value: 'D-LINK DIR 842', label: 'D-LINK DIR 842' },
  { value: 'GREATEK', label: 'GREATEK' },
  { value: 'TP-LINK 840', label: 'TP-LINK 840' },
  { value: 'TP-LINK C-20', label: 'TP-LINK C-20' },
  { value: 'TP-LINK C-5', label: 'TP-LINK C-5' },
  { value: 'TP-LINK G-5', label: 'TP-LINK G-5' },
  { value: 'TP-LINK EX520', label: 'TP-LINK EX520' },
  { value: 'TP-LINK EX511', label: 'TP-LINK EX511' },
  { value: 'ZTE H199A', label: 'ZTE H199A' },
  { value: 'ZTE H196A', label: 'ZTE H196A' },
  { value: 'HUAWEI AX2', label: 'HUAWEI AX2' },
  { value: 'ONT ZTE F670L', label: 'ONT ZTE F670L' },
  { value: 'ONT TP-LINK XC220', label: 'ONT TP-LINK XC220' },
  { value: 'ONT TP-LINK XX230', label: 'ONT TP-LINK XX230' },
  { value: 'ONT TP-LINK XX530', label: 'ONT TP-LINK XX530' },
  { value: 'ONT TP-LINK XX530v2', label: 'ONT TP-LINK XX530v2' },
];

/** Valor do STB (conversor de mídia) — legado: R$100 à vista / R$120 parcelado. */
export const STB_VALORES: Opcao[] = [
  { value: "R$100,00", label: "R$100,00 à vista" },
  { value: "R$120,00", label: "R$120,00 parcelado" },
];

/** Valor do Roku-TV — legado: R$200 à vista / R$230 parcelado (≠ STB). */
export const ROKU_VALORES: Opcao[] = [
  { value: "R$200,00", label: "R$200,00 à vista" },
  { value: "R$230,00", label: "R$230,00 parcelado" },
];

export const STB_PARCELAS: Opcao[] = [
  { value: "1x", label: "1x" },
  { value: "2x", label: "2x" },
  { value: "3x", label: "3x" },
];
