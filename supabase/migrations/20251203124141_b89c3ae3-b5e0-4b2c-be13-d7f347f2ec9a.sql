-- Adicionar coluna steps para configuração de tours
ALTER TABLE jornadas_definicoes 
ADD COLUMN IF NOT EXISTS steps JSONB DEFAULT '[]'::jsonb;

-- Popular steps para tours existentes
UPDATE jornadas_definicoes SET steps = '[
  {
    "id": "welcome",
    "title": "Bem-vinda ao GiraMãe! 💕",
    "text": "Eu sou a Gira, sua guia aqui! Vou te mostrar como funciona a plataforma.",
    "giraEmotion": "waving",
    "attachTo": null
  },
  {
    "id": "wallet",
    "title": "Suas Girinhas ✨",
    "text": "Aqui você vê seu saldo de Girinhas, a moeda da comunidade!",
    "giraEmotion": "pointing",
    "attachTo": {"element": "[data-tour=\"wallet-button\"]", "on": "bottom"},
    "highlightClass": "gira-highlight-pulse"
  },
  {
    "id": "filters",
    "title": "Filtros 🔍",
    "text": "Use os filtros para encontrar exatamente o que você precisa.",
    "giraEmotion": "talking",
    "attachTo": {"element": "[data-tour=\"filters-panel\"]", "on": "bottom"}
  },
  {
    "id": "items",
    "title": "Itens Disponíveis 👕",
    "text": "Veja os itens publicados por outras mães da comunidade. Clique em \"Concluir\" para ganhar suas Girinhas!",
    "giraEmotion": "celebrating",
    "attachTo": {"element": "[data-tour=\"item-card\"]", "on": "bottom"}
  }
]'::jsonb
WHERE id = 'tour-feed';

UPDATE jornadas_definicoes SET steps = '[
  {
    "id": "welcome-carteira",
    "title": "Sua Carteira! 💰",
    "text": "Aqui você gerencia suas Girinhas e vê todo seu histórico de transações.",
    "giraEmotion": "waving",
    "attachTo": null
  },
  {
    "id": "saldo",
    "title": "Seu Saldo ✨",
    "text": "Este é o seu saldo atual de Girinhas. Use para reservar itens incríveis!",
    "giraEmotion": "pointing",
    "attachTo": {"element": "[data-tour=\"saldo-display\"]", "on": "bottom"},
    "highlightClass": "gira-highlight-pulse"
  },
  {
    "id": "comprar",
    "title": "Precisa de mais? 💳",
    "text": "Você pode comprar mais Girinhas aqui quando precisar.",
    "giraEmotion": "talking",
    "attachTo": {"element": "[data-tour=\"btn-comprar-girinhas\"]", "on": "bottom"}
  },
  {
    "id": "finish-carteira",
    "title": "Pronto! 🎉",
    "text": "Agora você conhece sua carteira! Ganhou Girinhas por completar este tour.",
    "giraEmotion": "celebrating",
    "attachTo": {"element": "[data-tour=\"wallet-button\"]", "on": "bottom"},
    "highlightClass": "gira-highlight-pulse"
  }
]'::jsonb
WHERE id = 'tour-carteira';

UPDATE jornadas_definicoes SET steps = '[
  {
    "id": "welcome-reservas",
    "title": "Suas Reservas! 📦",
    "text": "Aqui você gerencia todas as suas trocas: itens que você reservou e itens que outras mães reservaram de você.",
    "giraEmotion": "waving",
    "attachTo": null
  },
  {
    "id": "busca-codigo",
    "title": "Busca por Código 🔍",
    "text": "Encontre rapidamente uma reserva pelo código único do item (GRM-XXXXX).",
    "giraEmotion": "pointing",
    "attachTo": {"element": "[data-tour=\"busca-codigo\"]", "on": "bottom"}
  },
  {
    "id": "estatisticas",
    "title": "Estatísticas 📊",
    "text": "Veja quantas reservas ativas, filas de espera e vendas você tem. Clique para filtrar!",
    "giraEmotion": "talking",
    "attachTo": {"element": "[data-tour=\"reservas-stats\"]", "on": "bottom"}
  },
  {
    "id": "finish-reservas",
    "title": "Jornada Concluída! 🎉",
    "text": "Parabéns! Você ganhou Girinhas por completar este tour. Confira seu saldo!",
    "giraEmotion": "celebrating",
    "attachTo": {"element": "[data-tour=\"wallet-button\"]", "on": "bottom"},
    "highlightClass": "gira-highlight-pulse"
  }
]'::jsonb
WHERE id = 'tour-reservas';

-- Mini-tours para ações de engajamento
UPDATE jornadas_definicoes SET steps = '[
  {
    "id": "intro-favorito",
    "title": "Favoritar Itens ❤️",
    "text": "Vou te mostrar como salvar itens que você gostou para ver depois!",
    "giraEmotion": "waving",
    "attachTo": null
  },
  {
    "id": "encontrar-item",
    "title": "Encontre um Item 👀",
    "text": "Navegue pelo feed e encontre algo que você goste.",
    "giraEmotion": "pointing",
    "attachTo": {"element": "[data-tour=\"item-card\"]", "on": "bottom"}
  },
  {
    "id": "clicar-coracao",
    "title": "Clique no ❤️",
    "text": "Toque no coração para favoritar! Assim você encontra facilmente depois.",
    "giraEmotion": "celebrating",
    "attachTo": {"element": "[data-tour=\"btn-favorito\"]", "on": "top"}
  }
]'::jsonb
WHERE id = 'acao-favorito';

