/**
 * Catálogo de frases do modelo `manut-sinal-alto` — piloto da extração.
 *
 * O texto saiu de `render/manutSinalAlto.ts` byte a byte. O render manteve TODA
 * a lógica: os 5 ramos de tipo de solicitação, a ordem dos blocos, os
 * separadores e os espaçadores. Aqui ficou só o que é conteúdo.
 *
 * Duas regras que valem para todo catálogo:
 *
 * 1. NENHUM texto tem espaço no começo ou no fim. O legado tinha — várias
 *    frases terminavam com um espaço solto, e no ramo `terceiro-terceiro` a
 *    pergunta sobre intervenção terminava SEM ele. Espaço é diagramação, não
 *    conteúdo: quem edita não enxerga um espaço final e o apagaria sem querer.
 *    O render recoloca cada um no lugar exato, e o teste de diff prova que a
 *    saída continua idêntica — inclusive nas assimetrias do legado.
 *
 * 2. Os placeholders têm nome legível. O render original usava as letras do
 *    bundle minificado (`s`, `a`, `o`, `c`, `l`, `m`, `p`, `h`, `g`, `_`).
 *    Ninguém edita um texto salpicado de `${_}` com segurança.
 *
 * Nomes usados aqui:
 *   {cliente}             1º nome do titular            (legado: a)
 *   {clienteCompleto}     nome completo do titular      (legado: i)
 *   {solicitante}         1º nome de quem ligou         (legado: s)
 *   {solicitanteCompleto} nome completo de quem ligou   (legado: o)
 *   {pessoa}              quem conduz o diálogo no ramo (a ou s)
 *   {parente}, {cargo}, {canal}, {contato}, {contatoSolicitante}
 *   {onu}                 1ª palavra do equipamento     (legado: m)
 *   {equipamentos}        equipamento por extenso       (legado: p)
 *   {sinalAtual}, {sinalAnterior}, {oscilacao}
 *   {formaPag}            forma crua ("PIX")            (legado: y)
 *   {formaPagFrase}       regência pronta ("VIA PIX")   (fraseFormaPag(y))
 *   {dataVisita}, {horaVisita}, {protocolo}, {bairro}, {tecnico}
 */
import type { Catalogo } from './tipos';

