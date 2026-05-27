const express = require('express');
const router = express.Router();
const Prenotazione = require('../models/Prenotazione');
const Campo = require('../models/Campo');
//Importo auth.js
const { verificaToken, isCliente, isGestore } = require('../middleware/auth');


//API prenotazione
router.post('/', verificaToken, isCliente, async (req, res) => { //middleware da auth.js inseriti per proteggere la rotta
    try {
        const { campoId, data, oraInizio } = req.body;

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
        const nuovaPrenotazione = new Prenotazione({
            campo: campoId,
            cliente: req.user._id, //preso in automatico dal token 
            data: new Date(data),
            oraInizio
        });

        await nuovaPrenotazione.save();
        res.status(201).json({ message: 'Prenotazione effettuata con successo', prenotazione: nuovaPrenotazione });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante la prenotazione.', error: error.message });
    }
});


//Api prenotazioni effettuate
router.get('/mie', verificaToken, isCliente, async (req, res) => {
    try {
        const prenotazioni = await Prenotazione.find({ cliente: req.user._id })
            .populate('campo')   //Mostro i dettagli del campo invece dell'id 
            .sort({ data: -1 }); //Ordino dalle più recenti alle più vecchie (-1 è ordine decrescente)
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

        let prenotazioniRicevute = [];
        
        for (const campoId of campiIds) {
            const prenotazioniDelCampo = await Prenotazione.find({ campo: campoId })
            .populate('campo')    //Mostro i dettagli del campo invece dell'id 
            .populate('cliente', 'name email');   //Mostro nome ed email del cliente invece dell'id
            
            prenotazioniRicevute.push(...prenotazioniDelCampo); //lo spread operator (...) fonde solo gli elementi degli array, e non gli array stessi
        }
        
        //Ordino le prenotazioni dalla più imminente alla più lontana
        prenotazioniRicevute.sort((a, b) => new Date(a.data) - new Date(b.data)); //se il risultato è negativo a viene prima di b, se è positivo b viene prima di a
        res.json(prenotazioniRicevute);
        
        } catch (error) {
            res.status(500).json({ message: 'Errore nel recupero delle prenotazioni dei campi.', error: error.message });
        }
    });

module.exports = router;