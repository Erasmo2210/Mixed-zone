import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import {
    Container,
    Typography,
    CircularProgress,
    Alert,
    Box,
    Paper,
    Stack,
    Chip,
} from '@mui/material';

export default function Prenotazioni() {
    const [prenotazioni, setPrenotazioni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errore, setErrore] = useState('');

    useEffect(() => {
        const recuperaPrenotazioni = async () => {
            try {
                const dati = await apiFetch('/prenotazioni/mie');
                setPrenotazioni(dati);
            } catch (err) {
                setErrore(err.message || 'Impossibile caricare le tue prenotazioni.');
            } finally {
                setLoading(false);
            }
        };

        recuperaPrenotazioni();
    }, []);

    const formatoData = (data) => new Date(data).toLocaleDateString('it-IT', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    const coloreStato = (stato) => {
        if (stato === 'Confermata') return 'success';
        if (stato === 'Rifiutata' || stato === 'Scaduta') return 'error';
        if (stato === 'In attesa di giocatori') return 'info';
        return 'warning';
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
                Le tue prenotazioni
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                Visualizza tutte le tue richieste di prenotazione e lo stato aggiornato di ciascuna.
            </Typography>

            {errore && <Alert severity="error" sx={{ mb: 3 }}>{errore}</Alert>}

            {!loading && prenotazioni.length === 0 && !errore && (
                <Alert severity="info">Non hai ancora effettuato prenotazioni.</Alert>
            )}

            <Stack spacing={2}>
                {prenotazioni.map((prenotazione) => (
                    <Paper key={prenotazione._id} elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                            <Box>
                                <Typography variant="h6" fontWeight="bold" color="primary.main">
                                    {prenotazione.campo?.nome || 'Campo non disponibile'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {prenotazione.campo?.posizione || 'Posizione non disponibile'}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Data: <strong>{formatoData(prenotazione.data)}</strong>
                                </Typography>
                                <Typography variant="body2">
                                    Orario: <strong>{prenotazione.oraInizio}</strong>
                                </Typography>
                            </Box>

                            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                                <Chip
                                    label={prenotazione.stato || 'In attesa di conferma dal gestore'}
                                    color={coloreStato(prenotazione.stato)}
                                    sx={{ fontWeight: 'bold' }}
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Prezzo: €{prenotazione.campo?.prezzoAllOra || '0'} / ora
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                ))}
            </Stack>
        </Container>
    );
}
