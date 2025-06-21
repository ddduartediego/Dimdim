import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ClientThemeProvider } from '@/components/ClientThemeProvider'
import LayoutProvider from '@/components/layout/LayoutProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dimdim - Gestão Financeira Pessoal',
  description: 'Aplicação para controle e gestão das suas finanças pessoais',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
      </head>
      <body className={inter.className}>
        <ClientThemeProvider>
          <AuthProvider>
            <LayoutProvider>
              {children}
            </LayoutProvider>
          </AuthProvider>
        </ClientThemeProvider>
      </body>
    </html>
  )
} 