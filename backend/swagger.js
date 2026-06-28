const Prenotazione = require('./models/Prenotazione');

const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Mixed-Zone API documentazione',
    version: '1.0.0',
    description: 'Documentazione automatica delle API per la piattaforma Mixed-Zone',
    contact: { name: 'Gruppo Erasmo e Davide' }
  },
  host: 'localhost:5000',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Inserire il token JWT nel formato: Bearer <tuo_token>'
    }
  },

definitions: {
    User: {
      name: "Cliente",
      email: "cliente@test.com",
      role: "Cliente",
      creazione: "2026-06-28T12:00:00.000Z"
    },
    Campo: {
      nome: "Campo centrale",
      tipologia: "5vs5",
      prezzoAllOra: 5,
      isVisibile: true,
      oscuratoDaAdmin: false
    },
    Prenotazione: {
      campoId: "CampoId",
      utenteId: "UtenteId",
      data: "2026-06-29",
      slotOrario: "18:30 - 20:00"
    },
    Partita: {
      CampoId: "CampoId",
      data: "2026-06-29",
      ora: "18:30 - 20-30",
      organizzatore: "UtenteId",
      Prenotazione: "PrenotazioneId",
      GiocatorIscritti: ["UtenteID"],
      GiocatoriRichiesti: 1,
      StatoPartita: "In attesa"
    },
    SquadraIscritta: {
      NomeSquadra: "Squadra",
      Capitano: "UtenteId",
      Punti: 5,
      PartiteGiocate: 3,
      Vittorie: 3,
      Pareggi: 0,
      Sconfitte: 1
    },
    Torneo: {
      Nome: "Torneo",
      Organizzatore: "UtenteId",
      SquadreIscritte: ["Squadra"],
      RisultatiEClassifica: "Iniziato",
      isVisibile: true,
    }
  }
};

const outputFile = './swagger-output.json'; //Il file JSON che verrà generato da solo
const endpointsFiles = ['./index.js']; //Il punto di partenza da cui partono tutte le rotte

//Genera il file e poi (opzionale) avvia il server
swaggerAutogen(outputFile, endpointsFiles, doc);
