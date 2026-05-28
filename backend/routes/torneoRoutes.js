const express = require('express');
const router = express.Router();
const Torneo = require('../models/Torneo');
const { verificaToken, isCliente, isGestore } = require('../middleware/auth');

//API creazione torneo
router.post('/', verificaToken, isGestore, async (req, res) => {
    try {
        const { nome } = req.body; //recupero il nome del torneo dal corpo della richiesta

        const nuovoTorneo = new Torneo({
            nome,
            organizzatore: req.user._id 
        });

        await nuovoTorneo.save();
        res.status(201).json({ message: 'Torneo creato con successo', torneo: nuovoTorneo });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante la creazione del torneo.', error: error.message });
    }
});


//API Iscrizione a un torneo
router.post('/:id/iscriviti', verificaToken, isCliente, async (req, res) => {
    try {
        const { nomeSquadra } = req.body;
        const torneo = await Torneo.findById(req.params.id); //recupero il torneo a cui il cliente si sta iscrivendo

        if (!torneo || !torneo.isVisibile) {
            return res.status(404).json({ message: 'Torneo non disponibile.' });
        }

        //pusho la squadra del cliente nell'array delle squadre iscritte al torneo
        torneo.squadreIscritte.push({
            nomeSquadra,
            capitano: req.user._id //capitano
        });

        await torneo.save();
        res.json({ message: 'Squadra iscritta con successo', torneo });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante l\'iscrizione della squadra.', error: error.message });
    }
});

//API aggiornamento risultati e classifica torneo
router.put('/:id/aggiorna-squadra/:squadraId', verificaToken, isGestore, async (req, res) => {
    try {
        const { punti, partiteGiocate, vittorie, pareggi, sconfitte } = req.body;
        const torneo = await Torneo.findById(req.params.id);

        if (!torneo) {
            return res.status(404).json({ message: 'Torneo non trovato.' });
        }

        //Controllo proprietario del torneo
        if (torneo.organizzatore.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Non sei l\'organizzatore di questo torneo.' });
        }

        //cerco per id la squadra che ha l'id della req
        const squadra = torneo.squadreIscritte.id(req.params.squadraId);
        if (!squadra) {
            return res.status(404).json({ message: 'Squadra non trovata nel torneo.' });
        }

        //Se i campi sono presenti nella req, aggiorno le statistiche
        if (punti !== undefined) squadra.punti = punti;
        if (partiteGiocate !== undefined) squadra.partiteGiocate = partiteGiocate;
        if (vittorie !== undefined) squadra.vittorie = vittorie;
        if (pareggi !== undefined) squadra.pareggi = pareggi;
        if (sconfitte !== undefined) squadra.sconfitte = sconfitte;

        await torneo.save();
        res.json({ message: 'Statistiche e classifica aggiornate con successo', torneo });
    } catch (error) {
        res.status(500).json({ message: 'Errore nell\'aggiornamento dei risultati.', error: error.message });
    }
});

//API recupero tornei visibili
router.get('/', verificaToken, async (req, res) => {
    try {
        const tornei = await Torneo.find({ isVisibile: true }).populate('organizzatore', 'name');
        res.json(tornei);
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero dei tornei.', error: error.message });
    }
});

module.exports = router;