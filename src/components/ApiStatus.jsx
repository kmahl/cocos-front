import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  Alert,
  Chip,
} from '@mui/material';
import { 
  Refresh, 
  Warning, 
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { healthAPI } from '../utils/api';

const ApiStatus = ({ onRetry }) => {
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'online', 'offline'
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    setApiUrl(import.meta.env.VITE_API_URL || 'http://localhost:3000/api');
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    setApiStatus('checking');
    try {
      await healthAPI.check();
      setApiStatus('online');
    } catch (error) {
      console.error('API Health check failed:', error);
      setApiStatus('offline');
    }
  };

  const handleRetry = () => {
    checkApiHealth();
    if (onRetry) {
      onRetry();
    }
  };

  const getStatusConfig = () => {
    switch (apiStatus) {
      case 'checking':
        return {
          icon: <Refresh sx={{ animation: 'spin 1s linear infinite' }} />,
          color: 'info',
          message: 'Verificando conexión...',
          description: 'Conectando con la API'
        };
      case 'online':
        return {
          icon: <CheckCircle />,
          color: 'success',
          message: 'API Conectada',
          description: 'Todos los servicios funcionando correctamente'
        };
      case 'offline':
        return {
          icon: <ErrorIcon />,
          color: 'error',
          message: 'API No Disponible',
          description: 'No se puede conectar con el servidor'
        };
      default:
        return {
          icon: <Warning />,
          color: 'warning',
          message: 'Estado Desconocido',
          description: 'Verificando estado de la API'
        };
    }
  };

  const status = getStatusConfig();

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ color: `${status.color}.main` }}>
            {status.icon}
          </Box>
          <Typography variant="h6" component="h2">
            Estado de la API
          </Typography>
          <Chip 
            label={status.message}
            color={status.color}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {status.description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            URL: {apiUrl}
          </Typography>
        </Box>

        {apiStatus === 'offline' && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Posibles soluciones:</strong>
            </Typography>
            <Typography variant="body2" component="div" sx={{ mt: 1 }}>
              • Verifica que el backend esté ejecutándose<br/>
              • Revisa la URL en el archivo .env<br/>
              • Comprueba la configuración de CORS<br/>
              • Asegúrate de que no haya problemas de red
            </Typography>
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleRetry}
            startIcon={<Refresh />}
            disabled={apiStatus === 'checking'}
          >
            {apiStatus === 'checking' ? 'Verificando...' : 'Reintentar'}
          </Button>

          {apiStatus === 'offline' && (
            <Button
              variant="text"
              onClick={() => window.open(apiUrl.replace('/api', '/health'), '_blank')}
              size="small"
            >
              Abrir Health Check
            </Button>
          )}
        </Box>
      </CardContent>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Card>
  );
};

export default ApiStatus;
