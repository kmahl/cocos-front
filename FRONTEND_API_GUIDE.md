# Frontend API Guide - Cocos Trading API

> Guía completa para desarrollar un frontend simple que consuma la API de trading. Incluye todos los endpoints necesarios, ejemplos de requests/responses y casos de uso comunes.

## 🎯 Objetivo

Esta documentación está diseñada para implementar un frontend simple que permita:

- **Ver portfolio del usuario** con posiciones y cash disponible
- **Depositar y retirar efectivo** de la cuenta
- **Buscar instrumentos** para operar
- **Comprar y vender acciones** con órdenes MARKET y LIMIT
- **Ver historial de órdenes** del usuario
- **Cancelar órdenes pendientes**
- **Procesar órdenes LIMIT** manualmente (simulador)

## 🚀 Base URL

```
local: http://localhost:3000/api
prod:  https://cocos-trading-api-production.up.railway.app/
```

---

## 📊 1. Portfolio del Usuario

### GET `/portfolio/:userId`

Obtiene el portfolio completo del usuario incluyendo valor total, cash disponible y todas las posiciones.

#### Request
```bash
GET /api/portfolio/1
```

#### Response
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "totalValue": 125750.50,
    "cashBalance": {
      "total": 50000.00,
      "available": 25000.00,
      "reserved": 25000.00
    },
    "positions": [
      {
        "instrument": {
          "id": 1,
          "ticker": "DYCA",
          "name": "Distribuidora YPF Costa Argentina S.A.",
          "type": "STOCK"
        },
        "quantity": 100,
        "averagePrice": 502.50,
        "totalInvested": 50250.00,
        "currentPrice": 507.50,
        "marketValue": 50750.00,
        "unrealizedPnl": 500.00,
        "performance": 0.995
      }
    ]
  }
}
```

#### Uso en Frontend
```javascript
async function getPortfolio(userId) {
  const response = await fetch(`/api/portfolio/${userId}`);
  const data = await response.json();
  
  if (data.success) {
    return data.data;
  }
  throw new Error(data.error);
}
```

---

## 💰 2. Operaciones de Efectivo

### 2.1 Depositar Dinero

#### POST `/cash/deposit`

Agrega efectivo a la cuenta del usuario.

#### Request
```bash
POST /api/cash/deposit
Content-Type: application/json

{
  "userId": 1,
  "amount": 50000
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": 123,
    "userId": 1,
    "instrumentId": 66,
    "side": "CASH_IN",
    "size": 50000,
    "price": 1,
    "type": "MARKET",
    "status": "FILLED",
    "datetime": "2025-09-06T10:30:00Z"
  }
}
```

### 2.2 Retirar Dinero

#### POST `/cash/withdraw`

Retira efectivo de la cuenta del usuario (validando fondos disponibles).

#### Request
```bash
POST /api/cash/withdraw
Content-Type: application/json

{
  "userId": 1,
  "amount": 25000
}
```

#### Response Exitoso
```json
{
  "success": true,
  "data": {
    "id": 124,
    "userId": 1,
    "instrumentId": 66,
    "side": "CASH_OUT",
    "size": 25000,
    "price": 1,
    "type": "MARKET",
    "status": "FILLED",
    "datetime": "2025-09-06T10:35:00Z"
  }
}
```

#### Response Error (Fondos Insuficientes)
```json
{
  "success": false,
  "error": "Insufficient cash balance for withdrawal",
  "message": "Available cash: $15000, Requested: $25000"
}
```

### 2.3 Consultar Balance

#### GET `/cash/balance/:userId`

Obtiene el balance de efectivo disponible del usuario.

#### Request
```bash
GET /api/cash/balance/1
```

#### Response
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "totalCash": 75000.50,
    "availableCash": 50000.50,
    "reservedCash": 25000.00
  }
}
```

#### Uso en Frontend
```javascript
async function depositCash(userId, amount) {
  const response = await fetch('/api/cash/deposit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, amount })
  });
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error);
  }
  return data.data;
}

async function withdrawCash(userId, amount) {
  const response = await fetch('/api/cash/withdraw', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, amount })
  });
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || data.error);
  }
  return data.data;
}
```

---

## 🔍 3. Búsqueda de Instrumentos

### GET `/instruments/search?q={query}`

Busca instrumentos por ticker o nombre de empresa.

