//Importo Mongoose per usarne i metodi
const mongoose = require('mongoose');

//Definisco lo schema per le prenotazioni
const prenotazioneSchema = new mongoose.Schema({
    campo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campo',  //Referenza che punta all' id del campo
        required: true
    },
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  //Referenza che punta all' id del cliente che prenota
        required: true
    },
    data: {
        type: Date,
        required: [true, 'La data della prenotazione è obbligatoria']
    },
    oraInizio: {
        type: String,
        required: true
    },
    stato: {
        type: String,
        enum: ['Confermata', 'Annullata'], //stato della prenotazione 
        default: 'Confermata'
    }
}, {
    timestamps: true //tengo traccia della creazione
});

//Mappo l'entità nel db e esporto per poterlo usare fuori dal file
module.exports = mongoose.model('Prenotazione', prenotazioneSchema);