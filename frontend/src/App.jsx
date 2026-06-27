import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, AppBar, Toolbar, CircularProgress, Alert } from '@mui/material';
import { AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; //importo la protezione delle rotte
import Login from './pages/Login';
import Register from './pages/Register';
import Campi from './pages/Campi';
import Partite from './pages/Partite';
import Dashboard from './pages/Dashboard';
import Tornei from './pages/Tornei';
import Prenotazioni from './pages/Prenotazioni';

//Inizializzazione della homepage
const HomePlaceholder = () => {
    const { user } = useContext(AuthContext);
    console.log("Dati dell'utente loggato ricevuti dal Context:", user);
    return (
        <Container sx={{ mt: 8, mb: 8 }}>
            <Box sx={{ 
                textAlign: 'center', 
                mb: 6,
                p: { xs: 4, md: 6 },
                borderRadius: 4,
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                boxShadow: '0 10px 30px 0 rgba(2, 132, 199, 0.05)',
                border: '1px solid rgba(2, 132, 199, 0.08)'
            }}>
                <Typography variant="h3" component="h1" sx={{ 
                    fontWeight: 800, 
                    color: 'secondary.main', 
                    mb: 2,
                    background: 'linear-gradient(45deg, #0369a1 30%, #0284c7 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    ⚽ Mixed-Zone
                </Typography>
                <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 500, mb: 4, maxWidth: '650px', mx: 'auto', lineHeight: 1.6 }}>
                    Il tuo sport preferito, organizzato alla perfezione. Prenota i campi, unisciti alle partite e scala le classifiche dei tornei.
                </Typography>
                {user ? (
                    <Alert severity="success" sx={{ maxWidth: '500px', mx: 'auto', borderRadius: 2, justifyContent: 'center' }}>
                        Bentornato, <strong>{user.name}</strong>! Sei loggato come <strong>{user.role}</strong>.
                    </Alert>
                ) : (
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button component={Link} to="/login" variant="outlined" color="primary" size="large">Accedi</Button>
                        <Button component={Link} to="/register" variant="contained" color="primary" size="large">Registrati ora</Button>
                    </Box>
                )}
            </Box>
            
            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom color="primary.main">🏟️ Esplora Campi</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Scopri i centri sportivi affiliati, controlla le capienze e i prezzi orari, e prenota all'istante la tua fascia oraria preferita.
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ mt: 'auto', p: 2 }}>
                            <Button component={Link} to="/campi" variant="text" color="primary">Prenota un campo &rarr;</Button>
                        </CardActions>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom color="primary.main">⚡ Matchmaking Partite</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Ti manca qualche giocatore? Unisciti a partite già organizzate dalla community in tempo reale o creane una nuova.
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ mt: 'auto', p: 2 }}>
                            <Button component={Link} to="/partite" variant="text" color="primary">Trova partite &rarr;</Button>
                        </CardActions>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom color="primary.main">🏆 Tornei Ufficiali</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Iscrivi la tua squadra, segui i calendari delle partite e controlla la classifica aggiornata in tempo reale dai gestori.
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ mt: 'auto', p: 2 }}>
                            <Button component={Link} to="/tornei" variant="text" color="primary">Esplora tornei &rarr;</Button>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

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
                <Typography variant="h6" component={Link} to="/campi" style={{ textDecoration: 'none', color: 'white' }}>
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