#### Request
```bash
GET /api/instruments/search?q=DYCA
GET /api/instruments/search?q=molinos
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ticker": "DYCA",
      "name": "Distribuidora YPF Costa Argentina S.A.",
      "type": "STOCK",
      "currentPrice": 507.50,
      "previousClose": 502.50,
      "change": 5.00,
      "changePercent": 0.995
    },
    {
      "id": 15,
      "ticker": "DYCB",
      "name": "Distribuidora YPF Costa Bonaerense S.A.",
      "type": "STOCK",
      "currentPrice": 312.75,
      "previousClose": 310.00,
      "change": 2.75,
      "changePercent": 0.887
    }
  ]
}
```

#### Uso en Frontend
```javascript
async function searchInstruments(query) {
  const response = await fetch(`/api/instruments/search?q=${encodeURIComponent(query)}`);
  const data = await response.json();
  
  if (data.success) {
    return data.data;
  }
  throw new Error(data.error);
}
```

---

## 📈 4. Compra y Venta de Acciones

### POST `/orders`

Crea una nueva orden de compra o venta (MARKET o LIMIT).

#### Request - Orden MARKET (Compra)
```bash
POST /api/orders
Content-Type: application/json

{
  "instrumentId": 1,
  "userId": 1,
  "side": "BUY",
  "size": 10,
  "type": "MARKET"
}
```

#### Request - Orden LIMIT (Venta)
```bash
POST /api/orders
Content-Type: application/json

{
  "instrumentId": 1,
  "userId": 1,
  "side": "SELL",
  "size": 5,
  "price": 510.00,
  "type": "LIMIT"
}
```

#### Response - Orden MARKET (Ejecutada)
```json
{
  "success": true,
  "data": {
    "id": 125,
    "instrumentId": 1,
    "userId": 1,
    "side": "BUY",
    "size": 10,
    "price": 507.50,
    "type": "MARKET",
    "status": "FILLED",
    "datetime": "2025-09-06T11:00:00Z",
    "instrument": {
      "ticker": "DYCA",
      "name": "Distribuidora YPF Costa Argentina S.A."
    }
  }
}
```

#### Response - Orden LIMIT (Pendiente)
```json
{
  "success": true,
  "data": {
    "id": 126,
    "instrumentId": 1,
    "userId": 1,
    "side": "SELL",
    "size": 5,
    "price": 510.00,
    "type": "LIMIT",
    "status": "NEW",
    "datetime": "2025-09-06T11:05:00Z",
    "instrument": {
      "ticker": "DYCA",
      "name": "Distribuidora YPF Costa Argentina S.A."
    }
  }
}
```

#### Response Error (Fondos Insuficientes)
```json
{
  "success": false,
  "error": "Insufficient funds",
  "details": [
    {
      "field": "amount",
      "message": "Required cash: $5075.00, Available: $3000.00"
    }
  ]
}
```

#### Uso en Frontend
```javascript
async function createOrder(orderData) {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error);
  }
  return data.data;
}

// Ejemplo de uso
const marketBuyOrder = {
  instrumentId: 1,
  userId: 1,
  side: 'BUY',
  size: 10,
  type: 'MARKET'
};

const limitSellOrder = {
  instrumentId: 1,
  userId: 1,
  side: 'SELL',
  size: 5,
  price: 510.00,
  type: 'LIMIT'
};
```

---

## 📋 5. Historial de Órdenes

### GET `/orders/user/:userId`

Obtiene todas las órdenes del usuario (historial completo).

#### Request
```bash
GET /api/orders/user/1
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 125,
      "instrumentId": 1,
      "userId": 1,
      "side": "BUY",
      "size": 10,
      "price": 507.50,
      "type": "MARKET",
      "status": "FILLED",
      "datetime": "2025-09-06T11:00:00Z",
      "instrument": {
        "ticker": "DYCA",
        "name": "Distribuidora YPF Costa Argentina S.A."
      }
    },
    {
      "id": 126,
      "instrumentId": 1,
      "userId": 1,
      "side": "SELL",
      "size": 5,
      "price": 510.00,
      "type": "LIMIT",
      "status": "NEW",
      "datetime": "2025-09-06T11:05:00Z",
      "instrument": {
        "ticker": "DYCA",
        "name": "Distribuidora YPF Costa Argentina S.A."
      }
    }
  ]
}
```

#### Uso en Frontend
```javascript
async function getUserOrders(userId) {
  const response = await fetch(`/api/orders/user/${userId}`);
  const data = await response.json();
  
  if (data.success) {
    return data.data;
  }
  throw new Error(data.error);
}

// Filtrar órdenes por estado
function filterOrdersByStatus(orders, status) {
  return orders.filter(order => order.status === status);
}

const pendingOrders = filterOrdersByStatus(orders, 'NEW');
const filledOrders = filterOrdersByStatus(orders, 'FILLED');
```

