const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); //Serve per caricare le variabili d'ambienete da .env

const app = express();

//Middleware
app.use(cors());
app.use(express.json()); //Permette al server di leggere i dati in formato JSON

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Backend pronto per il Giorno 3!');
});

app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});