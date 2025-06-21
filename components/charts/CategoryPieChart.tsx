'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Box, Typography, Avatar, Icon } from '@mui/material'
import { formatCurrency } from '@/lib/utils'

interface CategoryData {
  name: string
  value: number
  color: string
  icon: string
  percentage: number
}

interface CategoryPieChartProps {
  data: CategoryData[]
  width?: number
  height?: number
  showLegend?: boolean
  title?: string
}

export default function CategoryPieChart({
  data,
  width,
  height = 400,
  showLegend = true,
  title = "Gastos por Categoria"
}: CategoryPieChartProps) {
  
  // Customizar tooltip
  const renderTooltip = (props: any) => {
    if (props.active && props.payload && props.payload.length > 0) {
      const data = props.payload[0].payload
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 2,
            minWidth: 200
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                bgcolor: data.color + '20',
                color: data.color,
              }}
            >
              <Icon sx={{ fontSize: 14 }}>{data.icon}</Icon>
            </Avatar>
            <Typography variant="body2" fontWeight="bold">
              {data.name}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Valor: <strong>{formatCurrency(data.value)}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Percentual: <strong>{data.percentage.toFixed(1)}%</strong>
          </Typography>
        </Box>
      )
    }
    return null
  }

  // Customizar legenda
  const renderLegend = (props: any) => {
    const { payload } = props
    return (
      <Box sx={{ mt: 2 }}>
        {payload.map((entry: any, index: number) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 1,
              p: 1,
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            <Avatar
              sx={{
                width: 20,
                height: 20,
                bgcolor: entry.color + '20',
                color: entry.color,
              }}
            >
              <Icon sx={{ fontSize: 12 }}>{entry.payload.icon}</Icon>
            </Avatar>
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {entry.value}
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {formatCurrency(entry.payload.value)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ({entry.payload.percentage.toFixed(1)}%)
            </Typography>
          </Box>
        ))}
      </Box>
    )
  }

  // Renderizar label no gráfico
  const renderLabel = (entry: any) => {
    if (entry.percentage < 5) return '' // Não mostrar label para fatias muito pequenas
    return `${entry.percentage.toFixed(0)}%`
  }

  if (!data || data.length === 0) {
    return (
      <Box 
        sx={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Icon sx={{ fontSize: 48, color: 'text.secondary' }}>pie_chart</Icon>
        <Typography variant="body1" color="text.secondary">
          Nenhum dado disponível
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Adicione algumas transações para ver o gráfico
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      {title && (
        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
          {title}
        </Typography>
      )}
      
      <ResponsiveContainer width={width || '100%'} height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius="80%"
            fill="#8884d8"
            dataKey="value"
            stroke="#fff"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={renderTooltip} />
          {showLegend && <Legend content={renderLegend} />}
        </PieChart>
      </ResponsiveContainer>

      {/* Resumo total */}
      {data.length > 0 && (
        <Box sx={{ mt: 2, textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total de gastos
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {formatCurrency(data.reduce((sum, item) => sum + item.value, 0))}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {data.length} categoria{data.length > 1 ? 's' : ''}
          </Typography>
        </Box>
      )}
    </Box>
  )
} 