---

## ❌ 6. Cancelar Órdenes

### PUT `/orders/:orderId/cancel`

Cancela una orden pendiente (solo órdenes con status 'NEW').

#### Request
```bash
PUT /api/orders/126/cancel
```

#### Response Exitoso
```json
{
  "success": true,
  "data": {
    "id": 126,
    "instrumentId": 1,
    "userId": 1,
    "side": "SELL",
    "size": 5,
    "price": 510.00,
    "type": "LIMIT",
    "status": "CANCELLED",
    "datetime": "2025-09-06T11:05:00Z",
    "cancelledAt": "2025-09-06T11:15:00Z",
    "instrument": {
      "ticker": "DYCA",
      "name": "Distribuidora YPF Costa Argentina S.A."
    }
  }
}
```

#### Response Error (Orden No Cancelable)
```json
{
  "success": false,
  "error": "Order cannot be cancelled",
  "message": "Only orders with status 'NEW' can be cancelled. Current status: 'FILLED'"
}
```

#### Uso en Frontend
```javascript
async function cancelOrder(orderId) {
  const response = await fetch(`/api/orders/${orderId}/cancel`, {
    method: 'PUT'
  });
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || data.error);
  }
  return data.data;
}
```

---

## 🔄 7. Simulador - Procesar Órdenes LIMIT

### POST `/order-processing/process/:orderId`

Simula la ejecución manual de una orden LIMIT pendiente (útil para testing y demo).

#### Request
```bash
POST /api/order-processing/process/126
```

#### Response - Orden Procesada
```json
{
  "success": true,
  "data": {
    "id": 126,
    "instrumentId": 1,
    "userId": 1,
    "side": "SELL",
    "size": 5,
    "price": 510.00,
    "type": "LIMIT",
    "status": "FILLED",
    "datetime": "2025-09-06T11:05:00Z",
    "filledAt": "2025-09-06T11:20:00Z",
    "instrument": {
      "ticker": "DYCA",
      "name": "Distribuidora YPF Costa Argentina S.A."
    }
  }
}
```

#### Response Error (Orden No Procesable)
```json
{
  "success": false,
  "error": "Order cannot be processed",
  "message": "Only LIMIT orders with status 'NEW' can be processed"
}
```

#### Uso en Frontend
```javascript
async function processOrder(orderId) {
  const response = await fetch(`/api/order-processing/process/${orderId}`, {
    method: 'POST'
  });
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || data.error);
  }
  return data.data;
}
```

---

## 🎨 Ejemplos de UI Components

