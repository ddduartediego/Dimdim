export interface MaterialIcon {
  name: string
  keywords: string[]
  category: string
  description: string
}

// Biblioteca completa de ícones Material Icons organizados por categoria
export const MATERIAL_ICONS_LIBRARY: MaterialIcon[] = [
  // ALIMENTAÇÃO E BEBIDAS
  {
    name: 'restaurant',
    keywords: ['comida', 'restaurante', 'garfo', 'faca', 'alimentação', 'comer', 'jantar'],
    category: 'Alimentação',
    description: 'Restaurante/Comida'
  },
  {
    name: 'fastfood',
    keywords: ['fast food', 'lanche', 'hamburguer', 'comida rápida', 'mc donalds', 'burger'],
    category: 'Alimentação',
    description: 'Fast Food'
  },
  {
    name: 'local_cafe',
    keywords: ['café', 'cafeteria', 'bebida', 'xícara', 'cappuccino', 'espresso'],
    category: 'Alimentação',
    description: 'Café/Cafeteria'
  },
  {
    name: 'coffee',
    keywords: ['café', 'bebida', 'cafeína', 'xícara', 'cappuccino'],
    category: 'Alimentação',
    description: 'Café'
  },
  {
    name: 'local_bar',
    keywords: ['bar', 'bebida', 'álcool', 'cerveja', 'drink', 'coquetel'],
    category: 'Alimentação',
    description: 'Bar/Bebidas'
  },
  {
    name: 'wine_bar',
    keywords: ['vinho', 'bar', 'álcool', 'bebida', 'taça', 'wine'],
    category: 'Alimentação',
    description: 'Vinho'
  },
  {
    name: 'local_pizza',
    keywords: ['pizza', 'pizzaria', 'comida', 'italiana', 'fatia'],
    category: 'Alimentação',
    description: 'Pizza'
  },
  {
    name: 'bakery_dining',
    keywords: ['padaria', 'pão', 'confeitaria', 'doces', 'bolo'],
    category: 'Alimentação',
    description: 'Padaria'
  },
  {
    name: 'icecream',
    keywords: ['sorvete', 'gelado', 'doce', 'sobremesa', 'sorveteria'],
    category: 'Alimentação',
    description: 'Sorvete'
  },
  {
    name: 'cake',
    keywords: ['bolo', 'doce', 'sobremesa', 'aniversário', 'confeitaria'],
    category: 'Alimentação',
    description: 'Bolo'
  },

  // TRANSPORTE
  {
    name: 'directions_car',
    keywords: ['carro', 'automóvel', 'veículo', 'transporte', 'dirigir', 'combustível'],
    category: 'Transporte',
    description: 'Carro'
  },
  {
    name: 'local_gas_station',
    keywords: ['posto', 'gasolina', 'combustível', 'abastecimento', 'etanol', 'diesel'],
    category: 'Transporte',
    description: 'Posto de Gasolina'
  },
  {
    name: 'flight',
    keywords: ['avião', 'voo', 'viagem', 'aeroporto', 'passagem', 'turismo'],
    category: 'Transporte',
    description: 'Avião/Voo'
  },
  {
    name: 'train',
    keywords: ['trem', 'metrô', 'transporte público', 'estação', 'trilho'],
    category: 'Transporte',
    description: 'Trem/Metrô'
  },
  {
    name: 'directions_bus',
    keywords: ['ônibus', 'transporte público', 'coletivo', 'passagem'],
    category: 'Transporte',
    description: 'Ônibus'
  },
  {
    name: 'local_taxi',
    keywords: ['taxi', 'táxi', 'uber', '99', 'corrida', 'transporte'],
    category: 'Transporte',
    description: 'Taxi/Uber'
  },
  {
    name: 'motorcycle',
    keywords: ['moto', 'motocicleta', 'bike', 'duas rodas'],
    category: 'Transporte',
    description: 'Motocicleta'
  },
  {
    name: 'pedal_bike',
    keywords: ['bicicleta', 'bike', 'pedalada', 'ciclo', 'ecológico'],
    category: 'Transporte',
    description: 'Bicicleta'
  },
  {
    name: 'directions_boat',
    keywords: ['barco', 'navio', 'navegação', 'mar', 'viagem'],
    category: 'Transporte',
    description: 'Barco/Navio'
  },

  // MORADIA E CASA
  {
    name: 'home',
    keywords: ['casa', 'moradia', 'lar', 'residência', 'habitação'],
    category: 'Moradia',
    description: 'Casa/Moradia'
  },
  {
    name: 'apartment',
    keywords: ['apartamento', 'prédio', 'condomínio', 'moradia'],
    category: 'Moradia',
    description: 'Apartamento'
  },
  {
    name: 'hotel',
    keywords: ['hotel', 'hospedagem', 'pousada', 'estadia', 'viagem'],
    category: 'Moradia',
    description: 'Hotel'
  },
  {
    name: 'house',
    keywords: ['casa', 'residência', 'moradia', 'lar', 'habitação'],
    category: 'Moradia',
    description: 'Casa'
  },
  {
    name: 'roofing',
    keywords: ['telhado', 'construção', 'reforma', 'casa', 'cobertura'],
    category: 'Moradia',
    description: 'Telhado/Construção'
  },
  {
    name: 'foundation',
    keywords: ['fundação', 'construção', 'obra', 'base', 'alicerce'],
    category: 'Moradia',
    description: 'Construção/Fundação'
  },
  {
    name: 'plumbing',
    keywords: ['encanamento', 'hidráulica', 'água', 'cano', 'instalação'],
    category: 'Moradia',
    description: 'Encanamento'
  },
  {
    name: 'electrical_services',
    keywords: ['elétrica', 'energia', 'instalação', 'eletricista', 'luz'],
    category: 'Moradia',
    description: 'Serviços Elétricos'
  },

  // SAÚDE E MEDICINA
  {
    name: 'local_hospital',
    keywords: ['hospital', 'saúde', 'médico', 'medicina', 'emergência', 'clínica'],
    category: 'Saúde',
    description: 'Hospital'
  },
  {
    name: 'local_pharmacy',
    keywords: ['farmácia', 'remédio', 'medicamento', 'droga', 'saúde'],
    category: 'Saúde',
    description: 'Farmácia'
  },
  {
    name: 'medical_services',
    keywords: ['médico', 'consulta', 'saúde', 'atendimento', 'clínica'],
    category: 'Saúde',
    description: 'Serviços Médicos'
  },
  {
    name: 'healing',
    keywords: ['cura', 'tratamento', 'saúde', 'medicina', 'terapia'],
    category: 'Saúde',
    description: 'Tratamento/Cura'
  },
  {
    name: 'psychology',
    keywords: ['psicologia', 'terapia', 'mental', 'psicólogo', 'saúde mental'],
    category: 'Saúde',
    description: 'Psicologia'
  },
  {
    name: 'fitness_center',
    keywords: ['academia', 'ginástica', 'exercício', 'fitness', 'musculação', 'saúde'],
    category: 'Saúde',
    description: 'Academia/Fitness'
  },
  {
    name: 'spa',
    keywords: ['spa', 'relaxamento', 'bem-estar', 'massagem', 'estética'],
    category: 'Saúde',
    description: 'Spa/Bem-estar'
  },

  // TRABALHO E NEGÓCIOS
  {
    name: 'work',
    keywords: ['trabalho', 'emprego', 'escritório', 'profissão', 'carreira'],
    category: 'Trabalho',
    description: 'Trabalho'
  },
  {
    name: 'business',
    keywords: ['negócio', 'empresa', 'corporativo', 'escritório', 'comercial'],
    category: 'Trabalho',
    description: 'Negócios'
  },
  {
    name: 'business_center',
    keywords: ['centro empresarial', 'escritório', 'negócios', 'corporativo'],
    category: 'Trabalho',
    description: 'Centro Empresarial'
  },
  {
    name: 'account_balance',
    keywords: ['banco', 'financeiro', 'conta', 'dinheiro', 'instituição'],
    category: 'Trabalho',
    description: 'Banco/Financeiro'
  },
  {
    name: 'store',
    keywords: ['loja', 'comércio', 'varejo', 'compras', 'estabelecimento'],
    category: 'Trabalho',
    description: 'Loja/Comércio'
  },
  {
    name: 'storefront',
    keywords: ['fachada', 'loja', 'comércio', 'estabelecimento', 'varejo'],
    category: 'Trabalho',
    description: 'Fachada de Loja'
  },

  // EDUCAÇÃO
  {
    name: 'school',
    keywords: ['escola', 'educação', 'ensino', 'estudo', 'aprendizado'],
    category: 'Educação',
    description: 'Escola'
  },
  {
    name: 'book',
    keywords: ['livro', 'leitura', 'estudo', 'literatura', 'educação'],
    category: 'Educação',
    description: 'Livro'
  },
  {
    name: 'library_books',
    keywords: ['biblioteca', 'livros', 'estudo', 'pesquisa', 'leitura'],
    category: 'Educação',
    description: 'Biblioteca'
  },
  {
    name: 'menu_book',
    keywords: ['caderno', 'anotação', 'estudo', 'lição', 'escola'],
    category: 'Educação',
    description: 'Caderno'
  },
  {
    name: 'calculate',
    keywords: ['calculadora', 'matemática', 'cálculo', 'números', 'conta'],
    category: 'Educação',
    description: 'Calculadora'
  },

  // LAZER E ENTRETENIMENTO
  {
    name: 'sports_esports',
    keywords: ['games', 'jogos', 'videogame', 'entretenimento', 'lazer', 'diversão'],
    category: 'Lazer',
    description: 'Video Games'
  },
  {
    name: 'movie',
    keywords: ['filme', 'cinema', 'entretenimento', 'diversão', 'lazer'],
    category: 'Lazer',
    description: 'Cinema/Filme'
  },
  {
    name: 'music_note',
    keywords: ['música', 'som', 'áudio', 'entretenimento', 'lazer'],
    category: 'Lazer',
    description: 'Música'
  },
  {
    name: 'theater_comedy',
    keywords: ['teatro', 'comédia', 'espetáculo', 'cultura', 'entretenimento'],
    category: 'Lazer',
    description: 'Teatro'
  },
  {
    name: 'sports_soccer',
    keywords: ['futebol', 'esporte', 'bola', 'jogo', 'campo'],
    category: 'Lazer',
    description: 'Futebol'
  },
  {
    name: 'sports_basketball',
    keywords: ['basquete', 'esporte', 'bola', 'cesta', 'quadra'],
    category: 'Lazer',
    description: 'Basquete'
  },
  {
    name: 'pool',
    keywords: ['piscina', 'natação', 'água', 'lazer', 'diversão'],
    category: 'Lazer',
    description: 'Piscina'
  },
  {
    name: 'beach_access',
    keywords: ['praia', 'mar', 'férias', 'lazer', 'turismo'],
    category: 'Lazer',
    description: 'Praia'
  },

  // COMPRAS
  {
    name: 'shopping_cart',
    keywords: ['compras', 'carrinho', 'supermercado', 'loja', 'mercado'],
    category: 'Compras',
    description: 'Carrinho de Compras'
  },
  {
    name: 'shopping_bag',
    keywords: ['sacola', 'compras', 'loja', 'varejo', 'shopping'],
    category: 'Compras',
    description: 'Sacola de Compras'
  },
  {
    name: 'local_grocery_store',
    keywords: ['supermercado', 'mercado', 'compras', 'alimentação', 'mantimentos'],
    category: 'Compras',
    description: 'Supermercado'
  },
  {
    name: 'local_mall',
    keywords: ['shopping', 'centro comercial', 'compras', 'lojas'],
    category: 'Compras',
    description: 'Shopping Center'
  },
  {
    name: 'local_atm',
    keywords: ['caixa eletrônico', 'atm', 'banco', 'saque', 'dinheiro'],
    category: 'Compras',
    description: 'Caixa Eletrônico'
  },

  // COMUNICAÇÃO E TECNOLOGIA
  {
    name: 'phone',
    keywords: ['telefone', 'celular', 'comunicação', 'ligação', 'contato'],
    category: 'Tecnologia',
    description: 'Telefone'
  },
  {
    name: 'smartphone',
    keywords: ['smartphone', 'celular', 'móvel', 'telefone', 'tecnologia'],
    category: 'Tecnologia',
    description: 'Smartphone'
  },
  {
    name: 'computer',
    keywords: ['computador', 'pc', 'desktop', 'tecnologia', 'trabalho'],
    category: 'Tecnologia',
    description: 'Computador'
  },
  {
    name: 'laptop',
    keywords: ['notebook', 'laptop', 'portátil', 'computador', 'trabalho'],
    category: 'Tecnologia',
    description: 'Notebook'
  },
  {
    name: 'wifi',
    keywords: ['internet', 'wireless', 'conexão', 'rede', 'tecnologia'],
    category: 'Tecnologia',
    description: 'WiFi/Internet'
  },

  // ANIMAIS
  {
    name: 'pets',
    keywords: ['animais', 'pet', 'cachorro', 'gato', 'bicho de estimação'],
    category: 'Animais',
    description: 'Animais de Estimação'
  },
  {
    name: 'cruelty_free',
    keywords: ['veterinário', 'animal', 'cuidado', 'pet', 'saúde animal'],
    category: 'Animais',
    description: 'Cuidados com Animais'
  },

  // VESTUÁRIO E BELEZA
  {
    name: 'checkroom',
    keywords: ['roupas', 'vestuário', 'guarda-roupa', 'moda', 'vestir'],
    category: 'Vestuário',
    description: 'Roupas/Vestuário'
  },
  {
    name: 'local_laundry_service',
    keywords: ['lavanderia', 'lavar roupa', 'limpeza', 'serviço'],
    category: 'Vestuário',
    description: 'Lavanderia'
  },
  {
    name: 'content_cut',
    keywords: ['cabelo', 'cabeleireiro', 'corte', 'salão', 'beleza'],
    category: 'Beleza',
    description: 'Cabeleireiro'
  },

  // SERVIÇOS E UTILIDADES
  {
    name: 'local_post_office',
    keywords: ['correios', 'postal', 'encomenda', 'carta', 'correspondência'],
    category: 'Serviços',
    description: 'Correios'
  },
  {
    name: 'local_police',
    keywords: ['polícia', 'segurança', 'delegacia', 'autoridade'],
    category: 'Serviços',
    description: 'Polícia'
  },
  {
    name: 'local_fire_department',
    keywords: ['bombeiros', 'emergência', 'incêndio', 'resgate'],
    category: 'Serviços',
    description: 'Bombeiros'
  },
  {
    name: 'build',
    keywords: ['construção', 'ferramenta', 'reparo', 'manutenção', 'obra'],
    category: 'Serviços',
    description: 'Construção/Reparo'
  },
  {
    name: 'cleaning_services',
    keywords: ['limpeza', 'faxina', 'higiene', 'serviço', 'doméstica'],
    category: 'Serviços',
    description: 'Serviços de Limpeza'
  },

  // FINANÇAS
  {
    name: 'attach_money',
    keywords: ['dinheiro', 'money', 'financeiro', 'pagamento', 'valor'],
    category: 'Finanças',
    description: 'Dinheiro'
  },
  {
    name: 'credit_card',
    keywords: ['cartão', 'crédito', 'pagamento', 'financeiro', 'compra'],
    category: 'Finanças',
    description: 'Cartão de Crédito'
  },
  {
    name: 'account_balance_wallet',
    keywords: ['carteira', 'wallet', 'dinheiro', 'pagamento', 'financeiro'],
    category: 'Finanças',
    description: 'Carteira'
  },
  {
    name: 'savings',
    keywords: ['poupança', 'economia', 'guardar dinheiro', 'investimento'],
    category: 'Finanças',
    description: 'Poupança'
  },
  {
    name: 'trending_up',
    keywords: ['investimento', 'crescimento', 'lucro', 'ganho', 'subida'],
    category: 'Finanças',
    description: 'Investimento/Crescimento'
  },
  {
    name: 'trending_down',
    keywords: ['perda', 'queda', 'prejuízo', 'diminuição', 'descida'],
    category: 'Finanças',
    description: 'Perda/Queda'
  },

  // GERAL/OUTROS
  {
    name: 'category',
    keywords: ['categoria', 'geral', 'classificação', 'tipo', 'grupo'],
    category: 'Geral',
    description: 'Categoria Geral'
  },
  {
    name: 'star',
    keywords: ['estrela', 'favorito', 'importante', 'destaque', 'avaliação'],
    category: 'Geral',
    description: 'Estrela/Favorito'
  },
  {
    name: 'label',
    keywords: ['etiqueta', 'tag', 'rótulo', 'identificação', 'marca'],
    category: 'Geral',
    description: 'Etiqueta/Tag'
  },
  {
    name: 'event',
    keywords: ['evento', 'calendário', 'data', 'compromisso', 'agenda'],
    category: 'Geral',
    description: 'Evento/Calendário'
  },
  {
    name: 'location_on',
    keywords: ['localização', 'endereço', 'lugar', 'mapa', 'posição'],
    category: 'Geral',
    description: 'Localização'
  },
  {
    name: 'schedule',
    keywords: ['horário', 'tempo', 'relógio', 'agenda', 'cronograma'],
    category: 'Geral',
    description: 'Horário/Agenda'
  }
]

