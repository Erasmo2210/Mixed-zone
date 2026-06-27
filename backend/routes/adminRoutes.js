const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Campo = require('../models/Campo');
const Torneo = require('../models/Torneo');
//Importo auth con i middleware per la verifica del token e controllo ruolo
const { verificaToken, isAdmin } = require('../middleware/auth');

//API moderazione utenti
router.get('/utenti', verificaToken, isAdmin, async (req, res) => {
    try {
        const utenti = await User.find({}, 'name email role isActive createdAt updatedAt');
        res.json(utenti);
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero degli utenti.', error: error.message });
    }
});

router.put('/utenti/:id/stato', verificaToken, isAdmin, async (req, res) => {
    try {
        const { isActive } = req.body;

        if (isActive === undefined) {
            return res.status(400).json({ message: 'Il campo isActive è obbligatorio nel body.' });
        }

        //Cerco e aggiorno lo stato dell'utente
        const utente = await User.findById(req.params.id);
        if (!utente) {
            return res.status(404).json({ message: 'Utente non trovato.' });
        }

        if (utente._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Non puoi disattivare il tuo stesso account di Amministratore.' });
        }

        utente.isActive = isActive;
        await utente.save();

        const azione = isActive ? 'attivato' : 'disattivato';
        res.json({
            message: `Account utente ${azione} con successo.`,
            utente: {
                id: utente._id,
                name: utente.name,
                email: utente.email,
                role: utente.role,
                isActive: utente.isActive,
                createdAt: utente.createdAt,
                updatedAt: utente.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante la moderazione utente.', error: error.message });
    }
});

//API moderazione campi da calcio
router.put('/campi/:id/oscura', verificaToken, async (req, res) => {
    try {
        const { isVisibile, oscuratoDaAdmin } = req.body;
        const utenteLoggato = req.user; //ottengo l'utente loggato

        if (utenteLoggato.role !== 'Admin' && utenteLoggato.role !== 'Gestore') {  //non faccio accedere ai clienti alla sezione modifica visibilità
            return res.status(403).json({ message: 'Accesso negato. Solo Admin e Gestori possono modificare i campi.' });
        }

        if (isVisibile === undefined) {
            return res.status(400).json({ message: 'Il campo isVisibile è obbligatorio.' });
        }

        const campo = await Campo.findById(req.params.id);
        if (!campo) {
            return res.status(404).json({ message: 'Campo da calcio non trovato.' });
        }

        if (utenteLoggato.role === 'Gestore') {
            if (campo.gestore.toString() !== utenteLoggato._id.toString()) {
                return res.status(403).json({ message: 'Accesso negato. Non sei il proprietario di questo campo.' });
            }

            if (campo.oscuratoDaAdmin === true && isVisibile === true) {
                return res.status(403).json({
                    message: "Operazione negata. Questo campo è stato bloccato dall'amministratore e non può essere riattivato da te."
                });
            }
        }

        campo.isVisibile = isVisibile;

        if (utenteLoggato.role === 'Admin') {
            if (oscuratoDaAdmin !== undefined) {
                campo.oscuratoDaAdmin = oscuratoDaAdmin;
            } else {
                campo.oscuratoDaAdmin = !isVisibile;
            }
        }

        await campo.save();

        const stato = isVisibile ? 'reso visibile' : 'oscurato';
        res.json({ message: `Il campo è stato ${stato} dall'amministratore.`, campo });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante l\'oscuramento del campo.', error: error.message });
    }
});

//API moderazione tornei
router.put('/tornei/:id/oscura', verificaToken, isAdmin, async (req, res) => {
    try {
        const { isVisibile } = req.body;

        if (isVisibile === undefined) {
            return res.status(400).json({ message: 'Il campo isVisibile è obbligatorio.' });
        }

        const torneo = await Torneo.findById(req.params.id);
        if (!torneo) {
            return res.status(404).json({ message: 'Torneo non trovato.' });
        }

        torneo.isVisibile = isVisibile;
        await torneo.save();

        const stato = isVisibile ? 'reso visibile' : 'oscurato';
        res.json({ message: `Il torneo è stato ${stato} dall'amministratore.`, torneo });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante l\'oscuramento del torneo.', error: error.message });
    }
});

module.exports = router;