### 1. Portfolio Dashboard
```javascript
function PortfolioDashboard({ userId }) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const data = await getPortfolio(userId);
        setPortfolio(data);
      } catch (error) {
        console.error('Error loading portfolio:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, [userId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="portfolio-dashboard">
      <h2>Portfolio Value: ${portfolio.totalValue.toFixed(2)}</h2>
      <p>Available Cash: ${portfolio.cashBalance.available.toFixed(2)}</p>
      
      <div className="positions">
        {portfolio.positions.map(position => (
          <div key={position.instrument.id} className="position-card">
            <h3>{position.instrument.ticker}</h3>
            <p>{position.instrument.name}</p>
            <p>Quantity: {position.quantity}</p>
            <p>Current Value: ${position.marketValue.toFixed(2)}</p>
            <p>P&L: ${position.unrealizedPnl.toFixed(2)} ({position.performance.toFixed(2)}%)</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2. Trading Form
```javascript
function TradingForm({ userId, onOrderCreated }) {
  const [formData, setFormData] = useState({
    instrumentId: '',
    side: 'BUY',
    size: '',
    type: 'MARKET',
    price: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const order = await createOrder({
        ...formData,
        userId,
        size: parseInt(formData.size),
        price: formData.type === 'LIMIT' ? parseFloat(formData.price) : undefined
      });
      
      onOrderCreated(order);
      alert(`Order ${order.status}: ${order.side} ${order.size} shares`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select value={formData.side} onChange={e => setFormData({...formData, side: e.target.value})}>
        <option value="BUY">Buy</option>
        <option value="SELL">Sell</option>
      </select>
      
      <input 
        type="number" 
        placeholder="Quantity"
        value={formData.size}
        onChange={e => setFormData({...formData, size: e.target.value})}
        required
      />
      
      <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
        <option value="MARKET">Market</option>
        <option value="LIMIT">Limit</option>
      </select>
      
      {formData.type === 'LIMIT' && (
        <input 
          type="number" 
          step="0.01"
          placeholder="Price"
          value={formData.price}
          onChange={e => setFormData({...formData, price: e.target.value})}
          required
        />
      )}
      
      <button type="submit">Place Order</button>
    </form>
  );
}
```

### 3. Cash Operations
```javascript
function CashOperations({ userId, onCashOperation }) {
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(null);

  const handleDeposit = async () => {
    try {
      await depositCash(userId, parseFloat(amount));
      onCashOperation();
      setAmount('');
      alert('Cash deposited successfully');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleWithdraw = async () => {
    try {
      await withdrawCash(userId, parseFloat(amount));
      onCashOperation();
      setAmount('');
      alert('Cash withdrawn successfully');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="cash-operations">
      <h3>Cash Operations</h3>
      {balance && <p>Available: ${balance.availableCash.toFixed(2)}</p>}
      
      <input 
        type="number" 
        placeholder="Amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      
      <button onClick={handleDeposit}>Deposit</button>
      <button onClick={handleWithdraw}>Withdraw</button>
    </div>
  );
}
```

---

## 🔧 Configuración Inicial

### 1. Verificar que la API esté corriendo
```bash
curl http://localhost:3000/api/health
```

Debe retornar:
```json
{
  "status": "ok",
  "timestamp": "2025-09-06T11:30:00Z"
}
```

### 2. Usuario de Testing
Para testing rápido, usa el `userId: 1` que debería existir en la base de datos.

### 3. CORS Configuration
Si usas el frontend en un puerto diferente (ej: React en 3001), asegúrate de que la API tenga CORS configurado.

---

## 🚀 Casos de Uso Comunes

### 1. Flujo Completo de Trading
```javascript
// 1. Ver portfolio inicial
const portfolio = await getPortfolio(1);

// 2. Buscar instrumento
const instruments = await searchInstruments('DYCA');
const dyca = instruments[0];

// 3. Crear orden de compra MARKET
const buyOrder = await createOrder({
  instrumentId: dyca.id,
  userId: 1,
  side: 'BUY',
  size: 10,
  type: 'MARKET'
});

// 4. Crear orden de venta LIMIT
const sellOrder = await createOrder({
  instrumentId: dyca.id,
  userId: 1,
  side: 'SELL',
  size: 5,
  price: 520.00,
  type: 'LIMIT'
});

// 5. Ver órdenes pendientes
const orders = await getUserOrders(1);
const pendingOrders = orders.filter(o => o.status === 'NEW');

// 6. Simular ejecución de orden LIMIT
if (pendingOrders.length > 0) {
  await processOrder(pendingOrders[0].id);
}
```

### 2. Gestión de Cash
```javascript
// 1. Verificar balance actual
const balance = await getCashBalance(1);

// 2. Depositar si es necesario
if (balance.availableCash < 50000) {
  await depositCash(1, 50000);
}

// 3. Hacer trading...

// 4. Retirar ganancias
await withdrawCash(1, 25000);
```

---

## ⚠️ Consideraciones Importantes

### 1. Manejo de Errores
Todos los endpoints pueden retornar errores. Siempre verifica `data.success` antes de procesar la respuesta.

### 2. Estados de Órdenes
- **NEW**: Orden LIMIT pendiente (se puede cancelar)
- **FILLED**: Orden ejecutada (no se puede modificar)
- **CANCELLED**: Orden cancelada por el usuario
- **REJECTED**: Orden rechazada por validaciones

### 3. Validaciones
- Las órdenes de compra validan cash disponible
- Las órdenes de venta validan acciones disponibles
- Los retiros de cash validan balance disponible

### 4. Precios
- Órdenes MARKET se ejecutan al precio actual del mercado
- Órdenes LIMIT requieren especificar precio
- Los precios siempre están en pesos argentinos (ARS)

---

## 🎯 Próximos Pasos

1. **Implementar UI básica** con los componentes de ejemplo
2. **Agregar real-time updates** para portfolio y órdenes
3. **Implementar charts** para visualizar performance
4. **Agregar notificaciones** para órdenes ejecutadas
5. **Optimizar UX** con loading states y mejor error handling

¡Con esta documentación tienes todo lo necesario para crear un frontend funcional para la API de trading! 🚀
