/**
 * Catálogo de frases do modelo `inst-taxa-residencial`.
 * Abertura de O.S de instalação com taxa.
 *
 * ⚠️ VAZAMENTO DE BRANDING: `indicacaoTecnica` manda padronizar a rede Wi-Fi
 * como "NOME DO CLIENTE_WBR".
 */
import type { Catalogo } from './tipos';

export const INST_TAXA_RESIDENCIAL: Catalogo = {
  protocolo: {
    rotulo: 'Texto do protocolo',
    texto:
      '{sujeito} SOLICITOU {canal} A INSTALAÇÃO DE INTERNET PARA O ENDEREÇO CITADO NA O.S, PLANO DE ACESSO: {plano}; VENCIMENTO: DIA {vencimento} DO MÊS; VIGÊNCIA DO CONTRATO: 12 MESES. INSTALAÇÃO AGENDADA PARA {dataVisita} {horaVisita}.',
    obrigatorios: ['plano', 'dataVisita'],
  },
  taxaInstalacao: {
    rotulo: 'Taxa de instalação e forma de pagamento',
    texto: 'TAXA DE INSTALAÇÃO/ATIVAÇÃO: {taxa} EM {parcelas}, {formaPagFrase}.',
    obrigatorios: [],
  },
  titularAcompanha: {
    rotulo: 'Titular acompanhará a instalação',
    texto: '{cliente} ACOMPANHARÁ INSTALAÇÃO.',
    obrigatorios: ['cliente'],
  },
  titularAutorizaTerceiro: {
    rotulo: 'Titular autoriza terceiro a acompanhar',
    texto: '{cliente} ASSINOU CONTRATO DIGITALMENTE E AUTORIZOU {solicitanteCompleto} ({parente}) A ACOMPANHAR INSTALAÇÃO.',
    obrigatorios: ['cliente'],
  },
  indicacaoTecnica: {
    // ⚠️ Cita o provedor no padrão de nome de rede.
    rotulo: 'Indicação técnica da O.S',
    texto:
      'INSTALAR OS EQUIPAMENTOS EM LOCAL DE CONCORDÂNCIA DO CLIENTE, HABILITAR/ATIVAR PLANO ESCOLHIDO. CONFIGURAR REDE WI-FI, PADRONIZAR COM "NOME DO CLIENTE_WBR", SOLICITAR ESCOLHA DA SENHA. CONECTAR TODOS DISPOSITIVOS QUE APRESENTAREM, REALIZAR TESTES DA FUNCIONALIDADE DA INTERNET, AFERIR PLANO COM DISPOSITIVOS DO CLIENTE E OUTROS QUE ESTIVEREM NO LOCAL, FOTOGRAFAR, FILMAR, COMPARAR E EXPLICAR. TESTAR ABRANGÊNCIA DA WI-FI E EXPLICAR SOBRE COBERTURA. CONFERIR NAVEGAÇÃO IPv6, PADRONIZAR PORTA E SENHA DE ACESSO REMOTO, LIBERAR ACESSO EXTERNO PELA WAN. BAIXAR E INSTALAR OS APPS QUE FAZEM PARTE DO PLANO ESCOLHIDO, TANTO NOS TELEFONES E TVS QUE POSSUÍREM COMPATIBILIDADE PARA FUNCIONAMENTO E NÃO HAVENDO DAR EXPLICAÇÕES. COLHER ASSINATURAS, ENTREGAR VIA DO CONTRATO E CARNÊ DE PAGAMENTO.',
    obrigatorios: [],
  },
};
