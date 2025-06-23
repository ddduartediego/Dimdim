/** @type {import('next').NextConfig} */
const nextConfig = {
  // Otimizações de performance
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
  
  // Configurações de produção
  poweredByHeader: false, // Remove header "X-Powered-By"
  compress: true, // Habilita compressão gzip
  
  // Otimizações de bundle
  swcMinify: true, // Usar SWC para minificação (mais rápido)
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  },
  
  // Configurações de imagem (para futuras implementações)
  images: {
    domains: [], // Adicionar domínios conforme necessário
    formats: ['image/webp', 'image/avif'],
  },
  
  // Configurações de ambiente
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  },
}

module.exports = nextConfig 