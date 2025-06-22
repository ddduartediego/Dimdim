'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from '@mui/material/styles'
import { useMediaQuery } from '@mui/material'
import { useNavigationBadges } from './useNavigationBadges'

interface NavigationItem {
  path: string
  label: string
  icon: string
  badge?: number
  status?: 'success' | 'warning' | 'error'
}

interface NavigationGroup {
  title: string
  icon: string
  items: NavigationItem[]
}

export const useNavigation = () => {
  const pathname = usePathname()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  const { badges } = useNavigationBadges()

  // Persistir estado do sidebar no localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-open')
    if (savedState !== null && !isMobile) {
      setSidebarOpen(JSON.parse(savedState))
    }
  }, [isMobile])

  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebar-open', JSON.stringify(sidebarOpen))
    }
  }, [sidebarOpen, isMobile])

  // Fechar sidebar automaticamente no mobile após navegação
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [pathname, isMobile])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  // Definir estrutura de navegação com badges
  const navigationGroups: NavigationGroup[] = [
    {
      title: 'Finanças',
      icon: 'account_balance',
      items: [
        {
          path: '/main',
          label: 'Início',
          icon: 'home',
          badge: badges.transactions > 0 ? badges.transactions : undefined
        },
        {
          path: '/categories',
          label: 'Categorias',
          icon: 'category',
          badge: badges.categories > 0 ? badges.categories : undefined
        }
      ]
    },
    {
      title: 'Análises',
      icon: 'analytics',
      items: [
        {
          path: '/reports',
          label: 'Relatórios',
          icon: 'assessment',
          badge: badges.reports > 0 ? badges.reports : undefined
        },
        {
          path: '/budgets',
          label: 'Orçamentos',
          icon: 'savings',
          badge: badges.budgets > 0 ? badges.budgets : undefined,
          status: badges.budgets > 0 ? 'warning' : undefined
        }
      ]
    },
    {
      title: 'Ferramentas',
      icon: 'build',
      items: [
        {
          path: '/import',
          label: 'Importar CSV',
          icon: 'upload_file'
        }
      ]
    },
    {
      title: 'Sistema',
      icon: 'admin_panel_settings',
      items: [
        {
          path: '/settings',
          label: 'Configurações',
          icon: 'settings'
        }
      ]
    }
  ]

  // Função para obter item ativo
  const getActiveItem = (): NavigationItem | null => {
    for (const group of navigationGroups) {
      const activeItem = group.items.find(item => item.path === pathname)
      if (activeItem) return activeItem
    }
    return null
  }

  // Função para obter breadcrumb
  const getBreadcrumb = (): { group: string; item: string } | null => {
    for (const group of navigationGroups) {
      const activeItem = group.items.find(item => item.path === pathname)
      if (activeItem) {
        return {
          group: group.title,
          item: activeItem.label
        }
      }
    }
    return null
  }

  // Função para verificar se item está ativo
  const isActiveItem = (path: string): boolean => {
    return pathname === path
  }

  // Função para verificar se grupo tem item ativo
  const hasActiveItem = (group: NavigationGroup): boolean => {
    return group.items.some(item => item.path === pathname)
  }

  return {
    sidebarOpen,
    isMobile,
    navigationGroups,
    toggleSidebar,
    closeSidebar,
    getActiveItem,
    getBreadcrumb,
    isActiveItem,
    hasActiveItem,
    pathname
  }
} 