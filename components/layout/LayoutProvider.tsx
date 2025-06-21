'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AppLayout from './AppLayout'

interface LayoutProviderProps {
  children: React.ReactNode
}

const authRoutes = ['/login', '/register']
const publicRoutes = ['/']

export default function LayoutProvider({ children }: LayoutProviderProps) {
  const pathname = usePathname()
  const { user, loading } = useAuth()

  // Não aplicar layout em rotas de autenticação
  if (authRoutes.includes(pathname)) {
    return <>{children}</>
  }

  // Não aplicar layout na página inicial (que redireciona)
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>
  }

  // Se estiver carregando ou não tiver usuário, não aplicar layout
  if (loading || !user) {
    return <>{children}</>
  }

  // Aplicar layout para páginas autenticadas
  return (
    <AppLayout>
      {children}
    </AppLayout>
  )
} 