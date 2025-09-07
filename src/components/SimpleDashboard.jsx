import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
} from '@mui/material';
import { useApp } from '../contexts/AppContext';
import { formatCurrency, formatPercentage, tradingColors } from '../theme/trading-theme';

const SimpleDashboard = () => {
  const {
    userId,
    portfolio,
    orders,
    loading,
    refreshUserData,
  } = useApp();

  // Cargar datos iniciales
  useEffect(() => {
    if (userId) {
      console.log('Loading data for user:', userId);
      refreshUserData(userId);
    }
  }, [userId]);

  console.log('Dashboard render - Portfolio:', portfolio);
  console.log('Dashboard render - Orders:', orders);
  console.log('Dashboard render - Loading:', loading);

  if (loading.portfolio && !portfolio) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">Cargando portfolio...</Typography>
        <Typography variant="body2" color="text.secondary">
          Usuario {userId}
        </Typography>
      </Box>
    );
  }

  if (!loading.portfolio && !portfolio) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Error al cargar portfolio
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Usuario {userId}
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => refreshUserData(userId)}
          sx={{ mt: 2 }}
        >
          Reintentar
        </Button>
      </Box>
    );
  }

  // Extraer datos del portfolio con la estructura correcta
  const portfolioData = portfolio || {};
  const cashBalance = portfolioData.cashBalance || {};
  const positions = portfolioData.positions || [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Portfolio - Usuario {userId}
      </Typography>
      
      {/* Cards de resumen */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Value */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Valor Total
              </Typography>
              <Typography variant="h4" component="p" sx={{ fontWeight: 600 }}>
                {formatCurrency(portfolioData.totalValue || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Cash Disponible */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cash Disponible
              </Typography>
              <Typography variant="h4" component="p" sx={{ fontWeight: 600, color: 'success.main' }}>
                {formatCurrency(cashBalance.available || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Reservado: {formatCurrency(cashBalance.reserved || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Cash */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cash Total
              </Typography>
              <Typography variant="h4" component="p" sx={{ fontWeight: 600 }}>
                {formatCurrency(cashBalance.total || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Posiciones */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Posiciones
              </Typography>
              <Typography variant="h4" component="p" sx={{ fontWeight: 600 }}>
                {positions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Instrumentos activos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lista de Posiciones */}
      {positions.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              Mis Posiciones
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {positions.map((position, index) => (
                <Card 
                  key={`position-${position.instrumentId}-${index}`}
                  variant="outlined"
                  sx={{ p: 2 }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <Typography variant="h6" component="h3">
                        {position.ticker}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {position.name}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6} sm={2}>
                      <Typography variant="body2" color="text.secondary">
                        Cantidad
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {position.quantity?.total || 0}
                      </Typography>
                      {position.quantity?.reserved > 0 && (
                        <Typography variant="caption" color="warning.main">
                          ({position.quantity.reserved} reservadas)
                        </Typography>
                      )}
                    </Grid>
                    
                    <Grid item xs={6} sm={2}>
                      <Typography variant="body2" color="text.secondary">
                        Precio Actual
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatCurrency(position.currentPrice || 0)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6} sm={2}>
                      <Typography variant="body2" color="text.secondary">
                        Valor de Mercado
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatCurrency(position.marketValue || 0)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Rendimiento
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          color: (position.totalReturnPercent || 0) >= 0 
                            ? tradingColors.positive 
                            : tradingColors.negative,
                        }}
                      >
                        {formatPercentage(position.totalReturnPercent || 0)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Información de debug */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Debug Info
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Account Number: {portfolioData.accountNumber || 'N/A'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            User ID: {portfolioData.userId || 'N/A'}
          </Typography>
          <Typography variant="body2">
            Orders data type: {typeof orders} | Length: {Array.isArray(orders) ? orders.length : 'N/A'}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SimpleDashboard;
