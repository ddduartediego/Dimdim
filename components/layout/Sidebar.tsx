'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigation } from '@/hooks/useNavigation'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Icon,
  Badge,
  Avatar,
  Collapse,
  alpha,
} from '@mui/material'
import {
  ExpandLess,
  ExpandMore,
  Logout,
  Person,
} from '@mui/icons-material'
import { transitions, fadeInUp, pulse, bounceIn, staggerDelay } from './animations'

const SIDEBAR_WIDTH = 280

interface SidebarProps {
  open: boolean
  onClose: () => void
  isMobile: boolean
}

export default function Sidebar({ open, onClose, isMobile }: SidebarProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const { navigationGroups, isActiveItem, hasActiveItem } = useNavigation()
  const [expandedGroups, setExpandedGroups] = React.useState<string[]>([
    'Finanças', 'Análises', 'Ferramentas'
  ])

  const handleGroupToggle = (groupTitle: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupTitle)
        ? prev.filter(g => g !== groupTitle)
        : [...prev, groupTitle]
    )
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    if (isMobile) {
      onClose()
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
    if (isMobile) {
      onClose()
    }
  }

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon sx={{ color: 'white', fontSize: 24 }}>account_balance</Icon>
        </Box>
        <Box>
          <Typography variant="h6" fontWeight="bold" color="primary">
            Dimdim
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Gestão Financeira
          </Typography>
        </Box>
      </Box>

      {/* Navegação Principal */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ px: 2, py: 3 }}>
          {navigationGroups.map((group, groupIndex) => {
            const isExpanded = expandedGroups.includes(group.title)
            const hasActive = hasActiveItem(group)

            return (
              <React.Fragment key={group.title}>
                {/* Cabeçalho do Grupo */}
                <ListItem 
                  disablePadding 
                  sx={{ 
                    mb: 1,
                    animation: `${fadeInUp} 0.3s ease-out ${groupIndex * staggerDelay.group}s both`
                  }}
                >
                  <ListItemButton
                    onClick={() => handleGroupToggle(group.title)}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      backgroundColor: hasActive ? alpha('#1976D2', 0.08) : 'transparent',
                      transition: transitions.item,
                      '&:hover': {
                        backgroundColor: alpha('#1976D2', 0.12),
                        transform: 'translateX(4px)',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Icon 
                        sx={{ 
                          color: hasActive ? 'primary.main' : 'text.secondary',
                          fontSize: 20 
                        }}
                      >
                        {group.icon}
                      </Icon>
                    </ListItemIcon>
                    <ListItemText 
                      primary={group.title}
                      primaryTypographyProps={{
                        variant: 'subtitle2',
                        fontWeight: hasActive ? 600 : 500,
                        color: hasActive ? 'primary.main' : 'text.primary'
                      }}
                    />
                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>

                {/* Itens do Grupo */}
                <Collapse in={isExpanded} timeout={400} unmountOnExit>
                  <List disablePadding sx={{ ml: 2, mb: 2 }}>
                    {group.items.map((item, itemIndex) => {
                      const isActive = isActiveItem(item.path)

                      return (
                        <ListItem 
                          key={item.path} 
                          disablePadding 
                          sx={{ 
                            mb: 0.5,
                            animation: isExpanded 
                              ? `${fadeInUp} 0.2s ease-out ${itemIndex * staggerDelay.item}s both`
                              : 'none'
                          }}
                        >
                          <ListItemButton
                            onClick={() => handleNavigation(item.path)}
                            sx={{
                              borderRadius: 2,
                              py: 1,
                              pl: 2,
                              backgroundColor: isActive ? 'primary.main' : 'transparent',
                              color: isActive ? 'white' : 'text.primary',
                              transition: transitions.item,
                              '&:hover': {
                                backgroundColor: isActive 
                                  ? 'primary.dark' 
                                  : alpha('#1976D2', 0.08),
                                transform: 'translateX(6px)',
                                boxShadow: isActive 
                                  ? '0 4px 12px rgba(25, 118, 210, 0.3)'
                                  : '0 2px 8px rgba(0, 0, 0, 0.1)'
                              }
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              {item.badge ? (
                                <Badge 
                                  badgeContent={item.badge} 
                                  color={item.status === 'warning' ? 'warning' : 'error'}
                                  sx={{
                                    '& .MuiBadge-badge': {
                                      fontSize: '0.6rem',
                                      height: 16,
                                      minWidth: 16,
                                      backgroundColor: item.status === 'warning' ? '#FFC107' : undefined,
                                      animation: `${pulse} 2s infinite`,
                                      transition: transitions.badge,
                                      '&:hover': {
                                        animation: `${bounceIn} 0.6s ease-out`
                                      }
                                    }
                                  }}
                                >
                                  <Icon 
                                    sx={{ 
                                      color: isActive ? 'white' : item.status === 'warning' ? '#FFC107' : 'text.secondary',
                                      fontSize: 18 
                                    }}
                                  >
                                    {item.icon}
                                  </Icon>
                                </Badge>
                              ) : (
                                <Icon 
                                  sx={{ 
                                    color: isActive ? 'white' : item.status === 'warning' ? '#FFC107' : 'text.secondary',
                                    fontSize: 18 
                                  }}
                                >
                                  {item.icon}
                                </Icon>
                              )}
                            </ListItemIcon>
                            <ListItemText 
                              primary={item.label}
                              primaryTypographyProps={{
                                variant: 'body2',
                                fontWeight: isActive ? 600 : 400
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      )
                    })}
                  </List>
                </Collapse>
              </React.Fragment>
            )
          })}
        </List>
      </Box>

      {/* Seção do Usuário */}
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
        <List sx={{ px: 2, py: 2 }}>
          {/* Informações do Usuário */}
          <ListItem sx={{ mb: 1 }}>
            <ListItemIcon>
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem'
                }}
              >
                {user?.email?.charAt(0).toUpperCase()}
              </Avatar>
            </ListItemIcon>
            <ListItemText 
              primary={user?.email}
              primaryTypographyProps={{
                variant: 'body2',
                noWrap: true
              }}
            />
          </ListItem>

          <Divider sx={{ my: 1 }} />

          {/* Perfil (placeholder) */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              disabled
              sx={{
                borderRadius: 2,
                py: 1,
                opacity: 0.5
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Person sx={{ fontSize: 18, color: 'text.secondary' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Perfil"
                primaryTypographyProps={{
                  variant: 'body2',
                  color: 'text.secondary'
                }}
              />
            </ListItemButton>
          </ListItem>



          {/* Logout */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                py: 1,
                color: 'error.main',
                '&:hover': {
                  backgroundColor: alpha('#d32f2f', 0.08)
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Logout sx={{ fontSize: 18, color: 'error.main' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Sair"
                primaryTypographyProps={{
                  variant: 'body2',
                  color: 'error.main'
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  )

  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    )
  }

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: open ? SIDEBAR_WIDTH : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
        transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {drawerContent}
    </Drawer>
  )
} 