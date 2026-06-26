import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { socket } from '../services/socket';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, Chip, Box, CircularProgress, Alert, List, ListItem, ListItemText, Divider } from '@mui/material';

export default function Partite() {
    const { user } = useContext(AuthContext);

    //inizializzazione degli stati dei campi
    const [partite, setPartite] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errore, setErrore] = useState('');

    //useEffect esegue il codice che contiene automaticamente quando si verifica una condizione, qui all'avvio 
    useEffect(() => {
        const recuperaPartite = async () => {
            try {
                const dati = await apiFetch('/partite');
                setPartite(dati);
            } catch (err) {
                setErrore('Impossibile caricare le partite aperte.');
            } finally {            //finally nelle promise fa eseguire sempre e comunque l'azione che contiene
                setLoading(false);
            }
        };
        recuperaPartite();

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
    }, []); //array vuoto per eseguire solo una vola all'avvio lo useEffect


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
                Matchmaking & Partite Aperte ⚽
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                Unisciti alle partite organizzate dalla community in tempo reale. Completa le squadre e scendi in campo.
            </Typography>

            {errore && <Alert severity="error" sx={{ mb: 3 }}>{errore}</Alert>}

            <Grid container spacing={3}>
                {partite.length === 0 ? (
                    <Grid item xs={12}>
                        <Alert severity="info">Al momento non ci sono partite aperte che buscan giocatori. Crea una prenotazione per aprirne una!</Alert>
                    </Grid>
                ) : (
                    partite.map((partita) => {

                        //calcolo dei posti disponibili e controllo se l'utente è già iscritto alla partita
                        const postiMax = partita.giocatoriRichiesti || 1;
                        const isGiaPartecipante = partita.giocatoriIscritti?.some((g) => (g._id || g) === user?._id);
                        const postiDisponibili = postiMax - (partita.giocatoriIscritti?.length || 0);

                        return (
                            <Grid item key={partita._id} xs={12} md={6}>
                                <Card elevation={3} sx={{ borderLeft: '5px solid #2e7d32' }}>
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                            <Typography variant="h6" fontWeight="bold">
                                                {partita.campo?.nome || 'Campo Mixed-Zone'}
                                            </Typography>
                                            <Chip
                                                label={postiDisponibili <= 0 ? "Completa" : `${postiDisponibili} Posti Liberi`}
                                                color={postiDisponibili <= 0 ? "error" : "success"}
                                                variant="filled"
                                            />
                                        </Box>

                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            <strong>Data:</strong> {new Date(partita.data).toLocaleDateString('it-IT')} | <strong>Ora:</strong> {partita.ora}
                                        </Typography>

                                        <Divider sx={{ my: 1.5 }} />

                                        <Typography variant="subtitle2" color="secondary.main" fontWeight="bold" gutterBottom>
                                            {/* Mostra il conteggio basato sulle variabili del database */}
                                            Formazione Attuale ({(partita.giocatoriIscritti?.length || 0)}/{postiMax}):
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

                                    <CardActions sx={{ p: 2, bgcolor: '#fcfcfc', borderTop: '1px solid #eee' }}>
                                        {/* gestione del bottoni in base al ruolo */}
                                        {!user ? (
                                            <Button fullWidth variant="outlined" disabled>Accedi per giocare</Button>
                                        ) : user.role !== 'Cliente' && user.ruolo !== 'Cliente' ? ( // Controllo bilingue per sicurezza
                                            <Button fullWidth variant="outlined" disabled>Inibito ai Gestori/Admin</Button>
                                        ) : isGiaPartecipante ? (
                                            <Button fullWidth variant="contained" color="secondary" disabled>Sei già in formazione</Button>
                                        ) : postiDisponibili <= 0 || partita.statoPartita === 'Al completo' ? (
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
        </Container>
    );
}