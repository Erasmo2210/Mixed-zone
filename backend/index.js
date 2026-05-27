const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); //Serve per caricare le variabili d'ambienete da .env
const authRoutes = require('./routes/authRoutes'); 
const campoRoutes = require('./routes/campoRoutes'); 
const prenotazioneRoutes = require('./routes/prenotazioneRoutes'); 

const app = express();

//Middleware
app.use(cors()); //Permette al frontend di comunicare con il backend anche se sono su domini diversi
app.use(express.json()); //Permette al server di leggere i dati in formato JSON
app.use('/api/auth', authRoutes); 
app.use('/api/campi', campoRoutes);  
app.use('/api/prenotazioni', prenotazioneRoutes); 

//Connessione a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connesso con successo a MongoDB Atlas!'))
    .catch((err) => console.error('Errore di connessione al database:', err));

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Server Mixed-Zone Online');
});

app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});