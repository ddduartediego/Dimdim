import { useState, useMemo } from 'react'
import { 
  MaterialIcon, 
  IconCategory, 
  searchIcons, 
  getIconsByCategory, 
  getPopularIcons,
  ICON_CATEGORIES 
} from '@/lib/materialIcons'

export interface UseIconSearchReturn {
  // Estados
  searchQuery: string
  selectedCategory: IconCategory | 'Todos'
  selectedIcon: MaterialIcon | null
  
  // Resultados
  searchResults: MaterialIcon[]
  isSearching: boolean
  hasResults: boolean
  
  // Ações
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: IconCategory | 'Todos') => void
  selectIcon: (icon: MaterialIcon) => void
  clearSelection: () => void
  clearSearch: () => void
}

export function useIconSearch(): UseIconSearchReturn {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<IconCategory | 'Todos'>('Todos')
  const [selectedIcon, setSelectedIcon] = useState<MaterialIcon | null>(null)

  // Calcular resultados da busca
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() && selectedCategory === 'Todos') {
      // Se não há busca nem categoria, retorna ícones populares
      return getPopularIcons()
    }

    if (!searchQuery.trim() && selectedCategory !== 'Todos') {
      // Se só tem categoria selecionada, retorna todos da categoria
      return getIconsByCategory(selectedCategory)
    }

    // Se tem busca, aplica filtros
    const category = selectedCategory === 'Todos' ? undefined : selectedCategory
    return searchIcons(searchQuery, category)
  }, [searchQuery, selectedCategory])

  const isSearching = searchQuery.trim() !== ''
  const hasResults = searchResults.length > 0

  const selectIcon = (icon: MaterialIcon) => {
    setSelectedIcon(icon)
  }

  const clearSelection = () => {
    setSelectedIcon(null)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSelectedCategory('Todos')
    setSelectedIcon(null)
  }

  return {
    // Estados
    searchQuery,
    selectedCategory,
    selectedIcon,
    
    // Resultados
    searchResults,
    isSearching,
    hasResults,
    
    // Ações
    setSearchQuery,
    setSelectedCategory,
    selectIcon,
    clearSelection,
    clearSearch
  }
} 