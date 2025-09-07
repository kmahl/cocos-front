import { createTheme } from '@mui/material/styles';

// Colores específicos para trading
export const tradingColors = {
  // Colores principales de trading
  buy: '#00E676',        // Verde vibrante para BUY
  sell: '#FF1744',       // Rojo vibrante para SELL
  positive: '#4CAF50',   // Verde para ganancias/positivo
  negative: '#F44336',   // Rojo para pérdidas/negativo
  neutral: '#9E9E9E',    // Gris para neutro
  
  // Colores de background para cards
  buyBackground: '#E8F5E8',    // Verde muy claro para fondo
  sellBackground: '#FFEBEE',   // Rojo muy claro para fondo
  
  // Colores de acento
  accent: '#FF6D00',      // Naranja vibrante para acentos
  warning: '#FFC107',     // Amarillo para warnings
  info: '#2196F3',        // Azul para información
};

// Tema personalizado con Material Design 3
export const tradingTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976D2',     // Azul principal
      light: '#42A5F5',
      dark: '#1565C0',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF6D00',     // Naranja vibrante como secundario
      light: '#FF9800',
      dark: '#E65100',
      contrastText: '#FFFFFF',
    },
    error: {
      main: tradingColors.negative,
      light: '#EF5350',
      dark: '#C62828',
    },
    warning: {
      main: tradingColors.warning,
      light: '#FFD54F',
      dark: '#F57C00',
    },
    info: {
      main: tradingColors.info,
      light: '#64B5F6',
      dark: '#1976D2',
    },
    success: {
      main: tradingColors.positive,
      light: '#81C784',
      dark: '#388E3C',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    
    // Tipografías específicas para trading
    h4: {
      fontWeight: 600,
      fontSize: '2.125rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
  },
  
  components: {
    // Botones personalizados
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    
    // Cards personalizadas
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    
    // AppBar personalizada
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgb(185, 212, 208)', // Color del fondo del logo
          color: '#212121',
          boxShadow: 'none', // Sin shadow
          position: 'static',
        },
      },
    },
    
    // TextField personalizado
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
  
  shape: {
    borderRadius: 8,
  },
  
  spacing: 8,
});

// Utilidades para colores de trading
export const getTradingColor = (value, theme) => {
  if (value > 0) return tradingColors.positive;
  if (value < 0) return tradingColors.negative;
  return tradingColors.neutral;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatPercentage = (value) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export default tradingTheme;
