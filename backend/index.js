//import funzionalità
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');  //Modulo nativo di Node.js per creare il server HTTP
const { Server } = require('socket.io'); //Importa la classe Server da Socket.IO
require('dotenv').config(); //Serve per caricare le variabili d'ambienete da .env
//import delle rotte
const authRoutes = require('./routes/authRoutes'); 
const campoRoutes = require('./routes/campoRoutes'); 
const prenotazioneRoutes = require('./routes/prenotazioneRoutes'); 
const torneoRoutes = require('./routes/torneoRoutes');
const partitaRoutes = require('./routes/partitaRoutes');
const adminRoutes = require('./routes/adminRoutes');
//import di swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

//Inizializzazioni
const app = express();
const server = http.createServer(app); //Creo un server http, necessario per integrare Socket.IO 

//Integrazione di Socket.IO per la comunicazione in tempo reale
const io = new Server(server, {
    cors: {
        origin: "*", // Qui url del frontend
        methods: ["GET", "POST"]
    }
});
app.use((req, res, next) => {  //rendo le req http capaci di emettere eventi in tempo reale tramite Socket.IO
    req.io = io;
    next();
});

//Middleware globali e rotte
app.use(cors()); //Permette al frontend di comunicare con il backend anche se sono su domini diversi
app.use(express.json()); //Permette al server di leggere i dati in formato JSON
app.use('/api/auth', authRoutes); 
app.use('/api/campi', campoRoutes);  
app.use('/api/prenotazioni', prenotazioneRoutes); 
app.use('/api/tornei', torneoRoutes);
app.use('/api/partite', partitaRoutes);
app.use('/api/admin', adminRoutes);


//Gestione delle connessioni WebSocket
io.on('connection', (socket) => {  //quando un client si connette, si apre l'evento connection e si mantiene la connessione
    //l'oggetto socket è lo specifico utente connesso
    console.log(`Un utente si è connesso in tempo reale: ${socket.id}`);
    
    socket.on('disconnect', () => {  //quando un client si disconnette, si apre l'evento disconnect e si chiude la connessione
        console.log(`Utente disconnesso: ${socket.id}`);
    });
});

//inizializzazione di Swagger per la documentazione delle API 
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Mixed-Zone API Documentation',
            version: '1.0.0',
            description: 'Documentazione ufficiale delle API REST per la piattaforma di gestione campi e matchmaking Mixed-Zone',
            contact: { name: 'Gruppo Erasmo e Davide' }
        },
        servers: [
            { url: 'http://localhost:5000', description: 'Server di Sviluppo Locale' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: { 
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    //Swagger legge le API all'interno di routes
    apis: ['./routes/*.js'] 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
//Swagger è visualizzabile alla rotta /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//Connessione a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connesso con successo a MongoDB Atlas'))
    .catch((err) => console.error('Errore di connessione al database:', err));

//faccio partire il server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server Mixed-Zone in esecuzione sulla porta ${PORT}`);
    console.log(`Documentazione API interattiva disponibile su: http://localhost:5000/api-docs`);
});