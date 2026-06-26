//Importo JWT e il modello User per le verifiche
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

//API registrazione
router.post('/register', async (req, res) => {   //funzione asincrona (richiede await) e parametri Express
    try {
        const { name, email, password, role } = req.body;

        //Controllo l'email
        const emailEsistente = await User.findOne({ email: email }); //Controllo se esiste un utente con la mail estratta
        if (emailEsistente) {
            return res.status(400).json({ message: 'Questa email è già registrata.' });
        }

        //Hashing della password
        const salt = await bcrypt.genSalt(10); //Genero una stringa casuale nella pw
        const hashedPassword = await bcrypt.hash(password, salt);

        //Creo il nuovo utente
        const ruoliPermessi = ['Cliente', 'Gestore'];
        const ruoloFinale = ruoliPermessi.includes(role) ? role : 'Cliente';

        const nuovoUtente = new User({
            name,
            email,
            password: hashedPassword,
            role: ruoloFinale   //Default "Cliente" se non specificato
        });

        //Salvo l'utente registrato nel db
        await nuovoUtente.save();
        res.status(201).json({ message: 'Utente registrato con successo!' });

    } catch (error) {
        res.status(500).json({ message: 'Errore del server durante la registrazione.', error: error.message });
    }
});


//API login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        //Verifico la mail
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ message: 'Credenziali non valide.' });
        }

        //Verifico la password
        const passwordCorretta = await bcrypt.compare(password, user.password);
        if (!passwordCorretta) {
            return res.status(400).json({ message: 'Credenziali non valide.' });
        }

        //Verifico stato
        if (!user.isActive) {
            return res.status(403).json({ message: 'Questo account è stato disattivato' });
        }


        //Creo il token
        const token = jwt.sign(
            { id: user._id, role: user.role },  //mantengo id e ruolo
            process.env.JWT_SECRET,  //chiave segreta da .env
            { expiresIn: '24h' }  //scadenza del token
        );

        //Risposta al frontend
        res.json({
            token, //invio la stringa del token
            user: {  //invio alcuni dati dell'utente
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Errore del server durante il login.', error: error.message });
    }
});

module.exports = router;