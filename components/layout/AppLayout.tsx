'use client'

import React from 'react'
import { useNavigation } from '@/hooks/useNavigation'
import Sidebar from './Sidebar'
import AppHeader from './AppHeader'
import BottomNavigation from './BottomNavigation'
import {
  Box,
  CssBaseline,
  Toolbar,
} from '@mui/material'
import { transitions, fadeInContent } from './animations'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { 
    sidebarOpen, 
    isMobile, 
    toggleSidebar, 
    closeSidebar 
  } = useNavigation()

  const SIDEBAR_WIDTH = 280

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Header */}
      <AppHeader 
        onMenuToggle={toggleSidebar}
        sidebarOpen={sidebarOpen}
        isMobile={isMobile}
      />
      
      {/* Sidebar */}
      <Sidebar 
        open={sidebarOpen}
        onClose={closeSidebar}
        isMobile={isMobile}
      />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: isMobile 
            ? '100%' 
            : sidebarOpen 
              ? `calc(100% - ${SIDEBAR_WIDTH}px)` 
              : '100%',
          minHeight: '100vh',
          backgroundColor: 'background.default',
          transition: transitions.content,
        }}
      >
        {/* Toolbar Spacer */}
        <Toolbar />
        
        {/* Page Content */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            minHeight: 'calc(100vh - 64px)',
            pb: isMobile ? 10 : 3, // Extra padding bottom for mobile bottom nav
            animation: `${fadeInContent} 0.4s ease-out`,
            transition: transitions.content,
          }}
        >
          {children}
        </Box>
      </Box>
      
      {/* Bottom Navigation (Mobile) */}
      <BottomNavigation isMobile={isMobile} />
    </Box>
  )
} 