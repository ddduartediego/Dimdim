'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useNavigation } from '@/hooks/useNavigation'
import {
  Paper,
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  Icon,
  Badge,
  Box,
} from '@mui/material'

const mainNavigationItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'dashboard'
  },
  {
    path: '/transactions',
    label: 'Transações',
    icon: 'receipt_long'
  },
  {
    path: '/reports',
    label: 'Relatórios',
    icon: 'assessment'
  },
  {
    path: '/budgets',
    label: 'Orçamentos',
    icon: 'savings'
  }
]

interface BottomNavigationProps {
  isMobile: boolean
}

export default function BottomNavigation({ isMobile }: BottomNavigationProps) {
  const router = useRouter()
  const { pathname, isActiveItem } = useNavigation()

  // Só renderizar no mobile
  if (!isMobile) {
    return null
  }

  // Encontrar o índice do item ativo
  const activeIndex = mainNavigationItems.findIndex(item => isActiveItem(item.path))

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <Paper
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        zIndex: 1000,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
      elevation={8}
    >
      <MuiBottomNavigation
        value={activeIndex === -1 ? false : activeIndex}
        sx={{
          height: 64,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 0,
            '&.Mui-selected': {
              color: 'primary.main',
            }
          }
        }}
      >
        {mainNavigationItems.map((item, index) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            onClick={() => handleNavigation(item.path)}
            icon={
              <Icon 
                sx={{ 
                  fontSize: 22,
                  color: activeIndex === index ? 'primary.main' : 'text.secondary'
                }}
              >
                {item.icon}
              </Icon>
            }
            sx={{
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.65rem',
                fontWeight: activeIndex === index ? 600 : 400,
                mt: 0.5
              }
            }}
          />
        ))}
      </MuiBottomNavigation>
      
      {/* Spacer para compensar o bottom navigation */}
      <Box sx={{ height: 0 }} />
    </Paper>
  )
} 