import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, AppBar, Toolbar, CircularProgress } from '@mui/material';
import { AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; //importo la protezione delle rotte
import Login from './pages/Login';
import Register from './pages/Register';
import Campi from './pages/Campi';
import Partite from './pages/Partite';
import Dashboard from './pages/Dashboard';
import Tornei from './pages/Tornei';
import Prenotazioni from './pages/Prenotazioni';

const NavigationBar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const eventoLogout = () => {
        logout();
        navigate('/login');
    };
    return (
        <AppBar position="static" color="secondary">
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" component={Link} to="/campi" sx={{ textDecoration: 'none', color: 'white' }}>
                    Mixed-Zone
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button component={Link} to="/campi" color="inherit">Home</Button>
                    {user && (user.role === 'Gestore' || user.role === 'Admin') ? null : (
                        <Button component={Link} to="/partite" color="inherit">Matchmaking</Button>
                    )}
                    {user && user.role === 'Cliente' ? (
                        <Button component={Link} to="/prenotazioni" color="inherit">Prenotazioni</Button>
                    ) : null}
                    {user?.role !== 'Admin' && (
                        <Button component={Link} to="/tornei" color="inherit">Tornei</Button>
                    )}

                    {/* Cambio l'interfaccia in base allo stato utente */}
                    {user && (user.role === 'Gestore' || user.role === 'Admin') ? (   //&& serve per controllare se user esiste
                        <Button component={Link} to="/dashboard" variant="contained" color="primary">
                            Dashboard
                        </Button>
                    ) : null}
                    {user ? (
                        <>
                            <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.8 }}>
                                Ciao, {user.name} ({user.role})
                            </Typography>
                            <Button onClick={eventoLogout} variant="outlined" color="inherit">Esci</Button>
                        </>
                    ) : (
                        <>
                            <Button component={Link} to="/login" color="inherit">Accedi</Button>
                            <Button component={Link} to="/register" variant="contained" color="primary">Registrati</Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

function App() {
    const { loading } = useContext(AuthContext);

    //Se l'applicazione sta controllando il localStorage al boot, mostro una rotella di caricamento
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Router>
            <NavigationBar />
            <Routes>
                <Route path="/" element={<Navigate to="/campi" replace />} />
                <Route path="/login" element={<Login animate={false} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/campi" element={<Campi />} />
                <Route path="/partite" element={<Partite />} />
                <Route path="/prenotazioni" element={
                    <ProtectedRoute allowedRoles={['Cliente']}>
                        <Prenotazioni />
                    </ProtectedRoute>
                } />
                <Route path="/tornei" element={<Tornei />} />
                <Route path="/dashboard" element={
                    <ProtectedRoute allowedRoles={['Gestore', 'Admin']}>     {/* Route protetta da ProtectedRoute */}
                        <Dashboard />
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}

export default App;
