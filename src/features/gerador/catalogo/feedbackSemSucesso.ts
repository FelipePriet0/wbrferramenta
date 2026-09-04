/**
 * Catálogo de frases do modelo `feedback-sem-sucesso`.
 * Protocolo encerrado após duas tentativas de contato sem retorno do cliente.
 *
 * Nomes: {canal1}/{contato1}/{dataHora1} 1ª tentativa · {canal2}/{contato2}/
 *        {dataHora2} 2ª tentativa · {sinal} · {equipWifi} {equipCabo}
 */
import type { Catalogo } from './tipos';

export const FEEDBACK_SEM_SUCESSO: Catalogo = {
  primeiraTentativa: {
    rotulo: 'Primeira tentativa de contato',
    texto: 'TENTATIVA DE FEEDBACK VIA {canal1} ({contato1}) DIA {dataHora1}, E NÃO FUI ATENDIDO',
    obrigatorios: [],
  },
  segundaTentativa: {
    rotulo: 'Segunda tentativa de contato',
    texto: 'TENTATIVA DE CONTATO VIA {canal2} ({contato2}) DIA {dataHora2}. NÃO HOUVE RETORNO POR PARTE DO CLIENTE',
    obrigatorios: [],
  },
  encerramento: {
    rotulo: 'Decisão de encerrar o protocolo',
    texto: 'PROTOCOLO SERÁ ENCERRADO COMO CONCLUÍDO',
    obrigatorios: [],
  },
  conexaoAtiva: {
    rotulo: 'Estado da conexão no encerramento',
    texto: 'CONEXÃO ATIVA COM IP E SINAL DE FIBRA ({sinal})',
    obrigatorios: [],
  },
  dispositivosConectados: {
    rotulo: 'Dispositivos conectados no momento',
    texto: '({equipWifi}) EQUIPAMENTO(S) CONECTADO(S) VIA WI-FI. E ({equipCabo}) VIA CABO DE REDE (PRINT EM ANEXO)',
    obrigatorios: [],
  },
  semDispositivos: {
    rotulo: 'Nenhum dispositivo conectado',
    texto: 'NÃO HÁ DISPOSITIVOS CONECTADOS NA INTERNET NO MOMENTO (PRINT EM ANEXO)',
    obrigatorios: [],
  },
};
