import React, { useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Divider,
  Chip,
  Paper,
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  Add,
  Remove,
  ShoppingCart,
  Sell,
  Cancel,
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { tradingColors, formatCurrency, formatPercentage } from '../theme/trading-theme';
import ApiStatus from './ApiStatus';

const Dashboard = () => {
  const {
    userId,
    portfolio,
    orders,
    allOrdersStats,
    ordersFilter,
    loading,
    refreshUserData,
    toggleModal,
    cancelOrder,
    setOrdersFilter,
  } = useApp();

  // Cargar datos iniciales
  useEffect(() => {
    if (userId) {
      refreshUserData(userId);
    }
  }, [userId]); // Removemos refreshUserData de las dependencias para evitar loops

  // Extraer datos con la estructura correcta de la API
  const portfolioData = portfolio || {};
  const cashBalance = portfolioData.cashBalance || {};
  const positions = Array.isArray(portfolioData.positions) ? portfolioData.positions : [];
  
  const portfolioStats = {
    totalValue: Number(portfolioData.totalValue || 0),
    availableCash: Number(cashBalance.available || 0),
    reservedCash: Number(cashBalance.reserved || 0),
    totalCash: Number(cashBalance.total || 0),
    totalReturn: Number(portfolioData.totalReturn || 0),
    totalReturnPercent: Number(portfolioData.totalReturnPercent || 0),
    positions: positions,
  };

  // Estadísticas de órdenes - usar allOrdersStats cuando hay filtro activo
  const orderStats = ordersFilter === 'ALL' 
    ? {
        total: Array.isArray(orders) ? orders.length : 0,
        filled: Array.isArray(orders) ? orders.filter(order => order && order.status === 'FILLED').length : 0,
        pending: Array.isArray(orders) ? orders.filter(order => order && order.status === 'NEW').length : 0,
        cancelled: Array.isArray(orders) ? orders.filter(order => order && order.status === 'CANCELLED').length : 0,
        rejected: Array.isArray(orders) ? orders.filter(order => order && order.status === 'REJECTED').length : 0,
      }
    : allOrdersStats;

  if (loading.portfolio && !portfolio) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        py: 8,
        gap: 2
      }}>
        <Typography variant="h6">Cargando portfolio...</Typography>
        <Typography variant="body2" color="text.secondary">
          Usuario {userId}
        </Typography>
      </Box>
    );
  }

  // Si no hay portfolio después de cargar, mostrar estado vacío
  if (!loading.portfolio && !portfolio) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 3,
        py: 4
      }}>
        {/* Header del Dashboard */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Portfolio - Usuario {userId}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Error al cargar los datos del portfolio
          </Typography>
        </Box>

        {/* Estado de la API */}
        <ApiStatus onRetry={() => refreshUserData(userId)} />

        {/* Mensaje de error alternativo */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          py: 4,
          gap: 2
        }}>
          <Typography variant="h6" color="text.secondary">
            No se pudo cargar el portfolio
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Usuario {userId} - Verifica la conexión con la API
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => refreshUserData(userId)}
            sx={{ mt: 2 }}
          >
            Reintentar
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        height: 'calc(100vh - 120px)', // Resta la altura del header
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        backgroundColor: '#b9d4d0', // Fondo verde claro como el header
      }}
    >
      {/* Layout Principal - Estilo Figma con Sidebar */}
      <Grid container spacing={2} sx={{ flexGrow: 1, p: 2, justifyContent: 'center'}}>
        {/* Columna Principal */}
        <Grid item xs={12} md={4} lg={4} xl={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', gap: 2 }}>
            {/* Cash Total con botones - Más ancho */}
            <Card sx={{ flexShrink: 0 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Información de Cash */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUp sx={{ color: tradingColors.positive, mr: 1.5, fontSize: 32 }} />
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                      Cash Total
                    </Typography>
                  </Box>
                  <Typography variant="h4" component="p" sx={{ fontWeight: 800, mb: 1.5, color: 'primary.main' }}>
                    {formatCurrency(portfolioStats?.totalCash || 0)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Disponible: {formatCurrency(portfolioStats?.availableCash || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reservado: {formatCurrency(portfolioStats?.reservedCash || 0)}
                    </Typography>
                  </Box>
                </Box>

                {/* Botones de Cash Operations - Horizontales */}
                <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => toggleModal('deposit')}
                    size="medium"
                    sx={{ 
                      color: tradingColors.positive,
                      borderColor: tradingColors.positive,
                      fontWeight: 600,
                      minWidth: 120,
                      '&:hover': {
                        backgroundColor: `${tradingColors.positive}10`,
                        borderColor: tradingColors.positive,
                      },
                    }}
                  >
                    Depositar
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Remove />}
                    onClick={() => toggleModal('withdraw')}
                    size="medium"
                    sx={{ 
                      color: tradingColors.negative,
                      borderColor: tradingColors.negative,
                      fontWeight: 600,
                      minWidth: 120,
                      '&:hover': {
                        backgroundColor: `${tradingColors.negative}10`,
                        borderColor: tradingColors.negative,
                      },
                    }}
                  >
                    Retirar
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Tabla de Posiciones */}
          <Card 
            sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Header con título, valor total y botones de trading */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
                      Mis Posiciones
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Valor Total: {formatCurrency(portfolioStats?.totalValue || 0)}
                    </Typography>
                  </Box>
                  
                  {/* Botones de Trading */}
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button
                      variant="contained"
                      startIcon={<ShoppingCart />}
                      onClick={() => toggleModal('trading', { side: 'BUY' })}
                      size="medium"
                      sx={{
                        backgroundColor: tradingColors.buy,
                        fontWeight: 600,
                        minWidth: 120,
                        '&:hover': {
                          backgroundColor: tradingColors.positive,
                        },
                      }}
                    >
                      COMPRAR
                    </Button>

                    <Button
                      variant="contained"
                      startIcon={<Sell />}
                      onClick={() => toggleModal('trading', { side: 'SELL' })}
                      size="medium"
                      sx={{
                        backgroundColor: tradingColors.sell,
                        fontWeight: 600,
                        minWidth: 120,
                        '&:hover': {
                          backgroundColor: tradingColors.negative,
                        },
                      }}
                    >
                      VENDER
                    </Button>
                  </Box>
                </Box>
              </Box>
              {portfolioStats.positions.length > 0 ? (
                <Box sx={{ 
                  flex: 1,
                  overflowY: 'auto',
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: 6,
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'grey.100',
                    borderRadius: 3,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'grey.400',
                    borderRadius: 3,
                    '&:hover': {
                      backgroundColor: 'grey.500',
                    },
                  },
                }}>
                  {/* Header de la tabla - más compacto */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1.5fr 0.8fr 0.8fr 0.8fr 0.8fr', 
                    gap: '5px', 
                    p: 1.5,
                    backgroundColor: 'grey.50',
                    borderRadius: 1,
                    mb: 1
                  }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      INSTRUMENTO
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      CANT.
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      PRECIO
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      VALOR
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      P&L
                    </Typography>
                  </Box>
                  
                  {/* Filas de posiciones - grid layout */}
                  {portfolioStats.positions.map((position, index) => (
                    <Box 
                      key={`position-${position.instrumentId || position.id || index}`}
                      sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1.5fr 0.8fr 0.8fr 0.8fr 0.8fr', 
                        gap: '5px', 
                        p: 1.5,
                        borderRadius: 1,
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          backgroundColor: 'grey.50',
                        },
                        borderBottom: index < portfolioStats.positions.length - 1 ? '1px solid' : 'none',
                        borderColor: 'grey.200',
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.2, fontSize: '0.8rem' }}>
                          {String(position.ticker || position.instrumentTicker || 'N/A')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.65rem' }}>
                          {String(position.name || position.instrumentName || 'Sin nombre')}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
                          {String(position.quantity?.total || position.quantity || 0)}
                        </Typography>
                        {position.quantity?.reserved > 0 && (
                          <Typography variant="caption" color="warning.main" sx={{ fontSize: '0.6rem' }}>
                            {position.quantity.reserved} res.
                          </Typography>
                        )}
                      </Box>
                      
                      <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                        {formatCurrency(position.currentPrice || 0)}
                      </Typography>
                      
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                        {formatCurrency(position.marketValue || position.currentValue || 0)}
                      </Typography>
                      
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          color: (position.totalReturnPercent || position.unrealizedPnL || 0) >= 0 
                            ? tradingColors.positive 
                            : tradingColors.negative,
                        }}
                      >
                        {position.totalReturnPercent !== undefined 
                          ? formatPercentage(position.totalReturnPercent)
                          : formatCurrency(position.unrealizedPnL || 0)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 6,
                  gap: 1
                }}>
                  <Typography variant="h6" color="text.secondary" fontWeight={500}>
                    No tienes posiciones activas
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Utiliza los botones de arriba para empezar a operar
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
          </Box>
        </Grid>

        {/* Sidebar Derecho - Órdenes Recientes */}
        <Grid item xs={12} md={8} lg={8} xl={8}>
          <Card 
            sx={{ 
              height: 'calc(100vh - 160px)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Header con estadísticas */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                  Órdenes Recientes
                </Typography>
                {ordersFilter !== 'ALL' && (
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Mostrando {orders.length} de {orderStats.total} órdenes
                  </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip 
                    label={`${orderStats.total} Total`} 
                    size="small" 
                    color={ordersFilter === 'ALL' ? 'primary' : 'default'}
                    variant={ordersFilter === 'ALL' ? 'filled' : 'outlined'}
                    clickable
                    onClick={() => setOrdersFilter('ALL')}
                    sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                  />
                  <Chip 
                    label={`${orderStats.pending} Pendientes`} 
                    size="small" 
                    color={ordersFilter === 'NEW' ? 'warning' : 'default'}
                    variant={ordersFilter === 'NEW' ? 'filled' : 'outlined'}
                    clickable
                    onClick={() => setOrdersFilter('NEW')}
                    sx={{ fontSize: '0.75rem' }}
                  />
                  <Chip 
                    label={`${orderStats.filled} Ejecutadas`} 
                    size="small" 
                    color={ordersFilter === 'FILLED' ? 'success' : 'default'}
                    variant={ordersFilter === 'FILLED' ? 'filled' : 'outlined'}
                    clickable
                    onClick={() => setOrdersFilter('FILLED')}
                    sx={{ fontSize: '0.75rem' }}
                  />
                  <Chip 
                    label={`${orderStats.cancelled} Canceladas`} 
                    size="small" 
                    color={ordersFilter === 'CANCELLED' ? 'error' : 'default'}
                    variant={ordersFilter === 'CANCELLED' ? 'filled' : 'outlined'}
                    clickable
                    onClick={() => setOrdersFilter('CANCELLED')}
                    sx={{ fontSize: '0.75rem' }}
                  />
                  <Chip 
                    label={`${orderStats.rejected || 0} Rechazadas`} 
                    size="small" 
                    color={ordersFilter === 'REJECTED' ? 'error' : 'default'}
                    variant={ordersFilter === 'REJECTED' ? 'filled' : 'outlined'}
                    clickable
                    onClick={() => setOrdersFilter('REJECTED')}
                    sx={{ fontSize: '0.75rem' }}
                  />
                </Box>
              </Box>

              {/* Lista de órdenes */}
              {orders.length > 0 ? (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 1,
                    overflowY: 'auto',
                    maxHeight: 'calc(100vh - 280px)', // Ajustado para tener scroll funcional
                    pr: 1,
                    '&::-webkit-scrollbar': {
                      width: 6,
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: 'grey.100',
                      borderRadius: 3,
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'grey.400',
                      borderRadius: 3,
                      '&:hover': {
                        backgroundColor: 'grey.500',
                      },
                    },
                  }}
                >
                  {orders.slice(0, 200).map((order, index) => (
                    <Box 
                      key={`order-${order.id || index}`}
                      sx={{ 
                        p: 1.5,
                        border: '1px solid',
                        borderColor: 'grey.200',
                        borderRadius: 3,
                        transition: 'all 0.2s',
                        backgroundColor: 'white',
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gridTemplateRows: 'auto auto auto',
                        gap: 1,
                        '&:hover': {
                          borderColor: 'primary.light',
                          backgroundColor: 'grey.50',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        },
                      }}
                    >
                      {/* Fila 1: Chips | Cantidad */}
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={String(order.side || 'N/A')}
                          size="small"
                          sx={{
                            backgroundColor: 
                              order.side === 'BUY' ? tradingColors.buyBackground :
                              order.side === 'SELL' ? tradingColors.sellBackground :
                              order.side === 'CASH_IN' ? tradingColors.buyBackground :
                              order.side === 'CASH_OUT' ? tradingColors.sellBackground :
                              'grey.200',
                            color: 
                              order.side === 'BUY' ? tradingColors.buy :
                              order.side === 'SELL' ? tradingColors.sell :
                              order.side === 'CASH_IN' ? tradingColors.buy :
                              order.side === 'CASH_OUT' ? tradingColors.sell :
                              'text.secondary',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            minWidth: 45,
                          }}
                        />
                        <Chip
                          label={String(order.status || 'N/A')}
                          size="small"
                          color={
                            order.status === 'FILLED' ? 'success' :
                            order.status === 'NEW' ? 'warning' : 
                            order.status === 'CANCELLED' ? 'error' :
                            order.status === 'REJECTED' ? 'error' : 'default'
                          }
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          ID: {String(order.id || 'N/A')} • Cant: {String(order.size || 0)}
                        </Typography>
                        {order.status === 'NEW' && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Cancel />}
                            onClick={() => cancelOrder(order.id)}
                            sx={{
                              color: tradingColors.negative,
                              borderColor: tradingColors.negative,
                              fontSize: '0.65rem',
                              minHeight: 24,
                              px: 1,
                              '&:hover': {
                                backgroundColor: `${tradingColors.negative}10`,
                                borderColor: tradingColors.negative,
                              },
                            }}
                          >
                            Cancelar
                          </Button>
                        )}
                      </Box>
                      
                      {/* Fila 2: Ticker | Fecha */}
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.9rem' }}>
                        {String(order.instrument?.ticker || 'N/A')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textAlign: 'right' }}>
                        {order.datetime ? new Date(order.datetime).toLocaleDateString() : 'N/A'}
                      </Typography>
                      
                      {/* Fila 3: Name | Platita */}
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
                        {String(order.instrument?.name || '')}
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem', color: 'primary.main', textAlign: 'right' }}>
                        {formatCurrency(order.price || 0)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 6,
                  gap: 1
                }}>
                  <Typography variant="body1" color="text.secondary" fontWeight={500}>
                    No hay órdenes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tus órdenes aparecerán aquí
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
