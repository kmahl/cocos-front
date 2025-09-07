import React from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';
import { useApp } from '../contexts/AppContext';

const ErrorSnackbar = () => {
  const { snackbar, hideSnackbar } = useApp();

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    hideSnackbar();
  };

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      sx={{
        '& .MuiSnackbarContent-root': {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
      }}
    >
      <Alert
        onClose={handleClose}
        severity={snackbar.severity}
        variant="filled"
        sx={{
          width: '100%',
          maxWidth: 600,
          fontSize: '0.875rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};

export default ErrorSnackbar;
