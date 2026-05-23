//Importo Mongoose per usarne i metodi
const mongoose = require('mongoose');

//Definisco lo schema per gli utenti
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Il nome è obbligatorio'],
        trim: true   //Rimuovo spazi
    },
    email: {
        type: String,
        required: [true, "L'email è obbligatoria"],
        unique: true, //No email duplicate
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'La password è obbligatoria']
    },
    role: {
        type: String,
        enum: ['Cliente', 'Gestore', 'Admin'],
        default: 'Cliente'
    },
    isActive: {
        type: Boolean,
        default: true //Stato di visibilità dell'account
    }
}, {
    timestamps: true //tengo traccia della creazione
});

//Mappo l'entità nel db e esporto per poterlo usare fuori dal file
module.exports = mongoose.model('User', userSchema);