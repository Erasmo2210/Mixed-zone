//Importo Mongoose per usarne i metodi
const mongoose = require('mongoose');

//Definisco lo schema per i campi da calcio
const campoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Il nome del campo è obbligatorio'],
        trim: true  //Rimuovo spazi
    },
    posizione: {
        type: String,
        required: [true, 'La posizione/indirizzo è obbligatoria']
    },
    capienza: {
        type: String,
        enum: ['5vs5', '7vs7', '11vs11'],
        required: [true, 'La capienza è obbligatoria']
    },  
    prezzoAllOra: {
        type: Number,
        required: [true, "Il prezzo all'ora è obbligatorio"]
    },
    gestore: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', //Referenza che punta all' id dell' utente gestore
        required: true
    },
    isVisibile: {
        type: Boolean,
        default: true //Stato di visibilità del campo
    }
}, {
    timestamps: true //tengo traccia della creazione
});

//Mappo l'entità nel db e esporto per poterlo usare fuori dal file
module.exports = mongoose.model('Campo', campoSchema);