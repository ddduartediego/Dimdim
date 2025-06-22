-- Migration para sistema de ícones expandido
-- Esta migração adiciona suporte para gerenciar ícones disponíveis no sistema

-- Tabela para armazenar ícones disponíveis no sistema
CREATE TABLE IF NOT EXISTS available_icons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_available_icons_category ON available_icons(category);
CREATE INDEX IF NOT EXISTS idx_available_icons_popular ON available_icons(is_popular) WHERE is_popular = TRUE;
CREATE INDEX IF NOT EXISTS idx_available_icons_active ON available_icons(is_active);
CREATE INDEX IF NOT EXISTS idx_available_icons_keywords ON available_icons USING GIN(keywords);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_available_icons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_available_icons_updated_at
  BEFORE UPDATE ON available_icons
  FOR EACH ROW
  EXECUTE FUNCTION update_available_icons_updated_at();

-- Inserir ícones populares iniciais
INSERT INTO available_icons (name, description, category, keywords, is_popular) VALUES
('restaurant', 'Restaurante/Comida', 'Alimentação', ARRAY['comida', 'restaurante', 'garfo', 'faca', 'alimentação', 'comer', 'jantar'], TRUE),
('directions_car', 'Carro', 'Transporte', ARRAY['carro', 'automóvel', 'veículo', 'transporte', 'dirigir', 'combustível'], TRUE),
('home', 'Casa/Moradia', 'Moradia', ARRAY['casa', 'moradia', 'lar', 'residência', 'habitação'], TRUE),
('local_hospital', 'Hospital', 'Saúde', ARRAY['hospital', 'saúde', 'médico', 'medicina', 'emergência', 'clínica'], TRUE),
('work', 'Trabalho', 'Trabalho', ARRAY['trabalho', 'emprego', 'escritório', 'profissão', 'carreira'], TRUE),
('school', 'Escola', 'Educação', ARRAY['escola', 'educação', 'ensino', 'estudo', 'aprendizado'], TRUE),
('shopping_cart', 'Carrinho de Compras', 'Compras', ARRAY['compras', 'carrinho', 'supermercado', 'loja', 'mercado'], TRUE),
('sports_esports', 'Video Games', 'Lazer', ARRAY['games', 'jogos', 'videogame', 'entretenimento', 'lazer', 'diversão'], TRUE),
('phone', 'Telefone', 'Tecnologia', ARRAY['telefone', 'celular', 'comunicação', 'ligação', 'contato'], TRUE),
('pets', 'Animais de Estimação', 'Animais', ARRAY['animais', 'pet', 'cachorro', 'gato', 'bicho de estimação'], TRUE)

ON CONFLICT (name) DO NOTHING;

-- RLS (Row Level Security)
ALTER TABLE available_icons ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para todos os usuários autenticados
CREATE POLICY "available_icons_select_policy" ON available_icons
  FOR SELECT USING (auth.role() = 'authenticated'); 