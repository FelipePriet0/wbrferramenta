/**
 * Emulação do modelo `ence-padrao-casa-extend` — porte 1:1 da função `fQe` do
 * bundle legado (encerramento de instalação "Padrão Casa" com pontos Wi-Fi
 * Extend adicionais). Saída única `saida` (campo `encTexto` no legado); sem
 * variável de tipo (ramifica por `segmento`/`tipo_equipamento`/`local_instalacao`).
 * 2º arg = operador. Validado por diff — ver `encePadraoCasaExtend.diff.test.ts`.
 *
 * MP/dQe/uQe/lQe são helpers externos do bundle cujos corpos não vieram no
 * pacote; transcritos como locais best-effort (`formatMac`/`mapOnt`/`mapEquip`/
 * `ORDINAIS`), com o caminho vazio das fixtures conferido caractere-a-caractere.
 */
import type { Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

/** Formata MAC em pares hex separados por ":" (legado: MP). */
function formatMac(v: string): string {
  const hex = String(v ?? '')
    .toUpperCase()
    .replace(/[^0-9A-F]/g, '');
  const pares = hex.match(/.{1,2}/g);
  return pares ? pares.join(':') : '';
}

/** Mapeia o valor do select de ONT para o rótulo (legado: dQe). */
function mapOnt(v: string): string {
  return String(v ?? '').trim().toUpperCase();
}

/** Mapeia o valor do equipamento do ponto adicional (legado: uQe). */
function mapEquip(v: string): string {
  return String(v ?? '').trim().toUpperCase();
}

/** Ordinais dos pontos adicionais (legado: lQe). */
const ORDINAIS = [
  'SECUNDÁRIO',
  'TERCIÁRIO',
  'QUATERNÁRIO',
  'QUINÁRIO',
  'SENÁRIO',
  'SEPTENÁRIO',
  'OCTONÁRIO',
  'NONÁRIO',
  'DENÁRIO',
];

export function renderEncePadraoCasaExtend(valores: Valores): SaidaOS {
  const t: Valores = {};
  for (const [k, val] of Object.entries(valores)) t[k] = String(val ?? '');

  const n = (e: string) => (t[e] ?? '').trim().toUpperCase();
  const r = (e: string) => (t[e] ?? '').trim();

  let i = 'PADRAO CASA - EXTEND\n\n';
  i += (t.sem_id_cto === 'SIM' ? 'CTO: XXXX' : `CTO: ${n('cto')}`) + '\n';
  i += `SINAL: ${n('sinal')}\n`;
  i += `PORTA: ${n('porta')}\n\n`;
  i += `PASSAGEM DO CABO DROP: ${n('passagem_cabo')}.\n\n`;

  if (t.possui_passante === 'SIM') {
    i += 'POSSUI PASSANTE: SIM\n';
    i += `MOTIVO DO PASSANTE: ${n('motivo_passante')}\n`;
    i += `LOCAL DO PASSANTE: ${n('local_passante')}\n`;
    i += `AUTORIZADO POR: ${n('autorizado_por')}\n`;
  }

  i += `>>> EQUIPAMENTO ${n('descricao_ponto_primario')}.\n\n`;

  const localInst = t.local_instalacao ?? '';
  let fixacao = '';
  if (localInst === 'SOLTO EM CIMA DO MÓVEL') {
    fixacao = `SOLTO EM CIMA DO MÓVEL: ${n('descricao_movel')}. MOTIVO DE NÃO FIXAR: ${n('motivo_nao_fixado')}. O CLIENTE ESTÁ CIENTE DOS RISCOS CASO O EQUIPAMENTO SOFRA DANO POR QUEDA.`;
  } else if (localInst === 'FIXADO NA PAREDE') {
    fixacao = 'FIXADO NA PAREDE COM AUTORIZAÇÃO DO CLIENTE.';
  } else if (localInst === 'FIXADO NO MÓVEL') {
    fixacao = `FIXADO NO MÓVEL COM ${n('tipo_fixacao_movel')} A PEDIDO DO CLIENTE.`;
  }

  // "ONU" é feminino: a linha da ONU concorda em "SOLTA"/"FIXADA"; ROTEADOR e
  // ONT (masculinos) mantêm "SOLTO"/"FIXADO".
  const fixacaoFem = fixacao.replace(/^SOLTO/, 'SOLTA').replace(/^FIXADO/, 'FIXADA');

  const tipoEquip = t.tipo_equipamento ?? '';
  if (tipoEquip === 'ONU + Roteador') {
    i += `ONU ${n('onu')} MAC:${formatMac(t.mac_onu ?? '')} ${fixacaoFem}\n`;
    i += `ROTEADOR ${n('roteador')} MAC:${formatMac(t.mac_roteador ?? '')} ${fixacao}\n\n`;
  } else if (tipoEquip === 'ONT') {
    i += `${mapOnt(t.ont_select ?? '')} MAC:${formatMac(t.mac_ont_select ?? '')} ${fixacao}\n\n`;
  }

  const localTesteNotebook = n('local_teste_notebook');
  const localTesteCliente = n('local_teste_cliente');
  i += `TESTE REALIZADO NO NOTEBOOK DO TÉCNICO, VIA CABO, AFERIU ${r('teste_notebook')} MEGA DE DOWNLOAD${localTesteNotebook ? ` (LOCAL: ${localTesteNotebook})` : ''}\n\n`;
  i += `TESTE FEITO NO ${n('dispositivo_teste')} ${n('marca_modelo_teste')} DO CLIENTE AFERIU ${r('velocidade_teste')} MEGA DE DOWNLOAD${localTesteCliente ? ` (LOCAL: ${localTesteCliente})` : ''}.\n\n`;

  const qtd = parseInt(t.qtd_pontos_adicionais ?? '1', 10) || 1;
  for (let e = 1; e <= qtd; e++) {
    const ordinal = ORDINAIS[e - 1] ?? `${e + 1}º`;
    const equip = mapEquip(String(t[`equip_${e}`] ?? ''));
    const macEquip = formatMac(t[`mac_equip_${e}`] ?? '');
    const localizacao = n(`localizacao_equip_${e}`);
    i += '----------\n\n';
    i += `>>> EQUIPAMENTO PONTO ${ordinal} ${n(`desc_ponto_${e}`)}.\n\n`;
    i += `${equip} MAC:${macEquip} ${localizacao}.\n\n`;
    i += `TESTE REALIZADO NO NOTEBOOK DO TÉCNICO, VIA CABO, AFERIU ${r(`teste_notebook_${e}`)} MEGA DE DOWNLOAD.\n\n`;
    i += `TESTE FEITO NO ${n(`dispositivo_${e}`)} ${n(`marca_modelo_${e}`)} DO CLIENTE AFERIU ${r(`velocidade_${e}`)} MEGA DE DOWNLOAD\n\n`;
  }

  const nomeCobertura = n('teste_cobertura');
  const nomeEnergia = n('nome_cliente_energia');
  i += 'TESTE DE COBERTURA WI-FI FOI REALIZADO NA PRESENÇA ';
  if (t.eh_assinante === 'NÃO') i += `DE ${nomeCobertura} (${n('parentesco_cobertura')})`;
  else i += `DO CLIENTE ${nomeCobertura}`;
  if (nomeEnergia) i += ` E ${nomeEnergia}`;
  i += '.\n';

  const appWbr = n('app_wbr_celular');
  if (appWbr) {
    i += `APP WBR: CELULAR ${appWbr}`;
    if (t.eh_assinante === 'NÃO') i += ` DE ${nomeCobertura} (${n('parentesco_cobertura')})`;
    else i += ` DO TITULAR ${nomeCobertura}`;
    i += ', ESTE APP CONCEDE ACESSO AOS BOLETOS E CONTRATO.\n';
  }

  if (t.app_mztv === 'SIM') i += `APP MZTV OU CDNTV: ${n('dispositivo_mztv')}\n`;
  else i += 'APP MZTV OU CDNTV: NÃO\n';

  // "Tomada"/"Extensão Elétrica" pedem o artigo ("NA TOMADA" / "NA EXTENSÃO
  // ELÉTRICA"); "T de Energia" fecha com "EM" ("EM T DE ENERGIA").
  const prepLig = (val: string) =>
    val === 'Tomada' || val === 'Extensão Elétrica' ? 'NA ' : 'EM ';

  const ligacaoPrimario = t.ligacao_eletrica ?? '';
  const localLigacao = n('local_ligacao_primario');
  i += 'LIGAÇÕES ELÉTRICAS PONTO PRIMÁRIO';
  if (localLigacao) i += ` (${localLigacao})`;
  i += `: A FONTE FICOU LIGADA ${prepLig(ligacaoPrimario)}`;
  i += ligacaoPrimario === 'Outro' ? n('observacao_ligacao_outros') : ligacaoPrimario.toUpperCase();
  i += '\n';

  for (let e = 1; e <= qtd; e++) {
    const ordinal = ORDINAIS[e - 1] ?? `${e + 1}º`;
    const ligacao = String(t[`ligacao_eletrica_${e}`] ?? '');
    const obs = n(`obs_ligacao_${e}`);
    i += `LIGAÇÕES ELÉTRICAS PONTO ${ordinal}: A FONTE FICOU LIGADA ${prepLig(ligacao)}`;
    i += ligacao === 'Outro' ? obs : ligacao.toUpperCase();
    i += '.\n';
  }

  const todasLigacoes = [
    ligacaoPrimario,
    ...Array.from({ length: qtd }, (_, idx) => t[`ligacao_eletrica_${idx + 1}`] ?? ''),
  ];
  if (
    todasLigacoes.some(
      (e) => String(e) === 'T de Energia' || String(e) === 'Extensão Elétrica',
    )
  ) {
    const acompanhantes: string[] = [];
    if (nomeCobertura) acompanhantes.push(nomeCobertura);
    if (nomeEnergia) acompanhantes.push(nomeEnergia);
    if (acompanhantes.length > 0) {
      i += `\n${acompanhantes.join(' E ')} ACOMPANHOU A ORDEM DE SERVIÇO E ESTÁ CIENTE DE QUE O ADAPTADOR PODE DESLIGAR OU ATÉ MESMO QUEIMAR OS EQUIPAMENTOS EMPRESTADOS EM COMODATO. `;
    }
  }

  i += `DISPOSITIVOS CONECTADOS NA REDE: ${n('dispositivos_conectados')}\n`;
  if (t.pagamento === 'SIM') {
    i += `VALOR R$: ${r('valor_pagamento')} PAGAMENTO (X)SIM ( )NAO\n`;
    i += `FORMA PAGAMENTO ${n('forma_pagamento')}\n`;
  } else {
    i += 'PAGAMENTO ( )SIM (X)NAO\n';
  }

  const observacoes = n('observacoes');
  if (observacoes) i += `\nOBS.: ${observacoes}\n`;

  return { protocolo: '', os: '', saida: i };
}