// Categorias disponíveis
export const ICON_CATEGORIES = [
  'Alimentação',
  'Transporte', 
  'Moradia',
  'Saúde',
  'Trabalho',
  'Educação',
  'Lazer',
  'Compras',
  'Tecnologia',
  'Animais',
  'Vestuário',
  'Beleza',
  'Serviços',
  'Finanças',
  'Geral'
] as const

export type IconCategory = typeof ICON_CATEGORIES[number]

// Função para buscar ícones por palavra-chave
export function searchIcons(query: string, category?: IconCategory): MaterialIcon[] {
  if (!query.trim()) {
    return category 
      ? MATERIAL_ICONS_LIBRARY.filter(icon => icon.category === category)
      : MATERIAL_ICONS_LIBRARY
  }

  const searchTerm = query.toLowerCase().trim()
  
  return MATERIAL_ICONS_LIBRARY.filter(icon => {
    // Filtrar por categoria se especificada
    if (category && icon.category !== category) {
      return false
    }

    // Buscar no nome do ícone
    if (icon.name.toLowerCase().includes(searchTerm)) {
      return true
    }

    // Buscar na descrição
    if (icon.description.toLowerCase().includes(searchTerm)) {
      return true
    }

    // Buscar nas palavras-chave
    return icon.keywords.some(keyword => 
      keyword.toLowerCase().includes(searchTerm)
    )
  })
}

