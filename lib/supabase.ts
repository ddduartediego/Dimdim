import { createClient } from '@supabase/supabase-js'
import { Database, AvailableIcon, AvailableIconInsert } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Funções para gerenciar ícones disponíveis
export async function getAvailableIcons(): Promise<AvailableIcon[]> {
  const { data, error } = await supabase
    .from('available_icons')
    .select('*')
    .eq('is_active', true)
    .order('is_popular', { ascending: false })
    .order('name')

  if (error) {
    console.error('Erro ao buscar ícones disponíveis:', error)
    throw new Error('Erro ao carregar ícones disponíveis')
  }

  return data || []
}

export async function getPopularAvailableIcons(): Promise<AvailableIcon[]> {
  const { data, error } = await supabase
    .from('available_icons')
    .select('*')
    .eq('is_active', true)
    .eq('is_popular', true)
    .order('name')

  if (error) {
    console.error('Erro ao buscar ícones populares:', error)
    throw new Error('Erro ao carregar ícones populares')
  }

  return data || []
}

export async function searchAvailableIcons(query: string, category?: string): Promise<AvailableIcon[]> {
  let queryBuilder = supabase
    .from('available_icons')
    .select('*')
    .eq('is_active', true)

  if (category) {
    queryBuilder = queryBuilder.eq('category', category)
  }

  // Buscar nas palavras-chave usando array overlap
  queryBuilder = queryBuilder.or(`keywords.cs.{${query}},name.ilike.%${query}%,description.ilike.%${query}%`)

  const { data, error } = await queryBuilder.order('is_popular', { ascending: false }).order('name')

  if (error) {
    console.error('Erro ao buscar ícones:', error)
    throw new Error('Erro ao buscar ícones')
  }

  return data || []
}

export async function addAvailableIcon(iconData: AvailableIconInsert): Promise<AvailableIcon> {
  const { data, error } = await supabase
    .from('available_icons')
    .insert(iconData)
    .select()
    .single()

  if (error) {
    console.error('Erro ao adicionar ícone:', error)
    throw new Error('Erro ao adicionar ícone')
  }

  return data
}

