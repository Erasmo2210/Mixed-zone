const express = require('express');
const router = express.Router();
const Campo = require('../models/Campo');
//Importo auth.js
const { verificaToken, isGestore } = require('../middleware/auth');

//API creazione campi
router.post('/', verificaToken, isGestore, async (req, res) => {  //middleware da auth.js inseriti per proteggere la rotta
    try {
        const { nome, posizione, prezzoAllOra, capienza } = req.body;

        //req.user._id viene estratto dal token
        const nuovoCampo = new Campo({
            nome,
            posizione,
            prezzoAllOra,
            capienza,
            gestore: req.user._id 
        });

        await nuovoCampo.save();
        res.status(201).json({ message: 'Campo da calcio pubblicato con successo', campo: nuovoCampo });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante la pubblicazione del campo.', error: error.message });
    }
});


//API ricerca tutti i campi
router.get('/', verificaToken, async (req, res) => {
    try {
        const campi = await Campo.find({ isVisibile: true }).populate('gestore', 'name email'); //con populate mostro nome ed email del gestore invece dell'id
        res.json(campi);
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero dei campi.', error: error.message });
    }
});


//API aggiornamento campi 
router.put('/:id', verificaToken, isGestore, async (req, res) => {
    try {
        const { nome, posizione, prezzoAllOra, isVisibile, capienza } = req.body;
        
        //Ricerco il campo
        const campo = await Campo.findById(req.id || req.params.id); //recupero i dati o dall' id passato come parametro o da quello estratto dal token
        if (!campo) {
            return res.status(404).json({ message: 'Campo da calcio non trovato.' });
        }

        //Controllo il gestore
        if (campo.gestore.toString() !== req.user._id.toString()) {  //toString per confrontare i due ObjectId come stringhe, altirmenti controllerebbe indirizzi in memoria
            return res.status(403).json({ message: 'Azione negata. Non sei il proprietario di questo campo.' });
        }

        //Aggiorno i campi passati nella richiesta, se non presenti li lascio uguali
        campo.nome = nome || campo.nome;
        campo.posizione = posizione || campo.posizione;
        campo.prezzoAllOra = prezzoAllOra || campo.prezzoAllOra;
        campo.capienza = capienza || campo.capienza;
        if (isVisibile !== undefined) campo.isVisibile = isVisibile; //Gestisco l'oscuramento se isVisibile è passato nella richiesta

        await campo.save();
        res.json({ message: 'Campo aggiornato con successo', campo });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante l\'aggiornamento del campo.', error: error.message });
    }
});

module.exports = router;