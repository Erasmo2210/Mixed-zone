import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { Container, Grid, Card, CardContent, CardActions, CardMedia, Typography, Button, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Box } from '@mui/material';

export default function Campi() {
    const { user } = useContext(AuthContext); //utilizza user da AuthContext

    //inizializzazione degli stati dei campi
    const [campi, setCampi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errore, setErrore] = useState('');
    const [modalAperto, setModalAperto] = useState(false);
    const [campoSelezionato, setCampoSelezionato] = useState(null);
    const [dataPrenotazione, setDataPrenotazione] = useState('');
    const [oraPrenotazione, setOraPrenotazione] = useState('');
    const [errorePrenotazione, setErrorePrenotazione] = useState('');
    const [successoPrenotazione, setSuccessoPrenotazione] = useState('');

    //useEffect esegue il codice che contiene automaticamente quando si verifica una condizione, qui all'avvio
    useEffect(() => {
        const recuperaCampi = async () => {
            try {
                //get per ottenere i campi
                const dati = await apiFetch('/campi');
                setCampi(dati.filter(campo => campo.isVisibile === true));
            } catch (err) {
                setErrore('Impossibile caricare l\'elenco dei campi sportivi.');
            } finally {               //finally nelle promise fa eseguire sempre e comunque l'azione che contiene
                setLoading(false);
            }
        };
        recuperaCampi();
    }, []);   //array vuoto per eseguire solo una vola all'avvio lo useEffect

    //Apettura modale di prenotazione
    function apriFinestraPrenotazione(campo) {
        setCampoSelezionato(campo);  //mostro il campo selezionato 
        setModalAperto(true);
        setErrorePrenotazione("");
        setSuccessoPrenotazione("");
    }

    //Chiusura modale di prenotazione e reset
    function chiudiFinestraPrenotazione() {
        setModalAperto(false);
        setCampoSelezionato(null);
        setDataPrenotazione('');
        setOraPrenotazione('');
    }

    //invio al backend della prenotazione
    const InviaPrenotazione = async (event) => {
        event.preventDefault();     //blocco il comportamento di default del form
        setErrorePrenotazione('');
        setSuccessoPrenotazione('');

        //valido a frontend data e ora
        if (!dataPrenotazione || !oraPrenotazione) {
            setErrorePrenotazione('Seleziona sia la data che l\'orario del match.');
            return;
        }

        try {
            //Effettuo la post coi dati
            await apiFetch('/prenotazioni', {
                method: 'POST',
                body: JSON.stringify({
                    campoId: campoSelezionato._id,
                    data: dataPrenotazione,
                    oraInizio: oraPrenotazione
                })
            });

            setSuccessoPrenotazione('Prenotazione confermata con successo');

            setTimeout(() => {
                chiudiFinestraPrenotazione();
            }, 1500);

        } catch (err) {
            setErrorePrenotazione(err.message);
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
                Centri Sportivi & Campi Disponibili
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                Scegli l'impianto perfetto per la tua partita. Prenota istantaneamente lo slot orario.
            </Typography>

            {errore && <Alert severity="error" sx={{ mb: 3 }}>{errore}</Alert>}

            {/* Layout a Griglia Responsive */}
            <Grid container spacing={3}>
                {campi.map((campo) => (
                    <Grid item key={campo._id} xs={12} sm={6} md={4}>
                        <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardMedia
                                component="img"
                                height="160"
                                image={campo.immagine || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500'}
                                alt={campo.nome}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>{campo.nome}</Typography>
                                <Typography variant="subtitle2" color="primary" gutterBottom>
                                    Tipologia: {campo.capienza}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Prezzo orario: €{campo.prezzoAllOra}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ p: 2, pt: 0 }}>
                                {/* Solo i Clienti vedono abilitato il tasto prenota */}
                                {user && user.role === 'Cliente' ? (
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        onClick={() => apriFinestraPrenotazione(campo)}
                                    >
                                        Prenota Campo
                                    </Button>
                                ) : (
                                    <Button fullWidth variant="outlined" color="secondary" disabled>
                                        {user ? 'Inibito ai Gestori/Admin' : 'Accedi come cliente per renotare'}
                                    </Button>
                                )}
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>



            {/* Modale di prenotazione */}
            <Dialog open={modalAperto} onClose={chiudiFinestraPrenotazione} fullWidth maxWidth="xs">
                <DialogTitle fontWeight="bold" color="secondary.main">
                    Prenotazione: {campoSelezionato?.nome}
                </DialogTitle>

                <Box component="form" onSubmit={InviaPrenotazione} noValidate>
                    <DialogContent dividers>
                        {errorePrenotazione && <Alert severity="error" sx={{ mb: 2 }}>{errorePrenotazione}</Alert>}
                        {successoPrenotazione && <Alert severity="success" sx={{ mb: 2 }}>{successoPrenotazione}</Alert>}

                        {/* utilizzo type date per non importare librerie di calendari */}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Seleziona Giorno"
                            type="date"
                            InputLabelProps={{ shrink: true }} //per non sovrapporre il label al selettore di data
                            value={dataPrenotazione}
                            onChange={(event) => setDataPrenotazione(event.target.value)}
                        />

                        {/* Input Orario tramite Menu a tendina coerente con gli slot standard del backend */}
                        <TextField
                            select
                            margin="normal"
                            required
                            fullWidth
                            label="Seleziona Orario"
                            value={oraPrenotazione}
                            onChange={(event) => setOraPrenotazione(event.target.value)}
                        >
                            <MenuItem value="10:00">10:00 - 11:00</MenuItem>
                            <MenuItem value="11:00">11:00 - 12:00</MenuItem>
                            <MenuItem value="16:00">16:00 - 17:00</MenuItem>
                            <MenuItem value="17:00">17:00 - 18:00</MenuItem>
                            <MenuItem value="18:00">18:00 - 19:00</MenuItem>
                            <MenuItem value="19:00">19:00 - 20:00</MenuItem>
                            <MenuItem value="20:00">20:00 - 21:00</MenuItem>
                            <MenuItem value="21:00">21:00 - 22:00</MenuItem>
                            <MenuItem value="22:00">22:00 - 23:00</MenuItem>
                        </TextField>
                    </DialogContent>

                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={chiudiFinestraPrenotazione} color="inherit">Annulla</Button>
                        <Button type="submit" variant="contained" color="primary" disabled={!!successoPrenotazione}>
                            Conferma e blocca
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Container>
    );
}