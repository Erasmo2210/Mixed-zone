import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, CardContent, TextField, Button, Typography, Alert, Box } from '@mui/material';

export default function Login() {
    
    const { login } = useContext(AuthContext);  //utilizza login da AuthContext
    const navigate = useNavigate(); //chiamando navigate useremo la funzione Maps('/endpoint') per reindirizzamenti dinamici 

    //inizializzazione degli stati dei campi
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errore, setErrore] = useState('');

    async function evitaRicaricamento(event) {
        event.preventDefault(); //prevengo il comportamento di default del form
        setErrore(""); 

        try {
            
            //effettuo il login
            const utenteLoggato = await login(email, password);
            
            if (utenteLoggato.role === 'Admin') navigate('/dashboard');
            else if (utenteLoggato.role === 'Gestore') navigate('/dashboard');    
            else navigate('/campi');
        } catch (err) {
            setErrore(err.message);
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Card elevation={4}>
                <CardContent>
                    <Typography variant="h5" align="center" gutterBottom fontWeight="bold" color="secondary.main">
                        Accedi a Mixed-Zone
                    </Typography>

                    {errore && <Alert severity="error" sx={{ mb: 2 }}>{errore}</Alert>} {/*è un IF: mostro box errore rosso se la variabile errore contiene testo (true) */}

                    <Box component="form" onSubmit={evitaRicaricamento} noValidate>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Indirizzo Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} //catturo il testo digitato e lo salvo nello stato email
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} //catturo il testo digitato e lo salvo nello stato password
                        />
                        {/* Bottone di accesso */}
                        <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2, py: 1.5 }}>
                            Entra   
                        </Button>

                        {/* Link di registrazione */}
                        <Typography variant="body2" align="center">
                            Non hai un account? <Link to="/register" style={{ color: '#0284c7', fontWeight: 'bold' }}>Registrati qui</Link>  {/*Link di React Router che porta all'endpoint di registrazion*/}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
}