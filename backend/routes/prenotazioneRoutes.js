const express = require('express');
const router = express.Router();
const Prenotazione = require('../models/Prenotazione');
const Campo = require('../models/Campo');
const Partita = require('../models/Partita');
//Importo auth.js
const { verificaToken, isCliente, isGestore } = require('../middleware/auth');

//trasformo l'orario da stringhe a numeri
const trasformaOraPrenotazione = (oraInizio) => {
    const [ore, minuti] = (oraInizio || '00:00').split(':').map(Number);
    return { ore, minuti };
};

const aggiornaStatoScaduto = async (prenotazione) => {
    if (prenotazione.stato !== 'In attesa di giocatori') {
        return prenotazione;
    }

    const dataPrenotazione = new Date(prenotazione.data);
    const { ore, minuti } = trasformaOraPrenotazione(prenotazione.oraInizio);
    dataPrenotazione.setHours(ore, minuti, 0, 0);

    if (dataPrenotazione < new Date()) {
        prenotazione.stato = 'Scaduta';
        await prenotazione.save();
    }

    return prenotazione;
};

//API prenotazione
router.post('/', verificaToken, isCliente, async (req, res) => { //middleware da auth.js inseriti per proteggere la rotta
    try {
        const { campoId, data, oraInizio, giocatoriSufficienti, giocatoriMancanti } = req.body;

        //Verifico se il campo esiste ed è visibile
        const campo = await Campo.findOne({ _id: campoId, isVisibile: true });  //se non le rispetta entrambe la variabile campo è null
        if (!campo) {   //se campo è null dai errore
            return res.status(404).json({ message: 'Campo non disponibile o inesistente.' });
        }

        //Controllo fattibilità prenotazione
        const slotOccupato = await Prenotazione.findOne({  //controllo se esiste una prenotazione con tutti questi parametri
            campo: campoId,
            data: new Date(data),
            oraInizio: oraInizio,
            stato: 'Confermata'
        });

        if (slotOccupato) {
            return res.status(400).json({ message: 'Il campo è già prenotato per questo orario.' });
        }

        //Creo la prenotazione
        const statoPrenotazione = giocatoriSufficienti === true
            ? 'In attesa di conferma dal gestore'
            : 'In attesa di giocatori';

        const nuovaPrenotazione = new Prenotazione({
            campo: campoId,
            cliente: req.user._id,
            data: new Date(data),
            oraInizio,
            stato: statoPrenotazione,
            giocatoriSufficienti: Boolean(giocatoriSufficienti),
            giocatoriMancanti: Number(giocatoriMancanti || 0)
        });

        await nuovaPrenotazione.save();

        if (statoPrenotazione === 'In attesa di giocatori') {
            const partitaEsistente = await Partita.findOne({ prenotazione: nuovaPrenotazione._id });
            if (!partitaEsistente) {
                const partitaDaCreare = new Partita({
                    campo: campoId,
                    data: nuovaPrenotazione.data,
                    ora: nuovaPrenotazione.oraInizio,
                    organizzatore: req.user._id,
                    giocatoriIscritti: [req.user._id],
                    giocatoriRichiesti: Math.max(1, Number(nuovaPrenotazione.giocatoriMancanti || 0)),
                    prenotazione: nuovaPrenotazione._id
                });

                await partitaDaCreare.save();
            }
        }

        res.status(201).json({ message: 'Prenotazione effettuata con successo', prenotazione: nuovaPrenotazione });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante la prenotazione.', error: error.message });
    }
});


//Api prenotazioni effettuate
router.get('/mie', verificaToken, isCliente, async (req, res) => {
    try {
        const prenotazioni = await Prenotazione.find({ cliente: req.user._id })
            .populate('campo')
            .sort({ data: -1 });

        for (const prenotazione of prenotazioni) {
            await aggiornaStatoScaduto(prenotazione);
        }

        res.json(prenotazioni);
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero delle tue prenotazioni.', error: error.message });
    }
});


//API prenotazioni ricevute dal gestore
router.get('/gestore', verificaToken, isGestore, async (req, res) => {
    try {
        //Recupero i campi del gestore loggato
        const mieiCampi = await Campo.find({ gestore: req.user._id });
        //Con .map modifico l'array mantenendo solo gli id dei campi
        const campiIds = mieiCampi.map(campo => campo._id); 

        const prenotazioniRicevute = await Prenotazione.find({ campo: { $in: campiIds } })
            .populate('campo')
            .populate('cliente', 'name email');

        for (const prenotazione of prenotazioniRicevute) {
            await aggiornaStatoScaduto(prenotazione);
        }

        prenotazioniRicevute.sort((a, b) => new Date(a.data) - new Date(b.data));
        res.json(prenotazioniRicevute);
        
        } catch (error) {
            res.status(500).json({ message: 'Errore nel recupero delle prenotazioni dei campi.', error: error.message });
        }
    });

router.put('/:id/conferma', verificaToken, isGestore, async (req, res) => {
    try {
        const prenotazione = await Prenotazione.findById(req.params.id).populate('campo');
        if (!prenotazione) {
            return res.status(404).json({ message: 'Prenotazione non trovata.' });
        }

        if (!prenotazione.campo || prenotazione.campo.gestore.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Non puoi gestire una prenotazione di un altro campo.' });
        }

        prenotazione.stato = 'Confermata';
        await prenotazione.save();

        res.json({ message: 'Prenotazione confermata.', prenotazione });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante la conferma della prenotazione.', error: error.message });
    }
});

router.put('/:id/rifiuta', verificaToken, isGestore, async (req, res) => {
    try {
        const prenotazione = await Prenotazione.findById(req.params.id).populate('campo');
        if (!prenotazione) {
            return res.status(404).json({ message: 'Prenotazione non trovata.' });
        }

        if (!prenotazione.campo || prenotazione.campo.gestore.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Non puoi gestire una prenotazione di un altro campo.' });
        }

        prenotazione.stato = 'Rifiutata';
        await prenotazione.save();

        res.json({ message: 'Prenotazione rifiutata.', prenotazione });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante il rifiuto della prenotazione.', error: error.message });
    }
});

module.exports = router;