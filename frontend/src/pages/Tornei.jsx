import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, TextField, Box, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

export default function Tornei() {

    const { user } = useContext(AuthContext);

    //inizializzazione degli stati dei campi
    const [tornei, setTornei] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errore, setErrore] = useState('');
    const [successo, setSuccesso] = useState('');
    //Creazione torneo 
    const [nomeTorneo, setNomeTorneo] = useState('');
    //Iscrizione squadra
    const [modalIscrizioneAperto, setModalIscrizioneAperto] = useState(false);
    const [torneoSelezionato, setTorneoSelezionato] = useState(null);
    const [nomeSquadra, setNomeSquadra] = useState('');
    const [erroreIscrizione, setErroreIscrizione] = useState('');
    //Aggiornamento statistiche
    const [modalStatisticheAperto, setModalStatisticheAperto] = useState(false);
    const [squadraSelezionata, setSquadraSelezionata] = useState(null); // { torneoId, squadra }
    const [statPunti, setStatPunti] = useState(0);
    const [statGiocate, setStatGiocate] = useState(0);
    const [statVittorie, setStatVittorie] = useState(0);
    const [statPareggi, setStatPareggi] = useState(0);
    const [statSconfitte, setStatSconfitte] = useState(0);
    const [erroreStatistiche, setErroreStatistiche] = useState('');
    //Aggiornamento Risultati
    const [modalRisultatiAperto, setModalRisultatiAperto] = useState(false);
    const [testoRisultati, setTestoRisultati] = useState('');
    const [erroreRisultati, setErroreRisultati] = useState('');

    const caricaTornei = async () => {
        try {
            const dati = await apiFetch('/tornei');
            setTornei(dati);
        } catch (err) {
            setErrore('Impossibile recuperare l\'elenco dei tornei.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        caricaTornei();
    }, []);

    // Creazione di un torneo
    const handleCreaTorneo = async (event) => {
        event.preventDefault();
        setErrore('');
        setSuccesso('');

        if (!nomeTorneo.trim()) {
            setErrore('Il nome del torneo è obbligatorio.');
            return;
        }

        try {
            await apiFetch('/tornei', {
                method: 'POST',
                body: JSON.stringify({ nome: nomeTorneo })
            });
            setSuccesso('Torneo creato con successo!');
            setNomeTorneo('');
            caricaTornei();
        } catch (err) {
            setErrore(err.message);
        }
    };

    // Apertura finestra per iscrivere una squadra
    const apriModalIscrizione = (torneo) => {
        setTorneoSelezionato(torneo);
        setNomeSquadra('');
        setErroreIscrizione('');
        setModalIscrizioneAperto(true);
    };

    const chiudiModalIscrizione = () => {
        setModalIscrizioneAperto(false);
        setTorneoSelezionato(null);
    };

    // Invio iscrizione squadra
    const handleIscriviSquadra = async (event) => {
        event.preventDefault();
        setErroreIscrizione('');

        if (!nomeSquadra.trim()) {
            setErroreIscrizione('Il nome della squadra è obbligatorio.');
            return;
        }

        try {
            await apiFetch(`/tornei/${torneoSelezionato._id}/iscriviti`, {
                method: 'POST',
                body: JSON.stringify({ nomeSquadra })
            });
            setSuccesso('Squadra iscritta con successo!');
            chiudiModalIscrizione();
            caricaTornei();
        } catch (err) {
            setErroreIscrizione(err.message);
        }
    };

    // Apertura finestra per aggiornare le statistiche di una squadra
    const apriModalStatistiche = (torneoId, squadra) => {
        setSquadraSelezionata({ torneoId, squadra });
        setStatPunti(squadra.punti || 0);
        setStatGiocate(squadra.partiteGiocate || 0);
        setStatVittorie(squadra.vittorie || 0);
        setStatPareggi(squadra.pareggi || 0);
        setStatSconfitte(squadra.sconfitte || 0);
        setErroreStatistiche('');
        setModalStatisticheAperto(true);
    };

    const chiudiModalStatistiche = () => {
        setModalStatisticheAperto(false);
        setSquadraSelezionata(null);
    };

    // Salva statistiche della squadra
    const handleSalvaStatistiche = async (event) => {
        event.preventDefault();
        setErroreStatistiche('');

        const { torneoId, squadra } = squadraSelezionata;

        try {
            await apiFetch(`/tornei/${torneoId}/aggiorna-squadra/${squadra._id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    punti: Number(statPunti),
                    partiteGiocate: Number(statGiocate),
                    vittorie: Number(statVittorie),
                    pareggi: Number(statPareggi),
                    sconfitte: Number(statSconfitte)
                })
            });
            setSuccesso('Statistiche della squadra aggiornate!');
            chiudiModalStatistiche();
            caricaTornei();
        } catch (err) {
            setErroreStatistiche(err.message);
        }
    };

    // Apertura finestra per aggiornare i risultati/classifica testuale
    const apriModalRisultati = (torneo) => {
        setTorneoSelezionato(torneo);
        setTestoRisultati(torneo.risultatiEClassifica || '');
        setErroreRisultati('');
        setModalRisultatiAperto(true);
    };

    const chiudiModalRisultati = () => {
        setModalRisultatiAperto(false);
        setTorneoSelezionato(null);
    };

    // Salva risultati testuali del torneo
    const handleSalvaRisultati = async (event) => {
        event.preventDefault();
        setErroreRisultati('');

        try {
            await apiFetch(`/tornei/${torneoSelezionato._id}/risultati`, {
                method: 'PUT',
                body: JSON.stringify({ risultatiEClassifica: testoRisultati })
            });
            setSuccesso('Risultati generali del torneo aggiornati!');
            chiudiModalRisultati();
            caricaTornei();
        } catch (err) {
            setErroreRisultati(err.message);
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
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" color="secondary.main">
                    Tornei & Campionati 🏆
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Visualizza le classifiche o iscrivi la tua squadra per partecipare ai nostri tornei ufficiali.
                </Typography>
            </Box>

            {errore && <Alert severity="error" sx={{ mb: 3 }}>{errore}</Alert>}
            {successo && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccesso('')}>{successo}</Alert>}

            <Grid container spacing={4}>
                {/* Form di creazione torneo per i Gestori */}
                {user?.role === 'Gestore' && (
                    <Grid item xs={12}>
                        <Card elevation={3}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
                                    Crea un Nuovo Torneo
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Box component="form" onSubmit={handleCreaTorneo} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <TextField
                                        required
                                        fullWidth
                                        size="small"
                                        label="Nome del Torneo"
                                        value={nomeTorneo}
                                        onChange={(e) => setNomeTorneo(e.target.value)}
                                    />
                                    <Button type="submit" variant="contained" color="primary" sx={{ px: 4 }}>
                                        Crea
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* Elenco dei Tornei */}
                <Grid item xs={12}>
                    {tornei.length === 0 ? (
                        <Alert severity="info">Non ci sono tornei attivi al momento.</Alert>
                    ) : (
                        <Grid container spacing={3}>
                            {tornei.map((torneo) => {
                                const isOrganizzatore = torneo.organizzatore?._id === user?.id || torneo.organizzatore === user?.id;

                                return (
                                    <Grid item key={torneo._id} xs={12}>
                                        <Card elevation={3}>
                                            <CardContent>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                                    <Box>
                                                        <Typography variant="h5" fontWeight="bold" color="secondary.main">
                                                            {torneo.nome}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Organizzato da: <strong>{torneo.organizzatore?.name || 'Gestore'}</strong>
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" gap={1}>
                                                        {user?.role === 'Cliente' && (
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                size="small"
                                                                onClick={() => apriModalIscrizione(torneo)}
                                                            >
                                                                Iscrivi Squadra
                                                            </Button>
                                                        )}
                                                        {isOrganizzatore && (
                                                            <Button
                                                                variant="outlined"
                                                                color="secondary"
                                                                size="small"
                                                                onClick={() => apriModalRisultati(torneo)}
                                                            >
                                                                Gestisci Note / Risultati
                                                            </Button>
                                                        )}
                                                    </Box>
                                                </Box>

                                                <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic', bgcolor: '#e0f2fe', p: 1.5, borderRadius: 1 }}>
                                                    <strong>📢 Comunicazione ed Eventi:</strong> {torneo.risultatiEClassifica}
                                                </Typography>

                                                <Typography variant="h6" fontWeight="medium" gutterBottom color="text.primary">
                                                    Classifica & Partecipanti
                                                </Typography>

                                                <TableContainer component={Paper} elevation={1}>
                                                    <Table size="small">
                                                        <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                                            <TableRow>
                                                                <TableCell sx={{ fontWeight: 'bold' }}>Pos</TableCell>
                                                                <TableCell sx={{ fontWeight: 'bold' }}>Squadra</TableCell>
                                                                <TableCell sx={{ fontWeight: 'bold' }}>Capitano</TableCell>
                                                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Partite Giocate</TableCell>
                                                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Vittorie</TableCell>
                                                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Pareggi</TableCell>
                                                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Sconfitte</TableCell>
                                                                <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>PUNTI</TableCell>
                                                                {isOrganizzatore && <TableCell align="right" sx={{ fontWeight: 'bold' }}>Azioni</TableCell>}
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {torneo.squadreIscritte.length === 0 ? (
                                                                <TableRow>
                                                                    <TableCell colSpan={isOrganizzatore ? 9 : 8} align="center">
                                                                        Nessuna squadra iscritta a questo torneo.
                                                                    </TableCell>
                                                                </TableRow>
                                                            ) : (
                                                                [...torneo.squadreIscritte]
                                                                    .sort((a, b) => b.punti - a.punti)
                                                                    .map((squadra, index) => (
                                                                        <TableRow key={squadra._id}>
                                                                            <TableCell>{index + 1}</TableCell>
                                                                            <TableCell sx={{ fontWeight: 'bold' }}>{squadra.nomeSquadra}</TableCell>
                                                                            <TableCell>{squadra.capitano?.name || 'Cliente'}</TableCell>
                                                                            <TableCell align="center">{squadra.partiteGiocate}</TableCell>
                                                                            <TableCell align="center">{squadra.vittorie}</TableCell>
                                                                            <TableCell align="center">{squadra.pareggi}</TableCell>
                                                                            <TableCell align="center">{squadra.sconfitte}</TableCell>
                                                                            <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{squadra.punti}</TableCell>
                                                                            {isOrganizzatore && (
                                                                                <TableCell align="right">
                                                                                    <Button
                                                                                        size="small"
                                                                                        variant="outlined"
                                                                                        color="primary"
                                                                                        onClick={() => apriModalStatistiche(torneo._id, squadra)}
                                                                                    >
                                                                                        Aggiorna Stat
                                                                                    </Button>
                                                                                </TableCell>
                                                                            )}
                                                                        </TableRow>
                                                                    ))
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}
                </Grid>
            </Grid>

            {/* Modal Iscrizione Squadra */}
            <Dialog open={modalIscrizioneAperto} onClose={chiudiModalIscrizione} fullWidth maxWidth="xs">
                <DialogTitle fontWeight="bold" color="secondary.main">
                    Iscrizione Torneo: {torneoSelezionato?.nome}
                </DialogTitle>
                <Box component="form" onSubmit={handleIscriviSquadra}>
                    <DialogContent dividers>
                        {erroreIscrizione && <Alert severity="error" sx={{ mb: 2 }}>{erroreIscrizione}</Alert>}
                        <TextField
                            autoFocus
                            margin="dense"
                            required
                            fullWidth
                            label="Nome della tua Squadra"
                            value={nomeSquadra}
                            onChange={(e) => setNomeSquadra(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={chiudiModalIscrizione} color="inherit">Annulla</Button>
                        <Button type="submit" variant="contained" color="primary">Invia Iscrizione</Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* Modal Gestione Statistiche Squadra */}
            <Dialog open={modalStatisticheAperto} onClose={chiudiModalStatistiche} fullWidth maxWidth="xs">
                <DialogTitle fontWeight="bold" color="secondary.main">
                    Aggiorna Statistiche: {squadraSelezionata?.squadra.nomeSquadra}
                </DialogTitle>
                <Box component="form" onSubmit={handleSalvaStatistiche}>
                    <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {erroreStatistiche && <Alert severity="error" sx={{ mb: 2 }}>{erroreStatistiche}</Alert>}
                        <TextField
                            required
                            type="number"
                            label="Punti in Classifica"
                            value={statPunti}
                            onChange={(e) => setStatPunti(e.target.value)}
                        />
                        <TextField
                            required
                            type="number"
                            label="Partite Giocate"
                            value={statGiocate}
                            onChange={(e) => setStatGiocate(e.target.value)}
                        />
                        <TextField
                            required
                            type="number"
                            label="Vittorie"
                            value={statVittorie}
                            onChange={(e) => setStatVittorie(e.target.value)}
                        />
                        <TextField
                            required
                            type="number"
                            label="Pareggi"
                            value={statPareggi}
                            onChange={(e) => setStatPareggi(e.target.value)}
                        />
                        <TextField
                            required
                            type="number"
                            label="Sconfitte"
                            value={statSconfitte}
                            onChange={(e) => setStatSconfitte(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={chiudiModalStatistiche} color="inherit">Annulla</Button>
                        <Button type="submit" variant="contained" color="primary">Salva Modifiche</Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* Modal Gestione Note e Risultati Torneo */}
            <Dialog open={modalRisultatiAperto} onClose={chiudiModalRisultati} fullWidth maxWidth="sm">
                <DialogTitle fontWeight="bold" color="secondary.main">
                    Aggiorna Note e Risultati: {torneoSelezionato?.nome}
                </DialogTitle>
                <Box component="form" onSubmit={handleSalvaRisultati}>
                    <DialogContent dividers>
                        {erroreRisultati && <Alert severity="error" sx={{ mb: 2 }}>{erroreRisultati}</Alert>}
                        <TextField
                            required
                            fullWidth
                            multiline
                            rows={4}
                            label="Comunicazioni, Ultimi Risultati o Note Classifica"
                            value={testoRisultati}
                            onChange={(e) => setTestoRisultati(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={chiudiModalRisultati} color="inherit">Annulla</Button>
                        <Button type="submit" variant="contained" color="primary">Salva</Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Container>
    );
}
