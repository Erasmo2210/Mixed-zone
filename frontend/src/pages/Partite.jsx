import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { socket } from '../services/socket';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, Chip, Box, CircularProgress, Alert, List, ListItem, ListItemText, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';

export default function Partite() {
    const { user } = useContext(AuthContext);

    //inizializzazione degli stati dei campi
    const [partite, setPartite] = useState([]);
    const [prenotazioniAccettate, setPrenotazioniAccettate] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errore, setErrore] = useState('');
    const [modalAperto, setModalAperto] = useState(false);
    const [prenotazioneSelezionata, setPrenotazioneSelezionata] = useState('');
    const [giocatoriMancanti, setGiocatoriMancanti] = useState(1);
    const [creazioneInCorso, setCreazioneInCorso] = useState(false);
    const [successoCreazione, setSuccessoCreazione] = useState('');

    const recuperaDati = async () => {
        try {
            const datiPartite = await apiFetch('/partite');
            setPartite(datiPartite);

            if (user?.role === 'Cliente') {
                const datiPrenotazioni = await apiFetch('/prenotazioni/mie');
                const prenotazioniConfermate = (datiPrenotazioni || []).filter((p) => p.stato === 'Confermata' || p.stato === 'In attesa di conferma dal gestore');
                setPrenotazioniAccettate(prenotazioniConfermate);
            } else {
                setPrenotazioniAccettate([]);
            }
        } catch (err) {
            setErrore('Impossibile caricare le partite aperte.');
        } finally {
            setLoading(false);
        }
    };

    //useEffect esegue il codice che contiene automaticamente quando si verifica una condizione, qui all'avvio 
    useEffect(() => {
        recuperaDati();

        //Attivo la connessione webSocket
        socket.connect();

        //socket.on è il metodo per ascoltare un evento specifico, qui "partitaAggiornata"
        socket.on('lobbyAggiornata', function (partitaModificata) {    //partitaModificata è il dato che riceviamo dal backend quando si verifica l'evento
            setPartite(function (partiteAttuali) {                       //partiteAttuali è lo stato delle partite al momento dell'evento
                const nuovoElencoPartite = partiteAttuali.map(function (p) {

                    //con map sto facendo un foreach, per ogni partita p esistente controllo e aggiungo al nuovo array
                    if (p._id === partitaModificata._id) {
                        return partitaModificata;
                    } else {
                        return p;
                    }
                });
                return nuovoElencoPartite;
            });
        });
        /* Qui volevo usare "partite" dichiarato nello stato iniziale all'interno della funzione setPartite, ma avrebbe usato l'array vuoto iniziale perchè useEffect viene eseguito all'avvio,
           ragion per cui ho usato una variabile creata nel momento stesso della callback che prende il valore aggiornato delle partite al momento dell'evento, 
           è react stesso a capire che mi riferisco a quel dato poichè nelle callback blocca le operazioni e va a leggere il valore aggiornato per "partite", e lo mette come argomento */


        //cleanup
        return function () {
            socket.off('lobbyAggiornata'); //socket.off è il metodo per smettere di ascoltare un evento specifico, qui "partitaAggiornata"
            socket.disconnect();
        };
    }, [user?.role]); //rilegge i dati se cambia il ruolo o lo stato di autenticazione

    const apriModalCreazione = () => {
        setSuccessoCreazione('');
        setErrore('');
        setPrenotazioneSelezionata(prenotazioniAccettate[0]?._id || '');
        setGiocatoriMancanti(1);
        setModalAperto(true);
    };

    const chiudiModalCreazione = () => {
        setModalAperto(false);
        setPrenotazioneSelezionata('');
        setGiocatoriMancanti(1);
    };

    //Funzione per unirsi a una partita
    const gestisciPartecipazione = async (partitaId) => {
        try {
            setErrore('');
            //Post al backend per partecipare alla partita
            await apiFetch(`/partite/${partitaId}/unisciti`, {
                method: 'POST'
            });                  //ci pensa il socket ad aggiornare
        } catch (err) {
            setErrore(err.message);
        }
    };

    const gestisciCreazionePartita = async (event) => {
        event.preventDefault();
        setErrore('');
        setSuccessoCreazione('');
        setCreazioneInCorso(true);

        try {
            const prenotazioneSelezionataDettagli = prenotazioniAccettate.find((p) => p._id === prenotazioneSelezionata);

            if (!prenotazioneSelezionataDettagli || !prenotazioneSelezionataDettagli.campo?._id) {
                throw new Error('Seleziona una prenotazione confermata valida.');
            }

            await apiFetch('/partite', {
                method: 'POST',
                body: JSON.stringify({
                    campoId: prenotazioneSelezionataDettagli.campo._id,
                    data: prenotazioneSelezionataDettagli.data,
                    ora: prenotazioneSelezionataDettagli.oraInizio,
                    maxGiocatori: giocatoriMancanti,
                    prenotazioneId: prenotazioneSelezionataDettagli._id
                })
            });

            setSuccessoCreazione('Partita creata correttamente.');
            chiudiModalCreazione();
            await recuperaDati();
        } catch (err) {
            setErrore(err.message || 'Impossibile creare la partita.');
        } finally {
            setCreazioneInCorso(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Container sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" color="secondary.main" gutterBottom fontWeight="bold">
                Matchmaking ⚽
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                Unisciti alle partite organizzate dalla community in tempo reale.
            </Typography>

            {errore && <Alert severity="error" sx={{ mb: 3 }}>{errore}</Alert>}
            {successoCreazione && <Alert severity="success" sx={{ mb: 3 }}>{successoCreazione}</Alert>}

            {user?.role === 'Cliente' && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    Le prenotazioni in attesa di giocatori compaiono automaticamente in questa sezione.
                </Alert>
            )}

            <Grid container spacing={3}>
                {partite.length === 0 ? (
                    <Grid item xs={12}>
                        <Alert severity="info">Al momento non ci sono partite aperte che cercano giocatori. Crea una prenotazione per aprirne una!</Alert>
                    </Grid>
                ) : (
                    partite.map((partita) => {

                        //calcolo dei posti disponibili e controllo se l'utente è già iscritto alla partita
                        const giocatoriRichiesti = partita.giocatoriRichiesti || 1;
                        const isGiaPartecipante = partita.giocatoriIscritti?.some((g) => (g._id || g) === user?._id);
                        const partecipantiAttuali = partita.giocatoriIscritti?.length || 0;
                        const postiMancanti = Math.max(0, giocatoriRichiesti - Math.max(0, partecipantiAttuali - 1));
                        const obiettivoTotale = giocatoriRichiesti + 1;

                        return (
                            <Grid item key={partita._id} xs={12} md={6}>
                                <Card elevation={3} sx={{ borderLeft: (theme) => `5px solid ${theme.palette.primary.main}` }}>
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                            <Typography variant="h6" fontWeight="bold">
                                                {partita.campo?.nome || 'Campo Mixed-Zone'}
                                            </Typography>
                                            <Chip
                                                label={postiMancanti <= 0 ? "Completa" : `${postiMancanti} Posti Mancanti`}
                                                color={postiMancanti <= 0 ? "error" : "success"}
                                                variant="filled"
                                            />
                                        </Box>

                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            <strong>Data:</strong> {new Date(partita.data).toLocaleDateString('it-IT')} | <strong>Ore:</strong> {partita.ora}
                                        </Typography>

                                        <Divider sx={{ my: 1.5 }} />

                                        <Typography variant="subtitle2" color="secondary.main" fontWeight="bold" gutterBottom>
                                            {/* Mostra il conteggio basato sulle variabili del database */}
                                            Formazione Attuale ({(partita.giocatoriIscritti?.length || 0)}/{obiettivoTotale}):
                                        </Typography>

                                        {/* Elenco in tempo reale dei partecipanti */}
                                        <List dense>
                                            {partita.giocatoriIscritti?.map((giocatore, index) => (
                                                <ListItem key={giocatore._id || index} disableGutters>

                                                    <ListItemText primary={`👕 ${giocatore.name || giocatore.nome || 'Giocatore'}`} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </CardContent>

                                    <CardActions sx={{ p: 2, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider' }}>
                                        {/* gestione del bottoni in base al ruolo */}
                                        {!user ? (
                                            <Button fullWidth variant="outlined" disabled>Accedi per giocare</Button>
                                        ) : user.role !== 'Cliente' ? (
                                            <Button fullWidth variant="outlined" disabled>Inibito ai Gestori/Admin</Button>
                                        ) : isGiaPartecipante ? (
                                            <Button fullWidth variant="contained" color="secondary" disabled>Sei già in formazione</Button>
                                        ) : postiMancanti <= 0 || partita.statoPartita === 'Al completo' ? (
                                            <Button fullWidth variant="contained" disabled>Squadre Al Completo</Button>
                                        ) : (
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                color="primary"
                                                onClick={() => gestisciPartecipazione(partita._id)}
                                            >
                                                Unisciti al Match
                                            </Button>
                                        )}
                                    </CardActions>
                                </Card>
                            </Grid>
                        );
                    })
                )}
            </Grid>

            <Dialog open={modalAperto} onClose={chiudiModalCreazione} fullWidth maxWidth="sm">
                <DialogTitle fontWeight="bold" color="secondary.main">
                    Crea una partita da prenotazione confermata
                </DialogTitle>
                <Box component="form" onSubmit={gestisciCreazionePartita} noValidate>
                    <DialogContent dividers>
                        <TextField
                            select
                            fullWidth
                            label="Prenotazione confermata"
                            value={prenotazioneSelezionata}
                            onChange={(event) => setPrenotazioneSelezionata(event.target.value)}
                            margin="normal"
                            required
                        >
                            {prenotazioniAccettate.map((prenotazione) => (
                                <MenuItem key={prenotazione._id} value={prenotazione._id}>
                                    {prenotazione.campo?.nome || 'Campo'} · {new Date(prenotazione.data).toLocaleDateString('it-IT')} · {prenotazione.oraInizio}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            fullWidth
                            label="Giocatori mancanti"
                            value={giocatoriMancanti}
                            onChange={(event) => setGiocatoriMancanti(Number(event.target.value))}
                            margin="normal"
                        >
                            {(() => {
                                const capienzaSelezionata = prenotazioniAccettate.find((p) => p._id === prenotazioneSelezionata)?.campo?.capienza;
                                const capienzaMassima = capienzaSelezionata === '7vs7' ? 13 : capienzaSelezionata === '11vs11' ? 21 : 9;
                                return Array.from({ length: capienzaMassima }, (_, index) => (
                                    <MenuItem key={index + 1} value={index + 1}>
                                        {index + 1} giocatore{index + 1 > 1 ? '/i' : ' '} mancanti
                                    </MenuItem>
                                ));
                            })()}
                        </TextField>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={chiudiModalCreazione} color="inherit">Annulla</Button>
                        <Button type="submit" variant="contained" color="primary" disabled={creazioneInCorso}>
                            {creazioneInCorso ? 'Creazione...' : 'Crea partita'}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Container>
    );
}