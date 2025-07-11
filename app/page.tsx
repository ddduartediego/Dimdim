'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { CircularProgress, Box, Typography } from '@mui/material'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/main')
      } else {
        router.push('/login')
      }
    }
  }, [user, loading, router])

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor="background.default"
    >
      <CircularProgress size={60} />
      <Typography variant="h6" mt={2}>
        Carregando Dimdim...
      </Typography>
    </Box>
  )
} 