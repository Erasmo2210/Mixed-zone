import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { Container, Typography, Box, Grid, Card, CardContent, TextField, Button, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider, MenuItem } from '@mui/material';

export default function Dashboard() {
    const { user } = useContext(AuthContext); //recupero le informazioni dell' user loggato 

    //inizializzazione degli stati dei campi
    const [campi, setCampi] = useState([]);
    const [errore, setErrore] = useState('');
    const [successo, setSuccesso] = useState('');
    const [nomeCampo, setNomeCampo] = useState('');
    const [indirizzo, setIndirizzo] = useState('');
    const [tipologia, setTipologia] = useState('5vs5');
    const [prezzo, setPrezzo] = useState('');


    const caricaDatiDashboard = async () => {
        try {
            const dati = await apiFetch('/campi');
            setCampi(dati);
        } catch (err) {
            setErrore('Impossibile caricare i dati gestionali.');
        }
    };

    //useEffect si applica qui ogni volta che cambia lo stato dell'user loggato eseguendo la funzione sopra
    useEffect(() => {
        caricaDatiDashboard();
    }, [user]);


    //Creazione campo
    const CreaCampo = async (event) => {
        event.preventDefault();  //prevengo il comportamento di default del browser
        setErrore('');
        setSuccesso('');

        if (!nomeCampo || !prezzo) {
            setErrore('Compila tutti i campi richiesti.');
            return;
        }

        try {
            await apiFetch('/campi', {
                method: 'POST',
                body: JSON.stringify({ nome: nomeCampo, capienza: tipologia, prezzoAllOra: Number(prezzo), posizione: indirizzo, })
            });
            setSuccesso('Nuovo campo inserito con successo nel sistema');
            setNomeCampo('');
            setPrezzo('');
            setTipologia('');
            setIndirizzo('');
            caricaDatiDashboard(); //chiamo la funzione per ricaricare
        } catch (err) {
            setErrore(err.message);
        }
    };

    //Visualizza o oscura campo
    const CambioVisibilita = async (campoId, statoAttuale) => {
        try {
            setErrore('');

            const isAdmin = user.role === 'Admin';  //controllo chi sta oscurando o riattivando
            const nuovoStatoVisibile = !statoAttuale;

            const datiDaInviare = {
                isVisibile: nuovoStatoVisibile
            };

            if (isAdmin) {
                datiDaInviare.oscuratoDaAdmin = !nuovoStatoVisibile;
            }

            await apiFetch(`/admin/campi/${campoId}/oscura`, {
                method: 'PUT',
                body: JSON.stringify(datiDaInviare)
            });
            setSuccesso('Stato del campo aggiornato correttamente.');
            caricaDatiDashboard(); //chiamo la funzione per ricaricare
        } catch (err) {
            setErrore('Errore durante la modifica dello stato del campo.');
        }
    };

    return (
        <Container sx={{ mt: 4, mb: 4 }}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" color="secondary.main">
                    Pannello di Controllo 🎛️
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Benvenuto nella console di Mixed-Zone. Ruolo: <strong>{user?.role}</strong>
                </Typography>
            </Box>

            {errore && <Alert severity="error" sx={{ mb: 3 }}>{errore}</Alert>}
            {successo && <Alert severity="success" sx={{ mb: 3 }}>{successo}</Alert>}

            <Grid container spacing={4}>
                {/* Interfaccia per il gestore */}
                {user?.role === 'Gestore' && (
                    <Grid item xs={12} md={4}>
                        <Card elevation={3}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" gutterBottom color="primary.main">
                                    Aggiungi un nuovo campo
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Box component="form" onSubmit={CreaCampo} noValidate>
                                    <TextField
                                        margin="normal" fullWidth required label="Nome campo"
                                        value={nomeCampo} onChange={(e) => setNomeCampo(e.target.value)}
                                    />
                                    <TextField
                                        select margin="normal" fullWidth required label="Grandezza campo"
                                        value={tipologia} onChange={(e) => setTipologia(e.target.value)}
                                    >
                                        <MenuItem value="5vs5">Campo a 5</MenuItem>
                                        <MenuItem value="7vs7">Campo a 7</MenuItem>
                                        <MenuItem value="11vs11">Campo a 11</MenuItem>
                                    </TextField>
                                    <TextField
                                        margin="normal" fullWidth required label="Prezzo orario (€)" type="number"
                                        value={prezzo} onChange={(e) => setPrezzo(e.target.value)}
                                    />
                                    <TextField
                                        margin="normal" fullWidth required label="Indirizzo"
                                        value={indirizzo} onChange={(e) => setIndirizzo(e.target.value)}
                                    />
                                    <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, py: 1.2 }}>
                                        Registra la struttura
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* Tabella di controllo */}
                <Grid item xs={12} md={user?.role === 'Gestore' ? 8 : 12}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="secondary.main">
                        {user?.role === 'Gestore' ? 'I Tuoi Impianti Sportivi' : 'Moderazione Campi Piattaforma (UML Action)'}
                    </Typography>
                    <TableContainer component={Paper} elevation={3}>
                        <Table aria-label="tabella gestionale">
                            <TableHead sx={{ bgcolor: 'secondary.main' }}>
                                <TableRow>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nome campo</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipologia</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Prezzo orario</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Indirizzo</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Stato</TableCell>
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Azioni</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {campi.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">Nessun campo presente nel sistema</TableCell>
                                    </TableRow>
                                ) : (
                                    campi.map((campo) => (
                                        <TableRow key={campo._id}>
                                            <TableCell fontWeight="medium">{campo.nome}</TableCell>
                                            <TableCell>{campo.capienza}</TableCell>
                                            <TableCell>€{campo.prezzoAllOra}</TableCell>
                                            <TableCell>{campo.posizione}</TableCell>
                                            <TableCell>
                                                {campo.isVisibile !== false ? (
                                                    <Box component="span" sx={{ color: 'success.main', fontWeight: 'bold' }}>Attivo</Box>
                                                ) : (
                                                    <Box component="span" sx={{ color: 'error.main', fontWeight: 'bold' }}>Oscurato</Box>
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                {user?.role === 'Admin' ? (
                                                    <Button
                                                        variant="contained"
                                                        color={campo.isVisibile !== false ? "error" : "success"}
                                                        size="small"
                                                        onClick={() => CambioVisibilita(campo._id, campo.isVisibile !== false)}
                                                    >
                                                        {campo.isVisibile !== false ? "Modera / Oscura" : "Riattiva"}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outlined"
                                                        color={campo.isVisibile !== false ? "error" : "success"}
                                                        size="small"
                                                        onClick={() => CambioVisibilita(campo._id, campo.isVisibile !== false)}
                                                    >
                                                        {campo.isVisibile !== false ? "Chiusura Campo" : "Apri Campo"}
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </Container>
    );
}