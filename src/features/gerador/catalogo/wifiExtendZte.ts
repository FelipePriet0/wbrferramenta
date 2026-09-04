/**
 * Catálogo de frases do modelo `wifi-extend-zte`.
 * Alteração de plano com Wi-Fi Extend.
 *
 * EXTRAÇÃO PARCIAL: o legado monta o protocolo concatenando dezenas de pedaços
 * curtos com `+` e variáveis de uma letra. Extraí os PARÁGRAFOS inteiros — a
 * explicação do Wi-Fi Extend, a necessidade da visita e as indicações técnicas.
 * A cola entre eles fica travada e aparece cinza.
 *
 * ⚠️ VAZAMENTO DE BRANDING: as indicações técnicas mandam padronizar o nome da
 * rede como "NOME DO CLIENTE_WBR".
 */
import type { Catalogo } from './tipos';

export const WIFI_EXTEND_ZTE: Catalogo = {
  explicaPlanos: {
    rotulo: 'Introdução aos planos com Wi-Fi Extend',
    texto: 'INFORMEI AO CLIENTE QUE PARA CASOS COMO ESTE (RESIDENCIA GRANDE, SOBRADO, AREA DE LAZER ETC) TRABALHAMOS COM OS PLANOS QUE POSSUEM O WI-FI EXTEND.',
    obrigatorios: [],
  },
  explicaComoFunciona: {
    rotulo: 'Como o Wi-Fi Extend funciona',
    texto: 'EM RESUMO EXPLIQUEI QUE WI-FI EXTEND CONSISTE NUM SEGUNDO ROTEADOR ADICIONAL QUE {trechoConexao}. ESTE EM SI UTILIZA O MESMO NOME DE REDE E SENHA DO ROTEADOR PRINCIPAL SENDO COMO UM ESCRAVO.',
    obrigatorios: [],
  },
  comodato: {
    rotulo: 'Roteador adicional em comodato',
    texto: 'ESTE 2° ROTEADOR FICA EMPRESTADO EM REGIME DE COMODATO.',
    obrigatorios: [],
  },
  necessidadeVisita: {
    rotulo: 'Necessidade da visita de instalação',
    texto: 'INFORMEI A NECESSIDADE DO AGENDAMENTO DE VISITA TÉCNICA PARA INSTALAÇÃO E CONFIGURAÇÃO DO ROTEADOR ADICIONAL, REALIZAR OS TESTES DE ABRANGÊNCIA, QUALIDADE, VELOCIDADE E SANAR TODAS AS DÚVIDAS QUE CLIENTE/USUÁRIOS POSSAM TER.',
    obrigatorios: [],
  },
  visitaIsenta: {
    rotulo: 'Visita isenta de custos',
    texto: 'VISITA ISENTA DE CUSTOS.',
    obrigatorios: [],
  },
  procedimentosTecnicos: {
    // ⚠️ Cita o provedor no padrão de nome de rede.
    rotulo: 'Procedimentos do técnico (comum às duas indicações)',
    texto: 'EM LOCAL DE CONCORDANCIA DO CLIENTE E NA MELHOR ÁREA DE COBERTURA WI-FI. PADRONIZAR NOME DAS REDES ("NOME DO CLIENTE_WBR"), CONFERIR NAVEGAÇÃO IPv6, PADRONIZAR PORTA E SENHA DE ACESSO REMOTO, LIBERAR ACESSO EXTERNO PELA WAN; TESTAR ABRANGÊNCIA DA REDE WI-FI E EXPLICAR SOBRE COBERTURA, CONECTAR TODOS DISPOSITIVOS QUE APRESENTAR E REALIZAR TESTES, VERIFICAR E EXPLICAR SOBRE EQUIPAMENTOS QUE FUNCIONARAM MELHOR LIGADOS DIRETAMENTE AO ROTEADOR POR CABOS. BAIXAR E INSTALAR OS APP S QUE FAZEM PARTE DO PLANO ESCOLHIDO, TANTO NOS TELEFONES E TV S QUE POSSUÍREM COMPATIBILIDADE PARA FUNCIONAMENTO E NÃO HAVENDO DAR EXPLICAÇÕES. COLHER ASSINATURAS (O.S E CONTRATO), ENTREGAR DOCUMENTAÇÃO (VIAS DO CLIENTE), RECOLHER CARNÊ ANTIGO.',
    obrigatorios: [],
  },
  aberturaIndicacaoSemTroca: {
    rotulo: 'Indicação técnica — abertura, sem troca',
    texto: 'TÉCNICO: PLANO JÁ ALTERADO PARA NOVO PLANO ESCOLHIDO. INSTALAR 2° ROTEADOR (MODELO COMPATIVEL AO PLANO)',
    obrigatorios: [],
  },
  aberturaIndicacaoComTroca: {
    rotulo: 'Indicação técnica — abertura, com troca do primário',
    texto: 'TÉCNICO: PLANO JÁ ALTERADO PARA NOVO PLANO ESCOLHIDO. CONFERIR INSTALAÇÃO E EQUIPAMENTOS EM COMODATO, NÃO HAVENDO DANOS SUBSTITUIR ROTEADOR ATUAL (PRIMÁRIO) POR ROTEADOR ZTE H199-A. INSTALAR 2° ROTEADOR H-199A OU H-196A',
    obrigatorios: [],
  },
};
