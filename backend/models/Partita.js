//Importo Mongoose per usarne i metodi
const mongoose = require('mongoose');

//Definisco lo schema per le partite
const partitaSchema = new mongoose.Schema({
    campo: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Campo', //Referenza che punta all' id del campo
        required: true
    },
    data: {
        type: Date,
        required: true
    },
    ora: {
        type: String,
        required: true
    },
    organizzatore: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', //Referenza che punta all' id del cliente organizzatore
        required: true
    },
    prenotazione: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prenotazione'
    },
    giocatoriIscritti: [{  //Array di ID dei clienti che si uniscono progressivamente
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  //Referenza a quegli utenti
    }],
    giocatoriRichiesti: {
        type: Number,
        default: 1
    },
    statoPartita: {
        type: String,
        enum: ['In cerca di giocatori', 'Al completo', 'Annullata'], //stato della ricerca
        default: 'In cerca di giocatori'
    }
}, {
    timestamps: true  //tengo traccia della creazione
});

//Mappo l'entità nel db e esporto per poterlo usare fuori dal file
module.exports = mongoose.model('Partita', partitaSchema);