import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { portfolioAPI, ordersAPI, instrumentsAPI } from '../utils/api';

// Estado inicial
const initialState = {
  // Usuario seleccionado
  userId: 1,
  
  // Estados de carga
  loading: {
    global: false,
    portfolio: false,
    orders: false,
    cash: false,
    trading: false,
  },
  
  // Datos principales
  portfolio: null,
  orders: [],
  allOrdersStats: { total: 0, filled: 0, pending: 0, cancelled: 0, rejected: 0 }, // Para estadísticas
  instruments: [],
  
  // Filtros
  ordersFilter: 'ALL', // 'ALL', 'NEW', 'FILLED', 'CANCELLED', 'REJECTED' // Cache de instrumentos
  
  // Estados de UI
  error: null,
  snackbar: {
    open: false,
    message: '',
    severity: 'info', // 'success' | 'error' | 'warning' | 'info'
  },
  
  // Modales
  modals: {
    deposit: false,
    withdraw: false,
    trading: false,
  },
  
  // Datos adicionales para modales
  modalData: {
    deposit: {},
    withdraw: {},
    trading: {},
  },
};

// Tipos de acciones
const ActionTypes = {
  // Usuario
  SET_USER_ID: 'SET_USER_ID',
  
  // Loading states
  SET_LOADING: 'SET_LOADING',
  SET_GLOBAL_LOADING: 'SET_GLOBAL_LOADING',
  
  // Datos
  SET_PORTFOLIO: 'SET_PORTFOLIO',
  SET_ORDERS: 'SET_ORDERS',
  SET_ALL_ORDERS_STATS: 'SET_ALL_ORDERS_STATS',
  SET_INSTRUMENTS: 'SET_INSTRUMENTS',
  SET_ORDERS_FILTER: 'SET_ORDERS_FILTER',
  
  // UI
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SHOW_SNACKBAR: 'SHOW_SNACKBAR',
  HIDE_SNACKBAR: 'HIDE_SNACKBAR',
  
  // Modales
  TOGGLE_MODAL: 'TOGGLE_MODAL',
  
  // Reset
  RESET_STATE: 'RESET_STATE',
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_USER_ID:
      return {
        ...state,
        userId: action.payload,
        // Limpiar datos del usuario anterior
        portfolio: null,
        orders: [],
      };

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      };

    case ActionTypes.SET_GLOBAL_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          global: action.payload,
        },
      };

    case ActionTypes.SET_PORTFOLIO:
      return {
        ...state,
        portfolio: action.payload,
      };

    case ActionTypes.SET_ORDERS:
      return {
        ...state,
        orders: action.payload,
      };

    case ActionTypes.SET_ALL_ORDERS_STATS:
      return {
        ...state,
        allOrdersStats: action.payload,
      };

    case ActionTypes.SET_INSTRUMENTS:
      return {
        ...state,
        instruments: action.payload,
      };

    case ActionTypes.SET_ORDERS_FILTER:
      return {
        ...state,
        ordersFilter: action.payload,
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case ActionTypes.SHOW_SNACKBAR:
      return {
        ...state,
        snackbar: {
          open: true,
          message: action.payload.message,
          severity: action.payload.severity || 'info',
        },
      };

    case ActionTypes.HIDE_SNACKBAR:
      return {
        ...state,
        snackbar: {
          ...state.snackbar,
          open: false,
        },
      };

    case ActionTypes.TOGGLE_MODAL:
      const { modalName, modalData } = typeof action.payload === 'string' 
        ? { modalName: action.payload, modalData: {} }
        : action.payload;
      
      const isOpening = !state.modals[modalName];
      
      return {
        ...state,
        modals: {
          ...state.modals,
          [modalName]: isOpening,
        },
        modalData: {
          ...state.modalData,
          [modalName]: isOpening ? modalData : {}, // Limpiar modalData al cerrar
        },
      };

    case ActionTypes.RESET_STATE:
      return {
        ...initialState,
        userId: state.userId, // Mantener el userId
      };

    default:
      return state;
  }
};

