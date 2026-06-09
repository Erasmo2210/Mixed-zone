import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider } from './context/AuthContext.jsx';  //importo il provider per il contesto di autenticazione
import CssBaseline from '@mui/material/CssBaseline';   //importo il CssBaseline per sovrascrivere il css del browser col nostro

//Il tema della nostra applicazione
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#2e7d32', //Verde (Erasmo è daltonico)
        },
        secondary: {
            main: '#1a237e', 
        },
        background: {
            default: '#f5f5f5', 
        }
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    }
});

//Renderizzo l' applicazione all'interno del div "root" dell'index.html
ReactDOM.createRoot(document.getElementById('root')).render(  // createRoot fa assumere a react il controllo del div
  <React.StrictMode> 
    <ThemeProvider theme={theme}>
      <CssBaseline /> 
      <AuthProvider>  
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);