UPDATE jornadas_definicoes SET steps = '[
  {
    "id": "intro-favoritos",
    "title": "Seus Favoritos 💕",
    "text": "Veja os itens que você salvou!",
    "giraEmotion": "waving",
    "attachTo": null
  },
  {
    "id": "menu-favoritos",
    "title": "Acesse pelo Menu",
    "text": "Seus favoritos ficam guardados aqui. Confira agora!",
    "giraEmotion": "pointing",
    "attachTo": {"element": "[data-tour=\"header-menu\"]", "on": "bottom"}
  }
]'::jsonb
WHERE id = 'acao-ver-favoritos';

UPDATE jornadas_definicoes SET steps = '[
  {
    "id": "intro-seguir",
    "title": "Seguir Mães 👩‍👧",
    "text": "Conecte-se com outras mães da comunidade!",
    "giraEmotion": "waving",
    "attachTo": null
  },
  {
    "id": "perfil-mae",
    "title": "Visite um Perfil",
    "text": "Clique em um item para ver o perfil da mãe que publicou.",
    "giraEmotion": "pointing",
    "attachTo": {"element": "[data-tour=\"item-card\"]", "on": "bottom"}
  },
  {
    "id": "btn-seguir",
    "title": "Clique em Seguir!",
    "text": "Siga para ver os novos itens dela no seu feed.",
    "giraEmotion": "celebrating",
    "attachTo": {"element": "[data-tour=\"btn-seguir\"]", "on": "bottom"}
  }
]'::jsonb
WHERE id = 'acao-seguir-mae';

UPDATE jornadas_definicoes SET steps = '[
  {
    "id": "intro-maes",
    "title": "Mães Seguidas 👭",
    "text": "Veja todas as mães que você está seguindo!",
    "giraEmotion": "waving",
    "attachTo": null
  },
  {
    "id": "lista-maes",
    "title": "Sua Rede",
    "text": "Aqui estão as mães incríveis da sua rede de contatos.",
    "giraEmotion": "celebrating",
    "attachTo": null
  }
]'::jsonb
WHERE id = 'acao-ver-maes-seguidas';

UPDATE jornadas_definicoes SET steps = '[
  {
    "id": "intro-bonus",
    "title": "Bônus Diário! 🎁",
    "text": "Você sabia que pode ganhar Girinhas grátis todo dia?",
    "giraEmotion": "waving",
    "attachTo": null
  },
  {
    "id": "widget-bonus",
    "title": "Colete Aqui!",
    "text": "Clique no botão para coletar seu bônus diário!",
    "giraEmotion": "pointing",
    "attachTo": {"element": "[data-tour=\"bonus-diario\"]", "on": "bottom"},
    "highlightClass": "gira-highlight-pulse"
  }
]'::jsonb
WHERE id = 'acao-bonus-diario';

UPDATE jornadas_definicoes SET steps = '[
  {
    "id": "intro-indicacoes",
    "title": "Indicações 🎯",
    "text": "Ganhe Girinhas indicando amigas!",
    "giraEmotion": "waving",
    "attachTo": null
  },
  {
    "id": "como-funciona",
    "title": "Compartilhe seu Link",
    "text": "Cada amiga que se cadastrar pelo seu link te dá bônus!",
    "giraEmotion": "celebrating",
    "attachTo": null
  }
]'::jsonb
WHERE id = 'acao-conhecer-indicacoes';

UPDATE jornadas_definicoes SET steps = '[
  {
    "id": "intro-publicar",
    "title": "Publicar Item 📸",
    "text": "Vamos publicar seu primeiro item!",
    "giraEmotion": "waving",
    "attachTo": null
  },
  {
    "id": "btn-publicar",
    "title": "Clique Aqui!",
    "text": "Use este botão para começar a publicar.",
    "giraEmotion": "pointing",
    "attachTo": {"element": "[data-tour=\"btn-publicar\"]", "on": "bottom"},
    "highlightClass": "gira-highlight-pulse"
  }
]'::jsonb
WHERE id = 'acao-publicar-item';

UPDATE jornadas_definicoes SET steps = '[
  {
    "id": "intro-missoes",
    "title": "Missões 🎯",
    "text": "Descubra missões para ganhar mais Girinhas!",
    "giraEmotion": "waving",
    "attachTo": null
  },
  {
    "id": "lista-missoes",
    "title": "Suas Missões",
    "text": "Complete missões para desbloquear recompensas especiais!",
    "giraEmotion": "celebrating",
    "attachTo": null
  }
]'::jsonb
WHERE id = 'acao-ver-missoes';

UPDATE jornadas_definicoes SET steps = '[
  {
    "id": "intro-perfil",
    "title": "Seu Perfil 👤",
    "text": "Complete seu perfil para se conectar melhor!",
    "giraEmotion": "waving",
    "attachTo": null
  },
  {
    "id": "editar-perfil",
    "title": "Adicione Informações",
    "text": "Quanto mais completo, mais confiança você transmite!",
    "giraEmotion": "celebrating",
    "attachTo": null
  }
]'::jsonb
WHERE id = 'acao-completar-perfil';

-- Comentário para documentação
COMMENT ON COLUMN jornadas_definicoes.steps IS 'Configuração JSON dos passos do tour guiado. Estrutura: [{id, title, text, giraEmotion, attachTo: {element, on}, highlightClass?}]';