import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AppProvider } from './contexts/AppContext';
import tradingTheme from './theme/trading-theme';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import DepositWithdrawModal from './components/DepositWithdrawModal';
import TradingModal from './components/TradingModal';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={tradingTheme}>
        <CssBaseline />
        <AppProvider>
          <Layout>
            <Dashboard />
            
            {/* Modales */}
            <DepositWithdrawModal />
            <TradingModal />
          </Layout>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
