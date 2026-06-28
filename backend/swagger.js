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
  }
};

const outputFile = './swagger-output.json'; //Il file JSON che verrà generato da solo
const endpointsFiles = ['./index.js']; //Il punto di partenza da cui partono tutte le rotte

//Genera il file e poi (opzionale) avvia il server
swaggerAutogen(outputFile, endpointsFiles, doc);