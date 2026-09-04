/**
 * Catálogo de frases do modelo `termo-resp-padrao`.
 * Termo de responsabilidade pelo acesso ao roteador em comodato.
 *
 * ⚠️ DÉCIMO VAZAMENTO DE BRANDING: `acessoAdministrador` diz "GARANTIR QUE A
 * MZNET POSSA FORNECER O SUPORTE". Vira "A WBR" no sync.
 *
 * Este modelo é o mais sensível juridicamente do gerador — é o texto que o
 * cliente lê e aceita. Todo parágrafo está no catálogo, inclusive o termo
 * completo enviado ao cliente.
 */
import type { Catalogo } from './tipos';

export const TERMO_RESP_PADRAO: Catalogo = {
  abertura: {
    rotulo: 'Abertura do atendimento',
    texto: '{cliente} ENTROU EM CONTATO VIA {canal} ({contato}) E SOLICITOU ACESSO AO ROTEADOR EM COMODATO.',
    obrigatorios: ['cliente'],
  },
  statusOnu: {
    rotulo: 'Status remoto do cliente',
    texto: 'CLIENTE SEM BLOQUEIO, SEM REDUÇÃO, E ONU {sinalONU}.',
    obrigatorios: [],
  },
  pedidoAcesso: {
    rotulo: 'Pedido de acesso ao roteador',
    texto:
      'QUESTIONADO, {cliente} DISSE QUE DESEJA O ACESSO AO ROTEADOR QUE É EMPRESTADO EM REGIME DE COMODATO (MODELO: {roteador} / MAC Nº: {mac} ).',
    obrigatorios: ['cliente'],
  },
  motivoAcesso: {
    rotulo: 'Motivo do pedido de acesso',
    texto:
      'DISSE QUE QUER TER O ACESSO ÀS CONFIGURAÇÕES PARA FAZER ALTERAÇÕES EM NOME DE REDE, SENHA, ATUALIZAÇÃO DO FIRMWARE, ETC, POR CONTA PRÓPRIA SEM PRECISAR DO SUPORTE DA EMPRESA.',
    obrigatorios: [],
  },
  assumeResponsabilidade: {
    rotulo: 'Cliente assume responsabilidade pelo equipamento',
    texto:
      'EXPLIQUEI E DEIXEI {cliente} CIENTE DE QUE, A PARTIR DO MOMENTO EM QUE A SENHA FOR INFORMADA, O CLIENTE ASSUME TOTAL RESPONSABILIDADE PELO EQUIPAMENTO.',
    obrigatorios: ['cliente'],
  },
  acessoAdministrador: {
    // ⚠️ Cita o provedor. Vira "A WBR" no sync.
    rotulo: 'Recomendações sobre o acesso de administrador',
    texto:
      'DESTAQUEI QUE O ACESSO FORNECIDO É DE ADMINISTRADOR E RECOMENDEI QUE NÃO SEJAM REALIZADAS ATUALIZAÇÕES DE FIRMWARE NEM O BLOQUEIO DO NOSSO ACESSO REMOTO, A FIM DE GARANTIR QUE A WBR POSSA FORNECER O SUPORTE NECESSÁRIO NO FUTURO.',
    obrigatorios: [],
  },
  taxaDesconfiguracao: {
    rotulo: 'Taxa em caso de desconfiguração',
    texto:
      'INFORMEI TAMBÉM QUE, CASO O EQUIPAMENTO SOFRA QUALQUER DESCONFIGURAÇÃO (ESPONTÂNEA OU POR OUTRA RAZÃO), E SEJA NECESSÁRIO O ENVIO DE UM TÉCNICO AO LOCAL, SERÁ COBRADA UMA TAXA DE DESLOCAMENTO TÉCNICO NO VALOR DE R$50,00.',
    obrigatorios: [],
  },
  termoEncaminhado: {
    rotulo: 'Confirmação do aceite do termo',
    texto:
      'FOI ENCAMINHADO TERMO DE RESPONSABILIDADE, E {cliente} CONCORDOU, E SENDO ASSIM ESTÁ CIENTE DE SUAS RESPONSABILIDADES PARA COM O REFERIDO EQUIPAMENTO EM COMODATO.',
    obrigatorios: ['cliente'],
  },
  printAnexo: {
    rotulo: 'Print em anexo',
    texto: 'SEGUE PRINT EM ANEXO.',
    obrigatorios: [],
  },
  naoTestouSenha: {
    rotulo: 'Cliente não testou a nova senha',
    texto: '{cliente} NÃO TESTOU A NOVA SENHA; ACESSO A SER CONFIRMADO POSTERIORMENTE.',
    obrigatorios: ['cliente'],
  },
  repasseiAcesso: {
    rotulo: 'Repasse do acesso — abertura',
    texto: 'REPASSEI O ACESSO A {cliente}:',
    obrigatorios: ['cliente'],
  },
  linhaUsuario: {
    rotulo: 'Linha do usuário',
    texto: 'USUÁRIO: {user}',
    obrigatorios: [],
  },
  linhaSenha: {
    rotulo: 'Linha da senha',
    texto: 'SENHA: {senha}',
    obrigatorios: [],
  },
  confirmouAcesso: {
    rotulo: 'Cliente confirmou o acesso',
    texto: '{cliente} CONFIRMOU ACESSO E NÃO TEM DÚVIDAS.',
    obrigatorios: ['cliente'],
  },
  instrucaoAviso: {
    rotulo: 'Instrução para o operador — onde colar',
    texto: '>>> Insira esse texto no aviso do PESSOAS OU EMPRESAS <<<',
    obrigatorios: [],
  },
  instrucaoObservacoes: {
    rotulo: 'Instrução para o operador — segunda área',
    texto: '>>> Inserir TAMBÉM na área de OBSERVAÇÕES (dentro da aba TÉCNICO > EDITAR) <<<',
    obrigatorios: [],
  },
  avisoAcesso: {
    rotulo: 'Aviso a colar no cadastro',
    texto: 'CLIENTE TEM ACESSO AO ROTEADOR.',
    obrigatorios: [],
  },
  avisoProtocolo: {
    rotulo: 'Linha do protocolo no aviso',
    texto: 'PROTOCOLO Nº {protocolo}',
    obrigatorios: ['protocolo'],
  },

  termoCliente: {
    rotulo: 'Termo completo enviado ao cliente',
    texto:
      '{cliente} ENTROU EM CONTATO VIA {canal} ({contato}) E SOLICITOU DESBLOQUEIO E LIBERAÇÃO PARA ACESSO AO ROTEADOR DA EMPRESA, QUE É EMPRESTADO EM REGIME DE COMODATO (MODELO: {roteador} / MAC Nº: {mac}). MOTIVO: DISSE QUE QUER TER O ACESSO ÀS CONFIGURAÇÕES PARA FAZER ALTERAÇÕES EM NOME DE REDE, SENHA, ATUALIZAÇÃO DO FIRMWARE, ETC, POR CONTA PRÓPRIA SEM PRECISAR DO SUPORTE DA EMPRESA. EXPLIQUEI E DEIXEI {cliente} CIENTE DE QUE ALTERANDO A CONFIGURAÇÃO PADRÃO DO EQUIPAMENTO QUE É REALIZADO PELO PROVEDOR, PERDEMOS O ACESSO REMOTO IMPEDINDO SUPORTE TÉCNICO REMOTO QUANDO SOLICITADO, OU SEJA, TODA INTERVENÇÃO AO EQUIPAMENTO POR PARTE DO PROVEDOR, PASSARÁ A SER POR VISITA TÉCNICA PRESENCIAL COM COBRANÇA DO SERVIÇO PRESTADO OU, CLIENTE OU QUEM ELE DESIGNAR TRAZER O EQUIPAMENTO À EMPRESA ISENTANDO ASSIM DE CUSTOS DE VISITAS. EXPLIQUEI E DEIXEI {cliente} CIENTE DE QUE QUALQUER ALTERAÇÃO DE CONFIGURAÇÃO, ATUALIZAÇÃO DE FIRMWARE, ETC. QUE VIER A DANIFICAR O EQUIPAMENTO, ESTE SERÁ INUTILIZADO PELO PROVEDOR E CLIENTE TERÁ QUE ARCAR COM SEU VALOR ATUAL, PASSANDO ASSIM A SER DONO DO ROTEADOR E CASO ACONTEÇA, A EMPRESA PODERÁ INSTALAR OUTRO ROTEADOR EM REGIME DE COMODATO. {cliente} DISSE ESTAR CIENTE DE SUAS RESPONSABILIDADES COM REFERIDO EQUIPAMENTO, E SOLICITOU LIBERAÇÃO E DESBLOQUEIO.',
    obrigatorios: ['cliente'],
  },
  termoAceite: {
    rotulo: 'Linha de aceite do termo',
    texto: '*ESTANDO DE ACORDO, RESPONDA: SIM ou CONCORDO.*',
    obrigatorios: [],
  },
};
