'use client'

import React from 'react'
import { useNavigation } from '@/hooks/useNavigation'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Breadcrumbs,
  Link,
  Box,
  alpha,
} from '@mui/material'
import {
  Menu as MenuIcon,
  NavigateNext,
  Home,
} from '@mui/icons-material'
import { transitions, slideInFromTop } from './animations'

interface AppHeaderProps {
  onMenuToggle: () => void
  sidebarOpen: boolean
  isMobile: boolean
}

export default function AppHeader({ onMenuToggle, sidebarOpen, isMobile }: AppHeaderProps) {
  const { getBreadcrumb, getActiveItem } = useNavigation()
  
  const breadcrumb = getBreadcrumb()
  const activeItem = getActiveItem()

  const SIDEBAR_WIDTH = 280

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: isMobile 
          ? '100%' 
          : sidebarOpen 
            ? `calc(100% - ${SIDEBAR_WIDTH}px)` 
            : '100%',
        ml: isMobile 
          ? 0 
          : sidebarOpen 
            ? `${SIDEBAR_WIDTH}px` 
            : 0,
        transition: transitions.content,
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important' }}>
        {/* Menu Toggle Button (Mobile) */}
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={onMenuToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Breadcrumb */}
        <Box sx={{ flex: 1 }}>
          {breadcrumb ? (
            <Box sx={{ animation: `${slideInFromTop} 0.3s ease-out` }}>
              {/* Título da Página */}
              <Typography
                variant="h6"
                component="h1"
                sx={{
                  fontWeight: 600,
                  fontSize: '1.125rem',
                  mb: 0.5,
                  color: 'text.primary',
                  transition: transitions.smooth
                }}
              >
                {activeItem?.label}
              </Typography>

              {/* Breadcrumb Navigation */}
              <Breadcrumbs
                separator={<NavigateNext fontSize="small" />}
                sx={{
                  '& .MuiBreadcrumbs-separator': {
                    color: 'text.disabled'
                  },
                  animation: `${slideInFromTop} 0.4s ease-out 0.1s both`
                }}
              >
                <Link
                  color="inherit"
                  href="/dashboard"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'primary.main',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  <Home sx={{ mr: 0.5, fontSize: 14 }} />
                  Início
                </Link>
                
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: 'text.disabled'
                  }}
                >
                  {breadcrumb.group}
                </Typography>
                
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: 'primary.main',
                    fontWeight: 500
                  }}
                >
                  {breadcrumb.item}
                </Typography>
              </Breadcrumbs>
            </Box>
          ) : (
            /* Fallback quando não houver breadcrumb */
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontWeight: 600,
                fontSize: '1.125rem',
                color: 'text.primary'
              }}
            >
              Dimdim
            </Typography>
          )}
        </Box>

        {/* Actions - pode ser expandido futuramente */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Placeholder para ações futuras como notificações, busca, etc */}
        </Box>
      </Toolbar>
    </AppBar>
  )
} 