import React, { createContext, useState, useEffect } from 'react'; //importo i metodi nativi di react
import { apiFetch } from '../services/api';


export const AuthContext = createContext(null);  //creo la variabile per il contesto di default null

export const AuthProvider = ({ children }) => {  //con la parola chiave children indico che tutto ciò che sarà dentro i tag <AuthProvider> (quindi app) sarà considerato figlio
    const [user, setUser] = useState(null);      //user è la variabile per lo stato utente, setUser è la funzione per aggiornarlo, useState è il default
    const [loading, setLoading] = useState(true);  //come prima, ma di default è true perchè all'avvio l'app controlla lo stato di login

    //useEffect per definire lo stato all'avvio della web app
    useEffect(() => {
        const tokenSalvato = localStorage.getItem('token');
        const userSalvato = localStorage.getItem('user');

        if (tokenSalvato && userSalvato) {
            setUser(JSON.parse(userSalvato)); //parsing del JSON in oggetto
        }
        setLoading(false); //controllo terminato
    }, []);

    //Funzione per il login
    const login = async (email, password) => {
        try {
            //utilizzo la fetch
            const data = await apiFetch('/auth/login', {  //all'endpoint login verrà usata questa funzione
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            //Salvo i dati nel localStorage 
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            setUser(data.user);
            return data.user;  //feedback immediato nel componente frontend
        } catch (error) {
            throw error; 
        }
    };

    //funzione per la registrazione
    const register = async (name, email, password, role) => {
        try {
            await apiFetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name, email, password, role })
            });
        } catch (error) {
            throw error;
        }
    };

    //funzione logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    //l'intera applicazione è un children di AuhProvider e utilizzerà ciò che è aggiunto a value
    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};