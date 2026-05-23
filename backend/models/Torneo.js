//Importo Mongoose per usarne i metodi
const mongoose = require('mongoose');

//schema embedded per gestire le squadre iscritte al torneo
const squadraIscrittaSchema = new mongoose.Schema({
    nomeSquadra: {
        type: String,
        required: [true, 'Il nome della squadra è obbligatorio'],
        trim: true //Rimuovo gli spazi vuoti 
    },
    capitano: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', //Collega la squadra al cliente che l'ha creata e iscritta
        required: true
    },

    //Campi classifica
    punti: {
        type: Number,
        default: 0 
    },
    partiteGiocate: {
        type: Number,
        default: 0
    },
    vittorie: {
        type: Number,
        default: 0
    },
    pareggi: {
        type: Number,
        default: 0
    },
    sconfitte: {
        type: Number,
        default: 0
    }
});

//Definisco lo schema per i tornei
const torneoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Il nome del torneo è obbligatorio'],
        trim: true
    },
    organizzatore: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', //Referenza che punta all' id del gestore
        required: true
    },
    squadreIscritte: [squadraIscrittaSchema],

    risultatiEClassifica: { 
        type: String, 
        default: "Torneo non ancora iniziato. Nessun risultato disponibile."
    },
    isVisibile: {
        type: Boolean,
        default: true // Permette all'Admin di oscurare tornei non conformi [cite: 133]
    }
}, {
    timestamps: true  //tengo traccia della creazione
});

//Mappo l'entità nel db e esporto per poterlo usare fuori dal file
module.exports = mongoose.model('Torneo', torneoSchema);