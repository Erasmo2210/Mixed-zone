import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, AppBar, Toolbar, CircularProgress } from '@mui/material';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Campi from './pages/Campi';
import Partite from './pages/Partite';

//Inizializzazione della homepage
const HomePlaceholder = () => {

    const { user } = useContext(AuthContext);  //prendiamo solo User dall'AuthContext
    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" color="primary" gutterBottom>⚽ Benvenuti su Mixed-Zone!</Typography>
            {user ? (
                <Alert severity="info">Sei loggato come <strong>{user.name}</strong> con il ruolo di <strong>{user.role}</strong>.</Alert>
            ) : (
                <Typography variant="body1">Effettua l'accesso o registrati per iniziare a prenotare campi e partecipare ai tornei.</Typography>
            )}
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
                <Typography variant="h6" component={Link} to="/" style={{ textDecoration: 'none', color: 'white' }}>
                    Mixed-Zone
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button component={Link} to="/" color="inherit">Home</Button>
                    <Button component={Link} to="/campi" color="inherit">Esplora Campi</Button>
                    <Button component={Link} to="/partite" color="inherit">Trova Partite</Button>
                    
                    {/* Cambio l'interfaccia in base allo stato utente */}
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
                <Route path="/" element={<HomePlaceholder />} />
                <Route path="/login" element={<Login animate={false} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/campi" element={<Campi />} /> 
                <Route path="/partite" element={<Partite />} />
            </Routes>
        </Router>
    );
}

export default App;