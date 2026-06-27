import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { Container, Typography, Box, Grid, Card, CardContent, TextField, Button, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

export default function Dashboard() {
    const { user } = useContext(AuthContext); //recupero le informazioni dell' user loggato 

    //inizializzazione degli stati dei campi
    const [campi, setCampi] = useState([]);
    const [prenotazioni, setPrenotazioni] = useState([]);
    const [errore, setErrore] = useState('');
    const [successo, setSuccesso] = useState('');
    const [nomeCampo, setNomeCampo] = useState('');
    const [indirizzo, setIndirizzo] = useState('');
    const [tipologia, setTipologia] = useState('5vs5');
    const [prezzo, setPrezzo] = useState('');
    const [modalModificaAperto, setModalModificaAperto] = useState(false);
    const [campoDaModificare, setCampoDaModificare] = useState(null);
    const [nomeCampoModifica, setNomeCampoModifica] = useState('');
    const [indirizzoModifica, setIndirizzoModifica] = useState('');
    const [tipologiaModifica, setTipologiaModifica] = useState('5vs5');
    const [prezzoModifica, setPrezzoModifica] = useState('');
    const [utenti, setUtenti] = useState([]);
    const [tornei, setTornei] = useState([]);

    const caricaDatiDashboard = async () => {
        try {
            const dati = await apiFetch('/campi');
            setCampi(dati);

            if (user?.role === 'Gestore') {
                const prenotazioniRicevute = await apiFetch('/prenotazioni/gestore');
                setPrenotazioni(prenotazioniRicevute);
            }

            if (user?.role === 'Admin') {
                const utentiRegistrati = await apiFetch('/admin/utenti');
                setUtenti(utentiRegistrati);

                const torneiRegistrati = await apiFetch('/tornei');
                setTornei(torneiRegistrati);
            }
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
            setTipologia('5vs5');
            setIndirizzo('');
            caricaDatiDashboard(); //chiamo la funzione per ricaricare
        } catch (err) {
            setErrore(err.message);
        }
    };

    const GestisciPrenotazione = async (prenotazioneId, nuovoStato) => {
        try {
            setErrore('');
            setSuccesso('');

            await apiFetch(`/prenotazioni/${prenotazioneId}/${nuovoStato === 'Confermata' ? 'conferma' : 'rifiuta'}`, {
                method: 'PUT'
            });

            setSuccesso(`Prenotazione ${nuovoStato === 'Confermata' ? 'confermata' : 'rifiutata'} con successo.`);
            caricaDatiDashboard();
        } catch (err) {
            setErrore(err.message || 'Errore durante l’aggiornamento della prenotazione.');
        }
    };

    const ApriModalModificaCampo = (campo) => {
        setCampoDaModificare(campo);
        setNomeCampoModifica(campo.nome || '');
        setIndirizzoModifica(campo.posizione || '');
        setTipologiaModifica(campo.capienza || '5vs5');
        setPrezzoModifica(campo.prezzoAllOra || '');
        setErrore('');
        setSuccesso('');
        setModalModificaAperto(true);
    };

    const ChiudiModalModificaCampo = () => {
        setModalModificaAperto(false);
        setCampoDaModificare(null);
        setNomeCampoModifica('');
        setIndirizzoModifica('');
        setTipologiaModifica('5vs5');
        setPrezzoModifica('');
    };

    const SalvaModificaCampo = async (event) => {
        event.preventDefault();
        setErrore('');
        setSuccesso('');

        if (!campoDaModificare || !nomeCampoModifica || !prezzoModifica) {
            setErrore('Compila tutti i campi richiesti.');
            return;
        }

        try {
            await apiFetch(`/campi/${campoDaModificare._id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    nome: nomeCampoModifica,
                    posizione: indirizzoModifica,
                    prezzoAllOra: Number(prezzoModifica),
                    capienza: tipologiaModifica,
                })
            });

            setSuccesso('Campo aggiornato con successo.');
            ChiudiModalModificaCampo();
            caricaDatiDashboard();
        } catch (err) {
            setErrore(err.message || 'Errore durante l\'aggiornamento del campo.');
        }
    };

    const GestisciUtente = async (utenteId, isActive) => {
        try {
            setErrore('');
            setSuccesso('');

            await apiFetch(`/admin/utenti/${utenteId}/stato`, {
                method: 'PUT',
                body: JSON.stringify({ isActive })
            });

            setSuccesso(isActive ? 'Utente riattivato con successo.' : 'Utente disattivato con successo.');
            caricaDatiDashboard();
        } catch (err) {
            setErrore(err.message || 'Errore durante la moderazione dell\'utente.');
        }
    };

    const GestisciTorneo = async (torneoId, isVisible) => {
        try {
            setErrore('');
            setSuccesso('');

            await apiFetch(`/admin/tornei/${torneoId}/oscura`, {
                method: 'PUT',
                body: JSON.stringify({ isVisibile: isVisible })
            });

            setSuccesso(isVisible ? 'Torneo riattivato con successo.' : 'Torneo oscurato con successo.');
            caricaDatiDashboard();
        } catch (err) {
            setErrore(err.message || 'Errore durante la moderazione del torneo.');
        }
    };

    const mostraColonnaModifica = user?.role === 'Gestore';

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
            setErrore(err.message || 'Errore durante la modifica dello stato del campo.');
        }
    };

    return (
        <Container sx={{ mt: 4, mb: 4 }}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" color="secondary.main">
                    Pannello di Controllo 
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
                        {user?.role === 'Gestore' ? 'I tuoi impianti' : 'Campi registrati'}
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
                                    {mostraColonnaModifica && (
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Modifica</TableCell>
                                    )}
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Azioni</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {campi.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">Nessun campo presente nel sistema</TableCell>
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
                                            {mostraColonnaModifica && (
                                                <TableCell>
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        size="small"
                                                        onClick={() => ApriModalModificaCampo(campo)}
                                                    >
                                                        Modifica
                                                    </Button>
                                                </TableCell>
                                            )}
                                            <TableCell align="right">
                                                {user?.role === 'Admin' ? (
                                                    <Button
                                                        variant="contained"
                                                        color={campo.isVisibile !== false ? "error" : "success"}
                                                        size="small"
                                                        onClick={() => CambioVisibilita(campo._id, campo.isVisibile !== false)}
                                                    >
                                                        {campo.isVisibile !== false ? "Oscura" : "Riattiva"}
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

                {user?.role === 'Admin' && (
                    <Grid item xs={12}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom color="secondary.main">
                            Gestione utenti
                        </Typography>
                        <TableContainer component={Paper} elevation={3} sx={{ mb: 4 }}>
                            <Table aria-label="tabella utenti admin">
                                <TableHead sx={{ bgcolor: 'secondary.main' }}>
                                    <TableRow>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nome</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ruolo</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Stato</TableCell>
                                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Azioni</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {utenti.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">Nessun utente registrato</TableCell>
                                        </TableRow>
                                    ) : (
                                        utenti.map((utenteRow) => (
                                            <TableRow key={utenteRow._id}>
                                                <TableCell>{utenteRow.name}</TableCell>
                                                <TableCell>{utenteRow.email}</TableCell>
                                                <TableCell>{utenteRow.role}</TableCell>
                                                <TableCell>
                                                    {utenteRow.isActive ? (
                                                        <Box component="span" sx={{ color: 'success.main', fontWeight: 'bold' }}>Attivo</Box>
                                                    ) : (
                                                        <Box component="span" sx={{ color: 'error.main', fontWeight: 'bold' }}>Disattivato</Box>
                                                    )}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {utenteRow._id === user?._id ? (
                                                        <Button size="small" variant="outlined" disabled>
                                                            Il tuo account
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            color={utenteRow.isActive ? 'error' : 'success'}
                                                            onClick={() => GestisciUtente(utenteRow._id, !utenteRow.isActive)}
                                                        >
                                                            {utenteRow.isActive ? 'Disattiva' : 'Riattiva'}
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
                )}

                {user?.role === 'Admin' && (
                    <Grid item xs={12}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom color="secondary.main">
                            Gestione tornei
                        </Typography>
                        <TableContainer component={Paper} elevation={3} sx={{ mb: 4 }}>
                            <Table aria-label="tabella tornei admin">
                                <TableHead sx={{ bgcolor: 'secondary.main' }}>
                                    <TableRow>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nome torneo</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Organizzatore</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Stato</TableCell>
                                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Azioni</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tornei.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">Nessun torneo registrato</TableCell>
                                        </TableRow>
                                    ) : (
                                        tornei.map((torneo) => (
                                            <TableRow key={torneo._id}>
                                                <TableCell>{torneo.nome}</TableCell>
                                                <TableCell>{torneo.organizzatore?.name || 'N/D'}</TableCell>
                                                <TableCell>
                                                    {torneo.isVisibile ? (
                                                        <Box component="span" sx={{ color: 'success.main', fontWeight: 'bold' }}>Attivo</Box>
                                                    ) : (
                                                        <Box component="span" sx={{ color: 'error.main', fontWeight: 'bold' }}>Oscurato</Box>
                                                    )}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color={torneo.isVisibile ? 'error' : 'success'}
                                                        onClick={() => GestisciTorneo(torneo._id, !torneo.isVisibile)}
                                                    >
                                                        {torneo.isVisibile ? 'Oscura' : 'Riattiva'}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                )}

                {user?.role === 'Gestore' && (
                    <Grid item xs={12}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom color="secondary.main">
                            Prenotazioni ricevute
                        </Typography>
                        <TableContainer component={Paper} elevation={3}>
                            <Table aria-label="tabella prenotazioni gestore">
                                <TableHead sx={{ bgcolor: 'secondary.main' }}>
                                    <TableRow>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cliente</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Campo</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Data</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Orario</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Stato</TableCell>
                                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Azioni</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {prenotazioni.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">Nessuna prenotazione ricevuta</TableCell>
                                        </TableRow>
                                    ) : (
                                        prenotazioni.map((prenotazione) => (
                                            <TableRow key={prenotazione._id}>
                                                <TableCell>{prenotazione.cliente?.name || 'Cliente'}</TableCell>
                                                <TableCell>{prenotazione.campo?.nome || 'Campo'}</TableCell>
                                                <TableCell>{new Date(prenotazione.data).toLocaleDateString('it-IT')}</TableCell>
                                                <TableCell>{prenotazione.oraInizio}</TableCell>
                                                <TableCell>{prenotazione.stato}</TableCell>
                                                <TableCell align="right">
                                                    {prenotazione.stato === 'Confermata' || prenotazione.stato === 'Rifiutata' || prenotazione.stato === 'Scaduta' ? (
                                                        <Button size="small" variant="outlined" color={prenotazione.stato === 'Confermata' ? 'success' : 'error'} disabled>
                                                            {prenotazione.stato === 'Confermata' ? 'Confermata' : prenotazione.stato === 'Rifiutata' ? 'Rifiutata' : 'Scaduta'}
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            <Button size="small" variant="contained" color="success" sx={{ mr: 1 }} onClick={() => GestisciPrenotazione(prenotazione._id, 'Confermata')}>
                                                                Conferma
                                                            </Button>
                                                            <Button size="small" variant="contained" color="error" onClick={() => GestisciPrenotazione(prenotazione._id, 'rifiutata')}>
                                                                Rifiuta
                                                            </Button>
                                                        </>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                )}
            </Grid>

            <Dialog open={modalModificaAperto} onClose={ChiudiModalModificaCampo} fullWidth maxWidth="sm">
                <DialogTitle fontWeight="bold" color="secondary.main">
                    Modifica impianto
                </DialogTitle>
                <Box component="form" onSubmit={SalvaModificaCampo} noValidate>
                    <DialogContent dividers>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Nome campo"
                            value={nomeCampoModifica}
                            onChange={(e) => setNomeCampoModifica(e.target.value)}
                        />
                        <TextField
                            select
                            margin="normal"
                            fullWidth
                            required
                            label="Grandezza campo"
                            value={tipologiaModifica}
                            onChange={(e) => setTipologiaModifica(e.target.value)}
                        >
                            <MenuItem value="5vs5">Campo a 5</MenuItem>
                            <MenuItem value="7vs7">Campo a 7</MenuItem>
                            <MenuItem value="11vs11">Campo a 11</MenuItem>
                        </TextField>
                        <TextField
                            margin="normal"
                            fullWidth
                            required
                            label="Prezzo orario (€)"
                            type="number"
                            value={prezzoModifica}
                            onChange={(e) => setPrezzoModifica(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            required
                            label="Indirizzo"
                            value={indirizzoModifica}
                            onChange={(e) => setIndirizzoModifica(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={ChiudiModalModificaCampo} color="inherit">Annulla</Button>
                        <Button type="submit" variant="contained" color="primary">
                            Salva modifiche
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Container>
    );
}