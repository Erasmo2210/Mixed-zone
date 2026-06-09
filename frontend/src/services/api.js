//URL base del backend Node.js
const BASE_URL = 'http://localhost:5000/api';

//Funzione per le fetch
//endpoint indica che accetta in input un indirizzo specifico del backend, options indica che la funzione accetta parametri extra altrimenti {} oggetot vuoto
export const apiFetch = async (endpoint, options = {}) => { 
    
    const token = localStorage.getItem('token');

    //Configurazione headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers //spread operator per unire altri campi headers all' oggetto in maniera orizzontale
    };

    //se c'è un token nel local storage, aggiungo all'ggetto headers il campo Authorization con il token in formato Bearer
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options, //spread operator per unire le options all' oggetto 
        headers
    };

    try {

        const response = await fetch(`${BASE_URL}${endpoint}`, config);  //effettuo la fetch, che come detto prima accetta un endpoint e delle options

        //se la risposta non è ok (stato 400-500) ottengo il messaggio di errore dal backend e lo lancio come eccezione
        if (!response.ok) { 
            const erroreDati = await response.json().catch(() => ({}));  //provo a convertire la risposta in JSON, se fallisce restituisco un oggetto vuoto
            const messaggioErrore = erroreDati.message || `Errore HTTP Stato: ${response.status}`;
            throw new Error(messaggioErrore);
        }

        //se la risposta è ok (stato 200-299), converto i dati nel JSON
        return await response.json();

    } catch (error) {
        console.error(`Errore API su ${endpoint}:`, error.message);
        throw error; 
    }
};