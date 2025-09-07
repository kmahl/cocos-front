import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Typography,
  Container,
} from '@mui/material';
import { useApp } from '../contexts/AppContext';
import { orderProcessingAPI } from '../utils/api';

const Header = () => {
  const { 
    userId, 
    setUserId, 
    refreshUserData, 
    showSnackbar, 
    setGlobalLoading 
  } = useApp();
  
  const [processOrderId, setProcessOrderId] = useState('');
  const [processing, setProcessing] = useState(false);

  // Maneja el cambio de usuario
  const handleUserChange = async (event) => {
    const newUserId = event.target.value;
    setUserId(newUserId);
    
    // Cargar datos del nuevo usuario
    showSnackbar(`Cambiando a Usuario ${newUserId}...`, 'info');
    await refreshUserData(newUserId);
    showSnackbar(`Usuario ${newUserId} cargado exitosamente`, 'success');
  };

  // Maneja el procesamiento de órdenes
  const handleProcessOrder = async () => {
    if (!processOrderId.trim()) {
      showSnackbar('Por favor, ingresa un ID de orden', 'warning');
      return;
    }

    setProcessing(true);
    try {
      const response = await orderProcessingAPI.processOrder(processOrderId);
      
      if (response.success) {
        showSnackbar(`Orden ${processOrderId} procesada exitosamente`, 'success');
        setProcessOrderId(''); // Limpiar input
        
        // Actualizar datos del usuario
        await refreshUserData();
      } else {
        throw new Error(response.error || 'Error al procesar la orden');
      }
    } catch (error) {
      console.error('Error processing order:', error);
      showSnackbar(error.userMessage || 'Error al procesar la orden', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AppBar position="static" elevation={1}>
      <Container maxWidth="xl">
        <Toolbar 
          sx={{ 
            justifyContent: 'space-between', 
            py: 2, // Aumentado padding vertical para acomodar logo más grande
            minHeight: 120, // Aumentado de 80 a 120
            height: 120,    // Aumentado de 80 a 120
          }}
        >
          {/* Logo y Título */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box
              component="img"
              src="/cocada.png"
              alt="Cocada Trading"
              sx={{
                height: 100,
                width: 100,
                objectFit: 'contain',
              }}
            />
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: { xs: 'none', sm: 'block' },
                letterSpacing: '-0.02em',
                fontFamily: '"Inter", "Roboto", sans-serif',
              }}
            >
              Cocada Trading
            </Typography>
          </Box>

          {/* Controles del Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Selector de Usuario */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="user-select-label">Usuario</InputLabel>
              <Select
                labelId="user-select-label"
                id="user-select"
                value={userId}
                label="Usuario"
                onChange={handleUserChange}
                sx={{
                  backgroundColor: 'background.paper',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider',
                  },
                }}
              >
                {[1, 2, 3, 4, 5].map((id) => (
                  <MenuItem key={id} value={id}>
                    Usuario {id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Process Simulator */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: 'primary.contrastText',
                  display: { xs: 'none', md: 'block' },
                }}
              >
                Process Simulator:
              </Typography>
              
              <TextField
                size="small"
                placeholder="Order ID"
                value={processOrderId}
                onChange={(e) => setProcessOrderId(e.target.value)}
                sx={{
                  width: 100,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                  },
                }}
                disabled={processing}
              />
              
              <Button
                variant="contained"
                size="small"
                onClick={handleProcessOrder}
                disabled={processing || !processOrderId.trim()}
                sx={{
                  minWidth: 'auto',
                  px: 2,
                  whiteSpace: 'nowrap',
                  backgroundColor: 'primary.dark',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                  },
                }}
              >
                Process to Filled
              </Button>
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
