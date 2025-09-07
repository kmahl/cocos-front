import axios from 'axios';

// Configuración base de la API
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
};

// Cliente HTTP configurado
const apiClient = axios.create(API_CONFIG);

// Interceptor para requests
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message);
    
    // Manejo centralizado de errores
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Error de conexión';
    
    return Promise.reject({
      ...error,
      userMessage: errorMessage,
      status: error.response?.status,
    });
  }
);

// =============================================================================
// PORTFOLIO
// =============================================================================

export const portfolioAPI = {
  /**
   * Obtiene el portfolio completo del usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise} Portfolio data
   */
  getPortfolio: async (userId) => {
    const response = await apiClient.get(`/portfolio/${userId}`);
    return response.data;
  },
};

// =============================================================================
// CASH OPERATIONS
// =============================================================================

export const cashAPI = {
  /**
   * Deposita efectivo en la cuenta del usuario
   * @param {number} userId - ID del usuario
   * @param {number} amount - Monto a depositar
   * @returns {Promise} Transaction data
   */
  deposit: async (userId, amount) => {
    const response = await apiClient.post('/cash/deposit', {
      userId,
      amount,
    });
    return response.data;
  },

  /**
   * Retira efectivo de la cuenta del usuario
   * @param {number} userId - ID del usuario
   * @param {number} amount - Monto a retirar
   * @returns {Promise} Transaction data
   */
  withdraw: async (userId, amount) => {
    const response = await apiClient.post('/cash/withdraw', {
      userId,
      amount,
    });
    return response.data;
  },

  /**
   * Obtiene el balance de efectivo del usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise} Cash balance data
   */
  getBalance: async (userId) => {
    const response = await apiClient.get(`/cash/balance/${userId}`);
    return response.data;
  },
};

// =============================================================================
// INSTRUMENTS
// =============================================================================

export const instrumentsAPI = {
  /**
   * Busca instrumentos por query
   * @param {string} query - Término de búsqueda
   * @param {number} limit - Límite de resultados (default: 100)
   * @returns {Promise} Array de instrumentos
   */
  search: async (query, limit = 100) => {
    const response = await apiClient.get('/instruments/search', {
      params: { q: query, limit },
    });
    return response.data;
  },

  /**
   * Obtiene un instrumento por ID
   * @param {number} instrumentId - ID del instrumento
   * @returns {Promise} Instrument data
   */
  getById: async (instrumentId) => {
    const response = await apiClient.get(`/instruments/${instrumentId}`);
    return response.data;
  },

  /**
   * Obtiene datos de mercado de un instrumento
   * @param {number} instrumentId - ID del instrumento
   * @param {string} type - Tipo de instrumento (default: ACCIONES)
   * @returns {Promise} Market data
   */
  getMarketData: async (instrumentId, type = 'ACCIONES') => {
    const response = await apiClient.get(`/instruments/${instrumentId}/market-data`, {
      params: { type },
    });
    return response.data;
  },
};

// =============================================================================
// ORDERS
// =============================================================================

export const ordersAPI = {
  /**
   * Crea una nueva orden
   * @param {Object} orderData - Datos de la orden
   * @returns {Promise} Order data
   */
  create: async (orderData) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  /**
   * Obtiene las órdenes de un usuario
   * @param {number} userId - ID del usuario
   * @param {Object} filters - Filtros opcionales (status, limit)
   * @returns {Promise} Array de órdenes
   */
  getUserOrders: async (userId, filters = {}) => {
    const response = await apiClient.get(`/orders/user/${userId}`, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Obtiene una orden por ID
   * @param {number} orderId - ID de la orden
   * @returns {Promise} Order data
   */
  getById: async (orderId) => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Cancela una orden
   * @param {number} orderId - ID de la orden
   * @param {number} userId - ID del usuario
   * @returns {Promise} Cancelled order data
   */
  cancel: async (orderId, userId) => {
    const response = await apiClient.put(`/orders/${orderId}/cancel`, {
      userId,
    });
    return response.data;
  },
};

// =============================================================================
// ORDER PROCESSING (Simulador)
// =============================================================================

export const orderProcessingAPI = {
  /**
   * Procesa una orden LIMIT manualmente
   * @param {number} orderId - ID de la orden
   * @returns {Promise} Processed order data
   */
  processOrder: async (orderId) => {
    const response = await apiClient.post(`/order-processing/process/${orderId}`);
    return response.data;
  },

  /**
   * Obtiene órdenes pendientes
   * @param {number} limit - Límite de resultados
   * @returns {Promise} Array de órdenes pendientes
   */
  getPendingOrders: async (limit = 10) => {
    const response = await apiClient.get('/order-processing/pending', {
      params: { limit },
    });
    return response.data;
  },
};

// =============================================================================
// HEALTH CHECK
// =============================================================================

export const healthAPI = {
  /**
   * Verifica el estado de la API
   * @returns {Promise} Health status
   */
  check: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

// =============================================================================
// UTILIDADES
// =============================================================================

/**
 * Maneja errores de la API de forma consistente
 * @param {Error} error - Error de la API
 * @returns {string} Mensaje de error formateado
 */
export const handleAPIError = (error) => {
  if (error.userMessage) {
    return error.userMessage;
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  return 'Error de conexión. Por favor, intenta nuevamente.';
};

/**
 * Verifica si un error es de fondos insuficientes
 * @param {Error} error - Error de la API
 * @returns {boolean}
 */
export const isInsufficientFundsError = (error) => {
  const message = error.userMessage || error.response?.data?.message || '';
  return message.toLowerCase().includes('insufficient');
};

/**
 * Verifica si un error es de validación
 * @param {Error} error - Error de la API
 * @returns {boolean}
 */
export const isValidationError = (error) => {
  return error.status === 400;
};

export default apiClient;
