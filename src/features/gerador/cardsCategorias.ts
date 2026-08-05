/**
 * Labels e descrições de exibição dos cards de cada categoria, extraídos
 * 1:1 do bundle legado (config das páginas de categoria). Usados para deixar
 * as telas de lista fiéis. Ver docs/gerador/cards-categorias.json.
 */

export interface CardCategoria { slug: string; label: string; descricao: string; }

export const CARDS_POR_DEMANDA: Record<string, CardCategoria[]> = {
  "alteracao-plano": [
    {
      "slug": "altplan-remoto",
      "label": "Remoto (titular / terceiro / PJ)",
      "descricao": "Acordo remoto com variações de titular, terceiro e PJ no próprio formulário."
    },
    {
      "slug": "altplan-presencial",
      "label": "Presencial (titular / terceiro)",
      "descricao": "Atendimento presencial em loja, com variações de titular e terceiro."
    },
    {
      "slug": "altplan-sem-troca-visita-isenta",
      "label": "Sem troca: isento",
      "descricao": "Mantém o roteador atual; visita técnica sem custo."
    },
    {
      "slug": "altplan-sem-troca-visita-paga",
      "label": "Sem troca: pago",
      "descricao": "Mantém o roteador atual; visita técnica com custo."
    },
    {
      "slug": "altplan-troca-visita-isenta",
      "label": "Com troca: isento",
      "descricao": "Inclui troca de roteador; visita técnica sem custo."
    },
    {
      "slug": "altplan-troca-visita-paga",
      "label": "Com troca: pago",
      "descricao": "Inclui troca de roteador; visita técnica com custo."
    }
  ],
  "mudanca-endereco": [
    {
      "slug": "mud-end-padrao",
      "label": "Mud End padrão",
      "descricao": "Fluxo padrão para mudança de endereço."
    },
    {
      "slug": "mud-end-buscar-equipamentos",
      "label": "Mud End buscando equipamentos",
      "descricao": "Inclui retirada e entrega de equipamentos no novo endereço."
    },
    {
      "slug": "mud-end-com-fibra",
      "label": "Mud End com fibra WBR",
      "descricao": "Mudança de endereço para locais com fibra WBR."
    },
    {
      "slug": "mud-end-inviabilidade",
      "label": "Mud End sem viabilidade",
      "descricao": "Para casos em que não há viabilidade técnica no novo endereço."
    },
    {
      "slug": "mud-end-altplan-pago",
      "label": "Mud End + Alt Plano pago",
      "descricao": "Mudança de endereço renovando fidelidade, com visita paga."
    },
    {
      "slug": "mud-end-altplan-proposta",
      "label": "Mud End + Alt Plano isento (proposta)",
      "descricao": "Mudança com proposta de alteração de plano isenta."
    }
  ],
  "manutencao": [
    {
      "slug": "manut-luz-vermelha",
      "label": "Não ocasionado",
      "descricao": "Visita técnica para luz vermelha ou PON piscando."
    },
    {
      "slug": "manut-luz-vermelha-pj",
      "label": "Não ocasionado — PJ",
      "descricao": "Pessoa jurídica, com solicitante e cargo no registro."
    },
    {
      "slug": "manut-ocas-conector",
      "label": "Ocasionado conector",
      "descricao": "Dano interno em fibra/conector causado pelo cliente."
    },
    {
      "slug": "manut-ocas-fibra",
      "label": "Ocasionado fibra",
      "descricao": "Dano na fibra externa causado pelo cliente."
    },
    {
      "slug": "manut-fibra-externa",
      "label": "Rompimento externo",
      "descricao": "Rompimento de cabo externo na rede de fibra."
    },
    {
      "slug": "manut-luz-vermelha-isento",
      "label": "Retorno dentro dos 7 dias",
      "descricao": "Visita isenta — instalação dentro de 7 dias."
    },
    {
      "slug": "manut-onu-queimada",
      "label": "ONU queimada",
      "descricao": "ONU sem sinal (DYINGGASP). Cobrada se ocasionado."
    },
    {
      "slug": "manut-ont-queimada",
      "label": "ONT queimada",
      "descricao": "ONT sem sinal (DYINGGASP). Cobrada se ocasionado."
    },
    {
      "slug": "manut-roteador-queimado",
      "label": "Roteador queimado",
      "descricao": "Substituição de roteador. Cobrada ou isento."
    },
    {
      "slug": "manut-fonte-queimada",
      "label": "Fonte queimada",
      "descricao": "Troca de fonte. Com visita ou retirada na loja."
    },
    {
      "slug": "manut-sinal-alto",
      "label": "Sinal alto",
      "descricao": "Sinal fora do padrão com desconexões repetidas."
    },
    {
      "slug": "manut-visita-testes",
      "label": "Visita de Testes",
      "descricao": "Lentidão e/ou instabilidades na conexão."
    },
    {
      "slug": "manut-mud-ponto-int",
      "label": "Mudança de ponto interno",
      "descricao": "Retirar e reinstalar equipamentos em outro ambiente."
    },
    {
      "slug": "manut-realoc-fibra",
      "label": "Remanejamento de fibra",
      "descricao": "Realocar o drop/fibra a pedido do cliente."
    },
    {
      "slug": "manut-roteador-reset",
      "label": "Roteador / ONT resetado",
      "descricao": "Reconfiguração. Visita técnica paga ou na loja."
    }
  ],
  "midia-tv": [
    {
      "slug": "midia-roku-padrao",
      "label": "Roku TV — Padrão",
      "descricao": "Cliente solicita por telefone ou WhatsApp a compra do Roku TV."
    },
    {
      "slug": "midia-roku-presencial",
      "label": "Roku TV — Presencial",
      "descricao": "Cliente comparece à loja para comprar o Roku TV."
    }
  ],
  "senha-rede": [
    {
      "slug": "senha-altera-senha",
      "label": "Alteração de SSID / Senha",
      "descricao": "Alterar o nome da rede (SSID) e/ou a senha do Wi-Fi a pedido do cliente."
    }
  ],
  "wifi-extend": [
    {
      "slug": "wifi-extend-zte",
      "label": "Wi-Fi Extend — ZTE / Mesh",
      "descricao": "Alteração de plano com Wi-Fi Extend (ZTE). PF/PJ, solicitado ou ofertado, com ou sem troca do roteador primário."
    },
    {
      "slug": "wifi-extend-tplink",
      "label": "Wi-Fi Extend — TP-Link",
      "descricao": "Alteração de plano com Wi-Fi Extend usando equipamentos TP-Link. PF/PJ, com ou sem troca do roteador primário."
    },
    {
      "slug": "wifi-extend-ponto",
      "label": "Ponto adicional — roteador",
      "descricao": "Compra de 01 roteador adicional (R$360,00) para expandir a rede. Sem renovação de fidelidade. PF/PJ, com ou sem troca."
    }
  ],
  "termo-docs": [
    {
      "slug": "termo-resp-padrao",
      "label": "Termo de responsabilidade — Padrão",
      "descricao": "Formalização de acesso administrativo ao roteador emprestado em comodato."
    }
  ],
  "feedback": [
    {
      "slug": "feedback-sem-sucesso",
      "label": "Sem sucesso — 2 tentativas",
      "descricao": "Protocolo encerrado após 2 tentativas de contato sem retorno do cliente."
    },
    {
      "slug": "feedback-man-externa",
      "label": "Manutenção externa",
      "descricao": "Reparo técnico na rede externa. Confirmação pós-visita com o cliente."
    },
    {
      "slug": "feedback-man-ocasionado",
      "label": "Manutenção ocasionado",
      "descricao": "Reparo por dano ocasionado. Orientação ao cliente registrada."
    },
    {
      "slug": "feedback-troca-equip",
      "label": "Troca de equipamento",
      "descricao": "Substituição de ONU, ONT ou roteador defeituoso. Sem custos."
    },
    {
      "slug": "feedback-altplan",
      "label": "Alteração de plano",
      "descricao": "Feedback após altplan com ou sem troca de roteador."
    },
    {
      "slug": "feedback-mudanca-ponto",
      "label": "Mudança de ponto interno",
      "descricao": "Reinstalação em outro cômodo. Confirmação da mudança."
    },
    {
      "slug": "feedback-stb-roku",
      "label": "STB / Roku TV",
      "descricao": "Instalação e configuração de conversor ou Roku TV."
    },
    {
      "slug": "feedback-wifi-extend",
      "label": "Wi-Fi Extend",
      "descricao": "Instalação de 1 a 3 roteadores Wi-Fi Extend com testes de aferição."
    }
  ],
  "instalacao-gratis": [
    {
      "slug": "inst-gratis-residencial",
      "label": "Residencial — PF",
      "descricao": "Titular solicita e acompanha, titular autoriza terceiro, ou terceiro solicita. Todas as variantes em um só formulário."
    },
    {
      "slug": "inst-gratis-empresarial",
      "label": "Empresarial — PJ",
      "descricao": "Proprietário da empresa assina o contrato e autoriza um representante a acompanhar a instalação."
    }
  ],
  "instalacao-taxa": [
    {
      "slug": "inst-taxa-residencial",
      "label": "Residencial — PF",
      "descricao": "Titular solicita e acompanha, titular autoriza terceiro, ou terceiro solicita. Taxa de instalação registrada automaticamente."
    },
    {
      "slug": "inst-taxa-empresarial",
      "label": "Empresarial — PJ",
      "descricao": "Proprietário da empresa assina o contrato e autoriza representante. Taxa e forma de pagamento registradas na O.S."
    }
  ],
  "midia-tv-cadastro": [
    {
      "slug": "midia-roku-padrao",
      "label": "Roku TV — Padrão",
      "descricao": "Cliente solicita por telefone ou WhatsApp a compra do Roku TV."
    },
    {
      "slug": "midia-roku-presencial",
      "label": "Roku TV — Presencial",
      "descricao": "Cliente comparece à loja para comprar o Roku TV."
    },
    {
      "slug": "midia-stb-padrao",
      "label": "STB — Padrão",
      "descricao": "Cliente solicita por telefone ou WhatsApp a compra do STB."
    }
  ]
};

export function getCardsDemanda(demanda: string): CardCategoria[] {
  return CARDS_POR_DEMANDA[demanda] ?? [];
}

/** Busca o card (label/descrição fiéis) de um modelo pelo slug. */
export function getCardModelo(slug: string): CardCategoria | null {
  for (const list of Object.values(CARDS_POR_DEMANDA)) {
    const c = list.find((x) => x.slug === slug);
    if (c) return c;
  }
  return null;
}
