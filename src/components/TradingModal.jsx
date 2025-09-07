import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Autocomplete,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  ShoppingCart,
  Sell,
  Search,
  TrendingUp,
  Numbers,
  AttachMoney,
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { ordersAPI, instrumentsAPI } from '../utils/api';
import { tradingColors, formatCurrency } from '../theme/trading-theme';

const TradingModal = () => {
  const {
    modals,
    modalData,
    toggleModal,
    userId,
    portfolio,
    instruments,
    fetchInstruments,
    refreshUserData,
    showSnackbar,
    setLoading,
  } = useApp();

  const isOpen = modals.trading;
  const tradingModalData = modalData?.trading || {};

  // Estado del formulario
  const [formData, setFormData] = useState({
    instrumentId: '',
    side: 'BUY', // BUY o SELL - se actualizará con useEffect
    type: 'MARKET', // MARKET o LIMIT
    amountType: 'quantity', // 'quantity' o 'amount'
    quantity: '',
    amount: '',
    price: '',
  });

  // Estado de instrumentos
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [instrumentMarketData, setInstrumentMarketData] = useState(null);
  const [loadingMarketData, setLoadingMarketData] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Extraer cash disponible
  const portfolioData = portfolio || {};
  const cashBalance = portfolioData.cashBalance || {};
  const availableCash = Number(cashBalance.available || 0);
  const positions = Array.isArray(portfolioData.positions) ? portfolioData.positions : [];

  // Filtrar instrumentos basado en el tipo de operación
  const getAvailableInstruments = () => {
    if (formData.side === 'SELL') {
      // Para SELL, solo mostrar instrumentos donde tenemos posiciones
      const positionInstrumentIds = positions.map(pos => pos.instrumentId).filter(Boolean);
      return instruments.filter(instrument => 
        positionInstrumentIds.includes(instrument.id)
      );
    } else {
      // Para BUY, mostrar todos los instrumentos
      return instruments;
    }
  };

  const availableInstruments = getAvailableInstruments();

  // Cargar instrumentos al abrir el modal y configurar side inicial
  useEffect(() => {
    if (isOpen) {
      fetchInstruments();
      
      // Configurar el side basado en los datos del modal
      const initialSide = tradingModalData.side || 'BUY';
      
      setFormData(prev => ({
        ...prev,
        side: initialSide
      }));
    }
  }, [isOpen, fetchInstruments, tradingModalData.side]);

  // Resetear instrumento seleccionado cuando cambia el tipo de operación (BUY/SELL)
  useEffect(() => {
    if (selectedInstrument) {
      // Recalcular instrumentos disponibles
      const newAvailableInstruments = formData.side === 'SELL' 
        ? instruments.filter(instrument => 
            positions.some(pos => pos.instrumentId === instrument.id)
          )
        : instruments;
      
      const isInstrumentStillAvailable = newAvailableInstruments.some(
        instrument => instrument.id === selectedInstrument.id
      );
      
      if (!isInstrumentStillAvailable) {
        setSelectedInstrument(null);
        setInstrumentMarketData(null);
        setFormData(prev => ({
          ...prev,
          instrumentId: ''
        }));
      }
    }
  }, [formData.side, selectedInstrument, instruments, positions]);

  // Resetear formulario al cerrar
  const handleClose = () => {
    setFormData({
      instrumentId: '',
      side: 'BUY', // Resetear a BUY por defecto
      type: 'MARKET',
      amountType: 'quantity',
      quantity: '',
      amount: '',
      price: '',
    });
    setSelectedInstrument(null);
    setInstrumentMarketData(null);
    toggleModal('trading');
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Manejar selección de instrumento
  const handleInstrumentChange = async (event, value) => {
    setSelectedInstrument(value);
    setInstrumentMarketData(null);
    setFormData(prev => ({
      ...prev,
      instrumentId: value?.id || ''
    }));

    // Cargar datos de mercado cuando se selecciona un instrumento
    if (value?.id) {
      setLoadingMarketData(true);
      try {
        const response = await instrumentsAPI.getMarketData(value.id, 'ACCIONES');
        
        // Procesar la respuesta para obtener el precio más reciente
        if (response.success && response.data && response.data.length > 0) {
          // Ordenar por fecha descendente para obtener el más reciente
          const sortedData = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
          const latestData = sortedData[0];
          
          // Crear objeto con el precio actual (close price del día más reciente)
          const marketData = {
            ...latestData,
            currentPrice: parseFloat(latestData.close),
            date: latestData.date,
            high: parseFloat(latestData.high),
            low: parseFloat(latestData.low),
            open: parseFloat(latestData.open),
            previousClose: parseFloat(latestData.previousClose),
          };
          
          setInstrumentMarketData(marketData);
        } else {
          throw new Error('No hay datos de mercado disponibles');
        }
      } catch (error) {
        console.error('Error loading market data:', error);
        showSnackbar('Error al cargar precio del instrumento', 'warning');
      } finally {
        setLoadingMarketData(false);
      }
    }
  };

  // Calcular valor estimado y cantidad
  const calculateEstimatedValues = () => {
    if (!selectedInstrument || !instrumentMarketData) return { estimatedValue: 0, estimatedQuantity: 0 };
    
    const currentPrice = instrumentMarketData.currentPrice || 0;
    const price = formData.type === 'LIMIT' 
      ? parseFloat(formData.price) || 0
      : currentPrice;
    
    if (formData.amountType === 'quantity') {
      const quantity = parseFloat(formData.quantity) || 0;
      return {
        estimatedValue: quantity * price,
        estimatedQuantity: quantity
      };
    } else {
      const amount = parseFloat(formData.amount) || 0;
      const quantity = price > 0 ? Math.floor(amount / price) : 0;
      return {
        estimatedValue: amount,
        estimatedQuantity: quantity
      };
    }
  };

  // Validar formulario
  const validateForm = () => {
    if (!selectedInstrument) {
      return 'Selecciona un instrumento';
    }
    
    if (!instrumentMarketData) {
      return 'Cargando datos del instrumento...';
    }
    
    const { estimatedValue, estimatedQuantity } = calculateEstimatedValues();
    
    if (formData.amountType === 'quantity') {
      const quantity = parseFloat(formData.quantity);
      if (!quantity || quantity <= 0) {
        return 'Ingresa una cantidad válida';
      }
    } else {
      const amount = parseFloat(formData.amount);
      if (!amount || amount <= 0) {
        return 'Ingresa un monto válido';
      }
      if (estimatedQuantity <= 0) {
        return 'El monto no es suficiente para comprar al menos 1 acción';
      }
    }
    
    if (formData.type === 'LIMIT') {
      const price = parseFloat(formData.price);
      if (!price || price <= 0) {
        return 'Ingresa un precio válido para orden LIMIT';
      }
    }
    
    // Validar cash disponible para BUY
    if (formData.side === 'BUY') {
      if (estimatedValue > availableCash) {
        return `Fondos insuficientes. Disponible: ${formatCurrency(availableCash)}`;
      }
    }
    
    // Validar cantidad disponible para SELL
    if (formData.side === 'SELL') {
      const position = positions.find(pos => pos.instrumentId === selectedInstrument.id);
      if (!position) {
        return 'No tienes posición en este instrumento';
      }
      
      const availableQuantity = position.quantity?.available || position.quantity?.total || 0;
      const quantityToSell = formData.amountType === 'quantity' 
        ? parseFloat(formData.quantity) || 0
        : estimatedQuantity;
      
      if (quantityToSell > availableQuantity) {
        return `Cantidad insuficiente. Disponible: ${availableQuantity} acciones`;
      }
    }
    
    return null;
  };

  // Enviar orden
  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      showSnackbar(error, 'error');
      return;
    }

    setProcessing(true);

    try {
      const orderData = {
        userId: parseInt(userId),
        instrumentId: selectedInstrument.id,
        side: formData.side,
        type: formData.type,
      };

      // Para cantidad: enviar la cantidad directamente
      // Para monto: enviar el monto, el backend calculará las acciones
      if (formData.amountType === 'quantity') {
        orderData.size = parseFloat(formData.quantity);
      } else {
        orderData.size = parseFloat(formData.amount);
      }

      // Agregar precio para órdenes LIMIT
      if (formData.type === 'LIMIT') {
        orderData.price = parseFloat(formData.price);
      }

      const response = await ordersAPI.create(orderData);
      
      showSnackbar(
        `Orden ${formData.side} de ${selectedInstrument.ticker} creada exitosamente`,
        'success'
      );

      // Actualizar datos
      await refreshUserData();
      
      // Cerrar modal
      handleClose();
      
    } catch (error) {
      console.error('Error creating order:', error);
      showSnackbar(error.userMessage || 'Error al crear la orden', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const { estimatedValue, estimatedQuantity } = calculateEstimatedValues();

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: 600,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {formData.side === 'BUY' ? (
            <ShoppingCart sx={{ color: tradingColors.buy, fontSize: 28 }} />
          ) : (
            <Sell sx={{ color: tradingColors.sell, fontSize: 28 }} />
          )}
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
              {formData.side === 'BUY' ? 'Comprar' : 'Vender'} Instrumento
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formData.side === 'BUY' 
                ? `Cash disponible: ${formatCurrency(availableCash)}`
                : `${positions.length} posiciones disponibles para vender`
              }
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Selector BUY/SELL */}
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Tipo de Operación
            </Typography>
            <ToggleButtonGroup
              value={formData.side}
              exclusive
              onChange={(e, value) => value && handleInputChange('side', value)}
              sx={{ width: '100%' }}
            >
              <ToggleButton 
                value="BUY" 
                sx={{ 
                  flex: 1,
                  fontWeight: 600,
                  '&.Mui-selected': {
                    backgroundColor: tradingColors.buyBackground,
                    color: tradingColors.buy,
                  }
                }}
              >
                <ShoppingCart sx={{ mr: 1 }} /> COMPRAR
              </ToggleButton>
              <ToggleButton 
                value="SELL" 
                sx={{ 
                  flex: 1,
                  fontWeight: 600,
                  '&.Mui-selected': {
                    backgroundColor: tradingColors.sellBackground,
                    color: tradingColors.sell,
                  }
                }}
              >
                <Sell sx={{ mr: 1 }} /> VENDER
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Selector de Instrumento */}
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Instrumento
            </Typography>
            <Autocomplete
              value={selectedInstrument}
              onChange={handleInstrumentChange}
              options={availableInstruments}
              getOptionLabel={(option) => `${option.ticker} - ${option.name}`}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={
                    formData.side === 'SELL' 
                      ? "Seleccionar instrumento a vender..." 
                      : "Buscar instrumento..."
                  }
                  helperText={
                    formData.side === 'SELL' && availableInstruments.length === 0
                      ? "No tienes posiciones para vender"
                      : formData.side === 'SELL'
                        ? `${availableInstruments.length} instrumentos disponibles para vender`
                        : undefined
                  }
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => {
                const position = formData.side === 'SELL' 
                  ? positions.find(pos => pos.instrumentId === option.id)
                  : null;
                
                return (
                  <Box component="li" {...props}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {option.ticker}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.name}
                      </Typography>
                      {position && (
                        <Typography variant="caption" sx={{ display: 'block', color: 'primary.main', fontWeight: 500 }}>
                          Disponible: {position.quantity?.available || position.quantity?.total || 0} acciones
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              }}
            />
          </Box>

          {/* Tipo de Orden */}
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Tipo de Orden
            </Typography>
            <ToggleButtonGroup
              value={formData.type}
              exclusive
              onChange={(e, value) => value && handleInputChange('type', value)}
              sx={{ width: '100%' }}
            >
              <ToggleButton value="MARKET" sx={{ flex: 1, fontWeight: 600 }}>
                MARKET
              </ToggleButton>
              <ToggleButton value="LIMIT" sx={{ flex: 1, fontWeight: 600 }}>
                LIMIT
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Cantidad o Monto */}
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Cantidad/Monto
            </Typography>
            <ToggleButtonGroup
              value={formData.amountType}
              exclusive
              onChange={(e, value) => value && handleInputChange('amountType', value)}
              size="small"
              sx={{ mb: 2 }}
            >
              <ToggleButton value="quantity">
                <Numbers sx={{ mr: 0.5, fontSize: 16 }} /> Cantidad
              </ToggleButton>
              <ToggleButton value="amount">
                <AttachMoney sx={{ mr: 0.5, fontSize: 16 }} /> Monto
              </ToggleButton>
            </ToggleButtonGroup>

            {formData.amountType === 'quantity' ? (
              <TextField
                fullWidth
                label="Cantidad de acciones"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="0"
                disabled={processing}
              />
            ) : (
              <TextField
                fullWidth
                label="Monto a invertir"
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
                disabled={processing}
              />
            )}
          </Box>

          {/* Precio (solo para LIMIT) */}
          {formData.type === 'LIMIT' && (
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                Precio Límite
              </Typography>
              <TextField
                fullWidth
                label="Precio por acción"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="0.00"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
                disabled={processing}
                helperText={
                  loadingMarketData 
                    ? 'Cargando precio actual...'
                    : instrumentMarketData 
                      ? `Precio actual: ${formatCurrency(instrumentMarketData.currentPrice || 0)} (${new Date(instrumentMarketData.date).toLocaleDateString()})`
                      : selectedInstrument 
                        ? 'Selecciona un instrumento para ver el precio'
                        : ''
                }
              />
            </Box>
          )}

          {/* Resumen de la orden */}
          {selectedInstrument && (formData.quantity || formData.amount) && instrumentMarketData && (
            <Box sx={{ 
              p: 2, 
              backgroundColor: 'grey.50', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                Resumen de la Orden
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Instrumento:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {selectedInstrument.ticker}
                </Typography>
              </Box>
              
              {/* Mostrar cantidad estimada cuando se usa monto */}
              {formData.amountType === 'amount' && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Cantidad estimada:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {calculateEstimatedValues().estimatedQuantity} acciones
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {formData.amountType === 'quantity' ? 'Cantidad:' : 'Monto a invertir:'}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formData.amountType === 'quantity' 
                    ? `${formData.quantity} acciones`
                    : formatCurrency(parseFloat(formData.amount) || 0)
                  }
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Precio:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatCurrency(
                    formData.type === 'LIMIT' 
                      ? parseFloat(formData.price) || 0
                      : instrumentMarketData.currentPrice || 0
                  )}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" fontWeight={600}>
                  Valor Total:
                </Typography>
                <Typography 
                  variant="body1" 
                  fontWeight={700}
                  sx={{ 
                    color: formData.side === 'BUY' 
                      ? tradingColors.buy 
                      : tradingColors.sell 
                  }}
                >
                  {formatCurrency(calculateEstimatedValues().estimatedValue)}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
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
          disabled={processing || !selectedInstrument || (!formData.quantity && !formData.amount)}
          sx={{
            backgroundColor: formData.side === 'BUY' 
              ? tradingColors.buy 
              : tradingColors.sell,
            fontWeight: 600,
            minWidth: 120,
            '&:hover': {
              backgroundColor: formData.side === 'BUY' 
                ? tradingColors.positive 
                : tradingColors.negative,
            },
          }}
        >
          {processing 
            ? 'Procesando...' 
            : `${formData.side === 'BUY' ? 'Comprar' : 'Vender'} ${
                estimatedValue > 0 ? formatCurrency(estimatedValue) : ''
              }`
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TradingModal;