// Contexto
const AppContext = createContext();

// Provider
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // ==========================================================================
  // ACCIONES DE USUARIO
  // ==========================================================================

  const setUserId = useCallback((userId) => {
    dispatch({ type: ActionTypes.SET_USER_ID, payload: userId });
  }, []);

  // ==========================================================================
  // ACCIONES DE LOADING
  // ==========================================================================

  const setLoading = useCallback((key, value) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: { key, value } });
  }, []);

  const setGlobalLoading = useCallback((value) => {
    dispatch({ type: ActionTypes.SET_GLOBAL_LOADING, payload: value });
  }, []);

  // ==========================================================================
  // ACCIONES DE UI (moved here to avoid reference errors)
  // ==========================================================================

  const showSnackbar = useCallback((message, severity = 'info') => {
    dispatch({
      type: ActionTypes.SHOW_SNACKBAR,
      payload: { message, severity },
    });
  }, []);

  const hideSnackbar = useCallback(() => {
    dispatch({ type: ActionTypes.HIDE_SNACKBAR });
  }, []);

  const toggleModal = useCallback((modalName, modalData = {}) => {
    dispatch({ type: ActionTypes.TOGGLE_MODAL, payload: { modalName, modalData } });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  }, []);

  // ==========================================================================
  // ACCIONES DE DATOS
  // ==========================================================================

  const fetchPortfolio = useCallback(async (userId = state.userId) => {
    try {
      setLoading('portfolio', true);
      setGlobalLoading(true);
      console.log('Fetching portfolio for user:', userId);
      
      const response = await portfolioAPI.getPortfolio(userId);
      console.log('Portfolio API response:', response);
      
      if (response.success) {
        console.log('Portfolio data received:', response.data);
        dispatch({ type: ActionTypes.SET_PORTFOLIO, payload: response.data });
      } else {
        throw new Error(response.error || 'Error al cargar portfolio');
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      showSnackbar(`Error al cargar el portfolio: ${error.userMessage || error.message}`, 'error');
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.userMessage || error.message });
      // En caso de error, establecer portfolio como null para mostrar estado de error
      dispatch({ type: ActionTypes.SET_PORTFOLIO, payload: null });
    } finally {
      setLoading('portfolio', false);
      setGlobalLoading(false);
    }
  }, [state.userId, setLoading, setGlobalLoading, showSnackbar]);

  const fetchOrders = useCallback(async (userId = state.userId, statusFilter = null) => {
    try {
      setLoading('orders', true);
      setGlobalLoading(true);
      console.log('Fetching orders for user:', userId, 'with filter:', statusFilter);
      
      // Preparar filtros para la API
      const filters = { limit: 200 };
      if (statusFilter && statusFilter !== 'ALL') {
        filters.status = statusFilter;
      }
      
      const response = await ordersAPI.getUserOrders(userId, filters);
      console.log('Orders API response:', response);
      
      if (response.success) {
        console.log('Orders data received:', response.data);
        // Verificar si response.data es un array o si tiene una propiedad que contiene las órdenes
        const ordersData = Array.isArray(response.data) ? response.data : 
                          response.data.orders ? response.data.orders : [];
        console.log('Processed orders data:', ordersData);
        dispatch({ type: ActionTypes.SET_ORDERS, payload: ordersData });
      } else {
        throw new Error(response.error || 'Error al cargar órdenes');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showSnackbar(`Error al cargar las órdenes: ${error.userMessage || error.message}`, 'error');
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.userMessage || error.message });
      // En caso de error, establecer orders como array vacío
      dispatch({ type: ActionTypes.SET_ORDERS, payload: [] });
    } finally {
      setLoading('orders', false);
      setGlobalLoading(false);
    }
  }, [state.userId, setLoading, setGlobalLoading, showSnackbar]);

  const cancelOrder = useCallback(async (orderId) => {
    try {
      setLoading('orders', true);
      showSnackbar('Cancelando orden...', 'info');
      
      const response = await ordersAPI.cancel(orderId, state.userId);
      
      if (response.success) {
        showSnackbar('Orden cancelada exitosamente', 'success');
        // Actualizar datos del usuario
        await Promise.all([
          fetchPortfolio(state.userId),
          fetchOrders(state.userId),
        ]);
      } else {
        throw new Error(response.error || 'Error al cancelar la orden');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      showSnackbar(`Error al cancelar la orden: ${error.userMessage || error.message}`, 'error');
    } finally {
      setLoading('orders', false);
    }
  }, [state.userId, setLoading, showSnackbar, fetchPortfolio, fetchOrders]);

  const refreshUserData = useCallback(async (userId = state.userId) => {
    try {
      await Promise.all([
        fetchPortfolio(userId),
        fetchOrders(userId, state.ordersFilter), // Usar el filtro actual
      ]);
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // Los errores ya se manejan en fetchPortfolio y fetchOrders
    }
  }, [fetchPortfolio, fetchOrders, state.userId, state.ordersFilter]);

  // Cambiar filtro de órdenes
  const setOrdersFilter = useCallback(async (filter) => {
    dispatch({ type: ActionTypes.SET_ORDERS_FILTER, payload: filter });
    
    try {
      // Si no es 'ALL', primero obtener las estadísticas completas
      if (filter !== 'ALL') {
        const allOrdersResponse = await ordersAPI.getUserOrders(state.userId, { limit: 200 });
        if (allOrdersResponse.success) {
          const allOrders = Array.isArray(allOrdersResponse.data) ? allOrdersResponse.data : 
                           allOrdersResponse.data.orders ? allOrdersResponse.data.orders : [];
          
          const stats = {
            total: allOrders.length,
            filled: allOrders.filter(order => order && order.status === 'FILLED').length,
            pending: allOrders.filter(order => order && order.status === 'NEW').length,
            cancelled: allOrders.filter(order => order && order.status === 'CANCELLED').length,
            rejected: allOrders.filter(order => order && order.status === 'REJECTED').length,
          };
          
          dispatch({ type: ActionTypes.SET_ALL_ORDERS_STATS, payload: stats });
        }
      }
      
      // Luego cargar las órdenes con el filtro específico
      await fetchOrders(state.userId, filter);
      
    } catch (error) {
      console.error('Error setting orders filter:', error);
      showSnackbar('Error al filtrar órdenes', 'error');
    }
  }, [fetchOrders, state.userId, showSnackbar]);

  // ==========================================================================
  // ACCIONES DE INSTRUMENTOS
  // ==========================================================================

  const fetchInstruments = useCallback(async () => {
    // Si ya tenemos instrumentos, no volver a cargar
    if (state.instruments.length > 0) {
      return state.instruments;
    }

    setLoading('trading', true);
    
    try {
      const response = await instrumentsAPI.search('acciones', 100);
      const instruments = response.data || response || [];
      
      dispatch({ type: ActionTypes.SET_INSTRUMENTS, payload: instruments });
      return instruments;
      
    } catch (error) {
      console.error('Error fetching instruments:', error);
      showSnackbar('Error al cargar instrumentos', 'error');
      return [];
    } finally {
      setLoading('trading', false);
    }
  }, [state.instruments.length, setLoading, showSnackbar]);

  // ==========================================================================
  // VALORES DEL CONTEXTO
  // ==========================================================================

  const contextValue = {
    // Estado
    ...state,
    
    // Acciones de usuario
    setUserId,
    
    // Acciones de loading
    setLoading,
    setGlobalLoading,
    
    // Acciones de datos
    fetchPortfolio,
    fetchOrders,
    fetchInstruments,
    cancelOrder,
    refreshUserData,
    setOrdersFilter,
    
    // Acciones de UI
    showSnackbar,
    hideSnackbar,
    toggleModal,
    clearError,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook personalizado
export const useApp = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useApp debe ser usado dentro de AppProvider');
  }
  
  return context;
};

export default AppContext;
