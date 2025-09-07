import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { cashAPI } from '../utils/api';
import { formatCurrency } from '../theme/trading-theme';

const DepositWithdrawModal = () => {
  const {
    modals,
    toggleModal,
    userId,
    portfolio,
    refreshUserData,
    showSnackbar,
    setLoading,
  } = useApp();

  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const isOpen = modals.deposit || modals.withdraw;
  const isDeposit = modals.deposit;
  
  // Extraer disponible con la estructura correcta de la API
  const portfolioData = portfolio || {};
  const cashBalance = portfolioData.cashBalance || {};
  const availableCash = Number(cashBalance.available || 0);

  // Resetear formulario al cerrar
  const handleClose = () => {
    setAmount('');
    if (modals.deposit) toggleModal('deposit');
    if (modals.withdraw) toggleModal('withdraw');
  };

  // Validar monto
  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      return 'Ingresa un monto válido mayor a 0';
    }
    
    if (!isDeposit && numAmount > availableCash) {
      return `Fondos insuficientes. Disponible: ${formatCurrency(availableCash)}`;
    }
    
    return null;
  };

  // Procesar operación
  const handleSubmit = async () => {
    const error = validateAmount();
    if (error) {
      showSnackbar(error, 'error');
      return;
    }

    const numAmount = parseFloat(amount);
    setProcessing(true);

    try {
      let response;
      
      if (isDeposit) {
        response = await cashAPI.deposit(userId, numAmount);
        showSnackbar(`Depósito de ${formatCurrency(numAmount)} realizado exitosamente`, 'success');
      } else {
        response = await cashAPI.withdraw(userId, numAmount);
        showSnackbar(`Retiro de ${formatCurrency(numAmount)} realizado exitosamente`, 'success');
      }

      // Actualizar portfolio
      await refreshUserData();
      
      // Cerrar modal
      handleClose();
      
    } catch (error) {
      console.error('Error in cash operation:', error);
      showSnackbar(error.userMessage || 'Error en la operación', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Montos predefinidos
  const baseAmounts = [10000, 25000, 50000, 100000];
  
  // Para retiros, filtrar montos que no excedan el disponible y agregar "Todo disponible"
  let quickAmounts = isDeposit 
    ? baseAmounts 
    : baseAmounts.filter(amount => amount <= availableCash);
    
  // Para retiros, agregar opción "Todo disponible" si hay cash disponible
  if (!isDeposit && availableCash > 0 && !quickAmounts.includes(availableCash)) {
    // Redondear hacia abajo al múltiplo de 1000 más cercano para que se vea limpio
    const roundedAvailable = Math.floor(availableCash / 1000) * 1000;
    if (roundedAvailable > 0 && !quickAmounts.includes(roundedAvailable)) {
      quickAmounts.push(roundedAvailable);
    }
    // También agregar el monto exacto si es significativamente diferente
    if (availableCash - roundedAvailable > 1000) {
      quickAmounts.push(Math.floor(availableCash));
    }
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isDeposit ? (
            <Add sx={{ color: 'success.main' }} />
          ) : (
            <Remove sx={{ color: 'error.main' }} />
          )}
          <Typography variant="h6" component="h2">
            {isDeposit ? 'Depositar Dinero' : 'Retirar Dinero'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {isDeposit 
            ? 'Agregar fondos a tu cuenta de trading'
            : `Retirar fondos de tu cuenta (Disponible: ${formatCurrency(availableCash)})`
          }
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Campo de monto */}
        <TextField
          fullWidth
          label="Monto"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Typography variant="body2" color="text.secondary">
                  $
                </Typography>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
          disabled={processing}
          helperText={
            !isDeposit 
              ? `Máximo disponible: ${formatCurrency(availableCash)}`
              : 'Ingresa el monto que deseas depositar'
          }
        />

        {/* Montos rápidos */}
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Montos frecuentes:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {quickAmounts.map((quickAmount) => (
              <Button
                key={quickAmount}
                variant="outlined"
                size="small"
                onClick={() => setAmount(quickAmount.toString())}
                disabled={processing}
                sx={{
                  minWidth: 'auto',
                  px: 2,
                }}
              >
                {formatCurrency(quickAmount)}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Información adicional */}
        {!isDeposit && (
          <Box 
            sx={{ 
              mt: 3, 
              p: 2, 
              backgroundColor: 'warning.light', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'warning.main',
            }}
          >
            <Typography variant="body2" color="warning.dark">
              ⚠️ Los retiros se procesan inmediatamente y no se pueden revertir.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={handleClose}
          disabled={processing}
          sx={{ mr: 1 }}
        >
          Cancelar
        </Button>
        
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={processing || !amount || parseFloat(amount) <= 0}
          sx={{
            backgroundColor: isDeposit ? 'success.main' : 'error.main',
            '&:hover': {
              backgroundColor: isDeposit ? 'success.dark' : 'error.dark',
            },
          }}
        >
          {processing 
            ? 'Procesando...' 
            : `${isDeposit ? 'Depositar' : 'Retirar'} ${amount ? formatCurrency(parseFloat(amount)) : ''}`
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DepositWithdrawModal;
