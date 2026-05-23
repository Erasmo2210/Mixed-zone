//Importo JWT e il modello User per le verifiche
const jwt = require('jsonwebtoken');
const User = require('../models/User');

//File dei middleware

//Verifico il token e lo stato dell'account
const verificaToken = async (req, res, next) => {  //funzione asincrona (richiede await) e parametri Express
    const authHeader = req.header('Authorization'); //recupero l'autorizzazione dall'header
    let token;
    if (authHeader) {  //recupero solo la stringa del token dall'authorization
        const parti = authHeader.split(' ');
        token = parti[1];
    } else {
        token = undefined;
    }

    //Blocco se non c'è il token
    if (!token) {
        return res.status(401).json({ message: 'Accesso negato. Token mancante.' });
    }

    //Paragono il token con la chiave segreta in process.env
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        //Controllo sul database se l'utente esiste ed è attivo
        const user = await User.findById(verified.id);  //await attende una risposta prima di continuare (con async)
        if (!user || !user.isActive) {
            return res.status(403).json({ message: 'Utente non trovato o account disattivato.' });
        }

        //Salvo l'utente nella richiesta per mantenerlo disponibile
        req.user = user;
        
        next(); //Passo al prossimo middleware o alla rotta finale
    } catch (error) {
        res.status(400).json({ message: 'Token non valido o scaduto.' });
    }
};

//Verifico se l'utente ha il ruolo di "Cliente"
const isCliente = (req, res, next) => {  
    if (req.user.role !== 'Cliente') {
        return res.status(403).json({ message: 'Accesso negato. Devi essere un cliente.' });
    }
    next();
};
//Verifico se l'utente ha il ruolo di "Gestore"
const isGestore = (req, res, next) => { 
    if (req.user.role !== 'Gestore') {
        return res.status(403).json({ message: 'Accesso negato. Devi essere un gestore.' });
    }
    next();
};

//Verifico se l'utente ha il ruolo di 'Admin'
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Accesso negato. Devi essere un admin.' });
    }
    next();
};

//Esporto i middleware per poterli usare fuori dal file
module.exports = { verificaToken, isCliente, isGestore, isAdmin };