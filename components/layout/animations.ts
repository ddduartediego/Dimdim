import { keyframes } from '@mui/material/styles'

// Animações de entrada para o menu lateral
export const slideInFromLeft = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`

export const slideOutToLeft = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
`

// Animações para itens do menu
export const fadeInUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`

export const fadeInScale = keyframes`
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`

// Animação para badges
export const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`

export const bounceIn = keyframes`
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`

// Animação para o breadcrumb
export const slideInFromTop = keyframes`
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`

// Animação para o conteúdo principal
export const fadeInContent = keyframes`
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`

// Animação para botões hover
export const glowEffect = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(25, 118, 210, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(25, 118, 210, 0.6);
  }
  100% {
    box-shadow: 0 0 5px rgba(25, 118, 210, 0.3);
  }
`

// Configurações de transição
export const transitions = {
  sidebar: 'all 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  content: 'all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  item: 'all 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  badge: 'all 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  smooth: 'all 250ms ease-in-out',
  bouncy: 'all 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
}

// Delays para animações em cascata
export const staggerDelay = {
  item: 0.05, // 50ms entre cada item
  group: 0.1, // 100ms entre cada grupo
  badge: 0.2, // 200ms para badges
}

export default {
  slideInFromLeft,
  slideOutToLeft,
  fadeInUp,
  fadeInScale,
  pulse,
  bounceIn,
  slideInFromTop,
  fadeInContent,
  glowEffect,
  transitions,
  staggerDelay,
} 