export const MANUT_SINAL_ALTO: Catalogo = {
  // ---------------------------------------------------------------- Protocolo
  aberturaTitular: {
    rotulo: 'Abertura — titular ligou',
    texto:
      '{cliente} ENTROU EM CONTATO POR {canal} ({contato}) INFORMANDO PROBLEMA DE CONEXAO.',
    obrigatorios: ['cliente'],
  },
  aberturaTerceiro: {
    rotulo: 'Abertura — terceiro ligou',
    texto:
      '{solicitante} ({parente} DE {cliente}) ENTROU EM CONTATO POR {canal} ({contatoSolicitante}) INFORMANDO PROBLEMA DE CONEXAO.',
    obrigatorios: ['solicitante', 'cliente'],
  },
  aberturaPj: {
    rotulo: 'Abertura — pessoa jurídica',
    texto:
      '{solicitante} ({cargo}) ENTROU EM CONTATO POR {canal} ({contatoSolicitante}) INFORMANDO PROBLEMA DE CONEXAO.',
    obrigatorios: ['solicitante'],
  },

  statusRemoto: {
    rotulo: 'Status remoto do cliente',
    texto: 'CLIENTE SEM BLOQUEIO, SEM REDUCAO E {onu} COM SINAL {sinalAtual} {oscilacao}.',
    obrigatorios: ['onu'],
  },

  relato: {
    rotulo: 'Relato do problema',
    texto:
      'QUESTIONADO {pessoa} DISSE QUE ESTA SOFRENDO DESCONEXOES REPETIDAS EM SUA REDE, ALEGA QUE OS DISPOSITIVOS ESTAO CONECTADOS COM MENSAGEM DE CONECTADO SEM INTERNET OU APRESENTAM EXTREMA LENTIDAO.',
    obrigatorios: ['pessoa'],
  },

  verificacao: {
    rotulo: 'Verificação remota do sinal',
    texto:
      'VERIFIQUEI REMOTAMENTE QUE A {onu} ESTA COM SINAL ALTO FORA DO PADRAO. REGISTRO DE ULTIMA MANUTENCAO ERA {sinalAnterior}, SINAL ATUAL {sinalAtual} {oscilacao}.',
    obrigatorios: ['onu'],
  },

  orientacaoReinicio: {
    rotulo: 'Orientação de reinício dos equipamentos',
    texto:
      'ORIENTEI {pessoa} A DESCONECTAR EQUIPAMENTOS ({equipamentos}) DA REDE ELETRICA E RECONECTA-LOS APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU.',
    obrigatorios: ['pessoa', 'equipamentos'],
  },

  perguntaIntervencao: {
    rotulo: 'Pergunta sobre intervenção na instalação',
    texto:
      'PERGUNTEI A {pessoa} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.',
    obrigatorios: ['pessoa'],
  },

  termosVisita: {
    rotulo: 'Termos e custo da visita técnica',
    texto:
      'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.',
    obrigatorios: [],
  },

  // Os quatro fechos do Protocolo. Mudam conforme quem acompanha e quem paga —
  // é a parte com consequência jurídica, por isso data e hora são obrigatórias
  // em todos eles.
  aceitePresencial: {
    rotulo: 'Aceite — quem ligou acompanha a visita',
    texto:
      '{pessoa} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA {formaPagFrase}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['pessoa', 'dataVisita', 'horaVisita'],
  },
  aceiteTitularAutorizaTerceiro: {
    rotulo: 'Aceite — titular autoriza o terceiro (confirmado por ligação)',
    texto:
      'POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU {solicitanteCompleto} ({parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. {cliente} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA {formaPagFrase}. VISITA AGENDADA PARA O DIA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita', 'horaVisita'],
  },
  aceiteTitularAcompanha: {
    rotulo: 'Aceite — terceiro ligou, mas o titular acompanha',
    texto:
      'POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita', 'horaVisita'],
  },
  aceiteTitularAusente: {
    rotulo: 'Aceite — titular ligou mas não estará presente',
    texto:
      '{cliente} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO {formaPagFrase}. {cliente} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU {solicitanteCompleto} ({parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita', 'horaVisita'],
  },

  encerramento: {
    rotulo: 'Encerramento do protocolo',
    texto: 'CLIENTE SEM DUVIDAS.',
    obrigatorios: [],
  },

  // --------------------------------------------------------------------- O.S
  // Um parágrafo corrido por ramo — é o texto que vai para o sistema do
  // provedor, e lá não há quebra de linha nem separador.
  osPj: {
    rotulo: 'Corpo da O.S — pessoa jurídica',
    texto:
      '{solicitante} ({cargo}) ENTROU EM CONTATO VIA {canal} ({contatoSolicitante}) E DISSE QUE ESTA COM DESCONEXOES REPETIDAS, QUESTIONADO(A) DISSE QUE "TODOS APARELHOS DE SUA RESIDENCIA PERDEM CONEXAO COM A INTERNET REPETIDAS VEZES DURANTE O DIA (FICA CONECTADO AO WIFI E SEM INTERNET)". REMOTAMENTE VERIFIQUEI QUE CONSTAM VARIAS DESCONEXOES, ONU ACESA COM SINAL ALTO FORA DO PADRAO ({sinalAtual} {oscilacao}), FOI INSTALADO COM {sinalAnterior}. ORIENTEI CLIENTE A DESCONECTAR AS FONTES DE ENERGIA DOS EQUIPAMENTOS ({equipamentos}) E RECONECTA-LOS APOS 30 SEGUNDOS, FEITO POREM CONEXAO E SINAL NAO NORMALIZOU. PERGUNTEI A {solicitante} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI A {solicitante} QUE E NECESSARIO VISITA TECNICA, QUE HAVENDO PROBLEMAS DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTO, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO) COBRA-SE VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS DANIFICADOS. {solicitante} DISSE ESTA CIENTE E CONCORDOU COM A VISITA E CASO HAJA COBRANCA SERA PAGO NO ATO COM {formaPag}. VISITA AGENDADA PARA DIA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['solicitante', 'dataVisita', 'horaVisita'],
  },
  osTerceiroAutorizado: {
    rotulo: 'Corpo da O.S — terceiro ligou e acompanha',
    texto:
      '{solicitante} ({parente} DE {cliente}) ENTROU EM CONTATO POR {canal} ({contatoSolicitante}) E DISSE QUE ESTA COM DESCONEXOES REPETIDAS, QUESTIONADO(A) DISSE QUE "TODOS APARELHOS DE SUA RESIDENCIA PERDEM CONEXAO COM A INTERNET REPETIDAS VEZES DURANTE O DIA (FICA CONECTADO AO WIFI E SEM INTERNET)". REMOTAMENTE VERIFIQUEI QUE CONSTAM VARIAS DESCONEXOES, ONU ACESA COM SINAL ALTO FORA DO PADRAO ({sinalAtual} {oscilacao}), FOI INSTALADO COM {sinalAnterior}. ORIENTEI CLIENTE A DESCONECTAR AS FONTES DE ENERGIA DOS EQUIPAMENTOS ({equipamentos}) E RECONECTA-LOS APOS 30 SEGUNDOS, FEITO POREM CONEXAO E SINAL NAO NORMALIZOU. PERGUNTEI A {solicitante} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI A {solicitante} QUE E NECESSARIO VISITA TECNICA, QUE HAVENDO PROBLEMAS DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTO, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO) COBRA-SE VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS DANIFICADOS. {solicitante} DISSE ESTA CIENTE E CONCORDOU COM A VISITA E CASO HAJA COBRANCA SERA PAGO NO ATO COM {formaPag}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU {solicitanteCompleto} ({parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['solicitante', 'cliente', 'dataVisita', 'horaVisita'],
  },
  osTerceiroTitularAcompanha: {
    rotulo: 'Corpo da O.S — terceiro ligou, titular acompanha',
    texto:
      '{solicitante} ({parente} DE {cliente}) ENTROU EM CONTATO POR {canal} ({contatoSolicitante}) E DISSE QUE ESTA COM DESCONEXOES REPETIDAS, QUESTIONADO(A) DISSE QUE "TODOS APARELHOS DE SUA RESIDENCIA PERDEM CONEXAO COM A INTERNET REPETIDAS VEZES DURANTE O DIA (FICA CONECTADO AO WIFI E SEM INTERNET)". REMOTAMENTE VERIFIQUEI QUE CONSTAM VARIAS DESCONEXOES, ONU ACESA COM SINAL ALTO FORA DO PADRAO ({sinalAtual} {oscilacao}), FOI INSTALADO COM {sinalAnterior}. ORIENTEI CLIENTE A DESCONECTAR AS FONTES DE ENERGIA DOS EQUIPAMENTOS ({equipamentos}) E RECONECTA-LOS APOS 30 SEGUNDOS, FEITO POREM CONEXAO E SINAL NAO NORMALIZOU. PERGUNTEI A {solicitante} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI A {solicitante} QUE E NECESSARIO VISITA TECNICA, QUE HAVENDO PROBLEMAS DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTO, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO) COBRA-SE VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS DANIFICADOS. {solicitante} DISSE ESTA CIENTE E CONCORDOU COM A VISITA E CASO HAJA COBRANCA SERA PAGO NO ATO COM {formaPag}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['solicitante', 'cliente', 'dataVisita', 'horaVisita'],
  },
  osTitularAusente: {
    rotulo: 'Corpo da O.S — titular ligou mas não estará presente',
    texto:
      '{cliente} ENTROU EM CONTATO VIA {canal} ({contato}) E DISSE QUE ESTA COM DESCONEXOES REPETIDAS, QUESTIONADO(A) DISSE QUE "TODOS APARELHOS DE SUA RESIDENCIA PERDEM CONEXAO COM A INTERNET REPETIDAS VEZES DURANTE O DIA (FICA CONECTADO AO WIFI E SEM INTERNET)". REMOTAMENTE VERIFIQUEI QUE CONSTAM VARIAS DESCONEXOES, ONU ACESA COM SINAL ALTO FORA DO PADRAO ({sinalAtual} {oscilacao}), FOI INSTALADO COM {sinalAnterior}. ORIENTEI CLIENTE A DESCONECTAR AS FONTES DE ENERGIA DOS EQUIPAMENTOS ({equipamentos}) E RECONECTA-LOS APOS 30 SEGUNDOS, FEITO POREM CONEXAO E SINAL NAO NORMALIZOU. PERGUNTEI A {cliente} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI A {cliente} QUE E NECESSARIO VISITA TECNICA, QUE HAVENDO PROBLEMAS DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTO, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO) COBRA-SE VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. {cliente} DISSE ESTA CIENTE E CONCORDOU COM A VISITA E CASO HAJA COBRANCA SERA PAGO NO ATO COM {formaPag}. {cliente} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU {solicitanteCompleto} ({parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita', 'horaVisita'],
  },
  osTitular: {
    rotulo: 'Corpo da O.S — titular ligou e acompanha',
    texto:
      '{cliente} ENTROU EM CONTATO VIA {canal} ({contato}) E DISSE QUE ESTA COM DESCONEXOES REPETIDAS, QUESTIONADO(A) DISSE QUE "TODOS APARELHOS DE SUA RESIDENCIA PERDEM CONEXAO COM A INTERNET REPETIDAS VEZES DURANTE O DIA (FICA CONECTADO AO WIFI E SEM INTERNET)". REMOTAMENTE VERIFIQUEI QUE CONSTAM VARIAS DESCONEXOES, ONU ACESA COM SINAL ALTO FORA DO PADRAO ({sinalAtual} {oscilacao}), FOI INSTALADO COM {sinalAnterior}. ORIENTEI CLIENTE A DESCONECTAR AS FONTES DE ENERGIA DOS EQUIPAMENTOS ({equipamentos}) E RECONECTA-LOS APOS 30 SEGUNDOS, FEITO POREM CONEXAO E SINAL NAO NORMALIZOU. PERGUNTEI A {cliente} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI A {cliente} QUE E NECESSARIO VISITA TECNICA, QUE HAVENDO PROBLEMAS DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTO, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO) COBRA-SE VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS DANIFICADOS. {cliente} DISSE ESTA CIENTE E CONCORDOU COM A VISITA E CASO HAJA COBRANCA SERA PAGO NO ATO COM {formaPag}. VISITA AGENDADA PARA DIA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita', 'horaVisita'],
  },

  indicacaoTecnica: {
    rotulo: 'Indicação técnica (rodapé da O.S)',
    texto:
      'TECNICO: VERIFICAR CONECTOR E DROP INTERNO E EXTERNO, ACHANDO O PROBLEMA APRESENTAR AO CLIENTE. SENDO DEFEITO EM QUE E DE OBRIGACAO DO PROVEDOR, TOMAR PROVIDENCIAS E RESTITUIR SEM CUSTO. SENDO OCASIONADO PEDIR AUTORIZACAO DO CLIENTE PARA CORRIGIR E RESTABELECER LEMBRANDO DO VALOR A SER COBRADO NO ATO. APOS RESTITUIR INTERNET, DAR EXPLICACOES SOBRE PLANO, WI-FI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTENCIAS NA INSTALACAO QUE NAO TIVER PADRAO, ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADA. TEMPO ESTIMADO 60 MIN.',
    obrigatorios: [],
  },

  // ------------------------------------------------------------------ Agenda
  agenda: {
    rotulo: 'Linha da agenda',
    texto: 'MAN SINAL ALTO {clienteCompleto} PROT:{protocolo} {formaPag} ({tecnico}) - {bairro}',
    obrigatorios: ['clienteCompleto', 'protocolo'],
  },
};
