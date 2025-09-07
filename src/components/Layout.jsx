import React from 'react';
import { Box, Container, CircularProgress, Backdrop } from '@mui/material';
import { useApp } from '../contexts/AppContext';
import Header from './Header';
import ErrorSnackbar from './ErrorSnackbar';

const Layout = ({ children }) => {
    const { loading } = useApp();

    return (
        <Box
            sx={{
                height: '100vh',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#b9d4d0', // Fondo verde claro en toda la app
                overflow: 'auto',
                justifyContent: 'center',
            }}
        >
            {/* Header - Altura fija */}
            <Box sx={{ flexShrink: 0 }}>
                <Header />
            </Box>

            {/* Global Loading Spinner */}
            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    backgroundColor: 'rgba(185, 212, 208, 0.9)', // Fondo verde semitransparente
                }}
                open={loading.global}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <CircularProgress
                        color="primary"
                        size={80}
                        thickness={4}
                    />
                    <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'primary.main',
                            mb: 1
                        }}>
                            Cargando...
                        </Box>
                        <Box sx={{
                            fontSize: '1rem',
                            color: 'text.secondary'
                        }}>
                            Por favor espera un momento
                        </Box>
                    </Box>
                </Box>
            </Backdrop>

            {/* Main Content - Toma el resto del espacio */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto',
                }}
            >
                <Container
                    maxWidth="xl"
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        p: 0,
                        height: '100%',
                    }}
                >
                    {children}
                </Container>
            </Box>

            {/* Error Snackbar */}
            <ErrorSnackbar />
        </Box>
    );
};

export default Layout;