// Função para obter ícones por categoria
export function getIconsByCategory(category: IconCategory): MaterialIcon[] {
  return MATERIAL_ICONS_LIBRARY.filter(icon => icon.category === category)
}

// Função para verificar se um ícone existe na biblioteca
export function isValidIcon(iconName: string): boolean {
  return MATERIAL_ICONS_LIBRARY.some(icon => icon.name === iconName)
}

// Função para obter informações de um ícone específico
export function getIconInfo(iconName: string): MaterialIcon | undefined {
  return MATERIAL_ICONS_LIBRARY.find(icon => icon.name === iconName)
}

// Função para obter sugestões baseadas em texto
export function getIconSuggestions(text: string, limit: number = 5): MaterialIcon[] {
  const searchResults = searchIcons(text)
  return searchResults.slice(0, limit)
}

// Função para obter ícones mais populares (baseado na frequência de palavras-chave)
export function getPopularIcons(limit: number = 20): MaterialIcon[] {
  // Ícones mais comuns para categorias financeiras
  const popularIconNames = [
    'restaurant', 'directions_car', 'home', 'local_hospital', 'work',
    'school', 'shopping_cart', 'sports_esports', 'phone', 'pets',
    'flight', 'local_gas_station', 'coffee', 'movie', 'fitness_center',
    'attach_money', 'credit_card', 'savings', 'business', 'hotel'
  ]
  
  return popularIconNames
    .map(name => MATERIAL_ICONS_LIBRARY.find(icon => icon.name === name))
    .filter((icon): icon is MaterialIcon => icon !== undefined)
    .slice(0, limit)
} 