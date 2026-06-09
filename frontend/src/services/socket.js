import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

//Inizializzo il socket disattivando la connessione automatica
export const socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket'] //forzo l'uso del solo websocket, elimino il long-polling (le chiamate http di controllo al server)
});