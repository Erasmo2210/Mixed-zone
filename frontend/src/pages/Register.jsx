import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, CardContent, TextField, Button, Typography, Alert, Box, MenuItem } from '@mui/material';

export default function Register() {

    const { register } = useContext(AuthContext); //utilizza register da AuthContext
    const navigate = useNavigate();  // Per il reindirizzamento dinamico delle rotte

    //inizializzazione degli stati dei campi
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Cliente'); 
    const [errore, setErrore] = useState('');
    const [successo, setSuccesso] = useState(false);

    async function evitaRicaricamento(event) {
        event.preventDefault(); //prevengo il comportamento di default del form
        setErrore(""); 

        try {

            //effettuo la registrazione
            await register(name, email, password, role);
            setSuccesso(true);
            setTimeout(function() {
                navigate('/login');    //rendirizza alla login dopo 2 sec
            }, 2000);
        } catch (err) {
            setErrore(err.message);
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 6 }}>
            <Card elevation={4}>
                <CardContent>
                    <Typography variant="h5" align="center" gutterBottom fontWeight="bold" color="secondary.main">
                        Crea un Account
                    </Typography>

                    {errore && <Alert severity="error" sx={{ mb: 2 }}>{errore}</Alert>}   {/*sono degliIF: mostro box errore rosso o verde in base al risultato*/}

                    {successo && <Alert severity="success" sx={{ mb: 2 }}>Registrazione completata! Verrai reindirizzato al login...</Alert>}  

                    <Box component="form" onSubmit={evitaRicaricamento} noValidate>
                        <TextField margin="normal" required fullWidth label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
                        <TextField margin="normal" required fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <TextField margin="normal" required fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        
                        <TextField
                            select
                            margin="normal"
                            fullWidth
                            label="Tipo di utente"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <MenuItem value="Cliente">Cliente (Giocatore)</MenuItem>
                            <MenuItem value="Gestore">Gestore di campi sportivi</MenuItem>
                        </TextField>

                        {/* Bottone di conferma */}
                        <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2, py: 1.5 }}>
                            Registrati
                        </Button>

                        {/* Link per andare alla login */}
                        <Typography variant="body2" align="center">
                            Hai già un account? <Link to="/login" style={{ color: '#0284c7', fontWeight: 'bold' }}>Accedi</Link>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
}