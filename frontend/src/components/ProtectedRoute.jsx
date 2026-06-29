import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

//children è ciò che mostro se l'utente è autorizzato, allowedRoles è un array dei ruoli ammessi 
export default function ProtectedRoute({ children, allowedRoles }) {  

    //useContext gestisce lo stato globale per portare dati tra tutti i componenti
    const { user, loading } = useContext(AuthContext); //recupero i dati dell'user loggato e il valore di loading (perchè se il loading è true sta ancora controllando i cookie)

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress color="primary" />
            </Box>
        );
    }

    //se l'utente non è loggato
    if (!user) {
        return <Navigate to="/login" replace />;  //replace impedisce che si possa tornare indietro
    }

    //ruolo non presente tra i permessi
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    //Se supera i controlli manda al children con successo
    return children;
}