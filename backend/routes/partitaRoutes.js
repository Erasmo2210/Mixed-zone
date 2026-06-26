const express = require('express');
const router = express.Router();
const Partita = require('../models/Partita');
const Campo = require('../models/Campo');
const Prenotazione = require('../models/Prenotazione');
const { verificaToken, isCliente } = require('../middleware/auth');

//API creazione partita
router.post('/', verificaToken, isCliente, async (req, res) => {
    try {
        const { campoId, data, ora, maxGiocatori, prenotazioneId } = req.body;

        //Verifico se il campo esiste ed è visibile
        const campo = await Campo.findOne({ _id: campoId, isVisibile: true });
        if (!campo) {
            return res.status(404).json({ message: 'Campo non disponibile o inesistente.' });
        }

        let prenotazioneAssociata = null;
        if (prenotazioneId) {
            prenotazioneAssociata = await Prenotazione.findById(prenotazioneId);
            if (!prenotazioneAssociata) {
                return res.status(404).json({ message: 'Prenotazione non trovata.' });
            }
            if (prenotazioneAssociata.stato !== 'Confermata') {
                return res.status(400).json({ message: 'La prenotazione deve essere confermata per aprire una partita.' });
            }
        }

        const nuovaPartita = new Partita({
            campo: campoId,
            data: new Date(data),
            ora,
            organizzatore: req.user._id,
            giocatoriIscritti: [req.user._id],
            giocatoriRichiesti: maxGiocatori || 10,
            prenotazione: prenotazioneAssociata?._id
        });

        await nuovaPartita.save();
        res.status(201).json({ message: 'Partita creata. In attesa di altri giocatori', partita: nuovaPartita });
    } catch (error) {
        res.status(500).json({ message: 'Errore nella creazione della partita.', error: error.message });
    }
});


//API recupero partite aperte
router.get('/', verificaToken, async (req, res) => {
    try {
        const partiteAperte = await Partita.find({ statoPartita: 'In cerca di giocatori' })
            .populate('campo')
            .populate('organizzatore', 'name')
            .populate('giocatoriIscritti', 'name');
        res.json(partiteAperte);
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero delle partite.', error: error.message });
    }
});


//API iscrizione alla partita
router.post('/:id/unisciti', verificaToken, isCliente, async (req, res) => {
    try {
        const partita = await Partita.findById(req.params.id);
        if (!partita) {
            return res.status(404).json({ message: 'Partita non trovata.' });
        }

        if (partita.statoPartita !== 'In cerca di giocatori') {
            return res.status(400).json({ message: 'Impossibile unirsi, la partita è chiusa o completata.' });
        }

        //Controllo se il cliente è già iscritto a questa partita
        if (partita.giocatoriIscritti.some(id => id.toString() === req.user._id.toString())) { //converto l'id in stringa per fre il confronto
            return res.status(400).json({ message: 'Ti sei già iscritto a questa partita.' });
        }

        //Aggiungo il cliente all'array dei partecipanti
        partita.giocatoriIscritti.push(req.user._id);

        const giocatoriExtra = partita.giocatoriIscritti.length - 1;
        if (giocatoriExtra >= partita.giocatoriRichiesti) {
            partita.statoPartita = 'Al completo';

            if (partita.prenotazione) {
                const prenotazioneCollegata = await Prenotazione.findById(partita.prenotazione);
                if (prenotazioneCollegata && prenotazioneCollegata.stato === 'In attesa di giocatori') {
                    prenotazioneCollegata.stato = 'In attesa di conferma dal gestore';
                    await prenotazioneCollegata.save();
                }
            }
        }

        await partita.save();

        const partitaAggiornata = await Partita.findById(partita._id).populate('giocatoriIscritti', 'name');

        //Emetto un evento in tempo reale con socket.io per aggiornare la lobby dei partecipanti
        req.io.emit('lobbyAggiornata', partitaAggiornata); //l'evento emit invia dati ai client in ascolto, lobby l'etichetta

        //aggiorno partita con quella aggiornata
        res.json({ message: 'Ti sei unito alla partita con successo', partita: partitaAggiornata });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante l\'iscrizione alla partita.', error: error.message });
    }
});

module.exports = router;