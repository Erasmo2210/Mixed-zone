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
            main: '#0284c7',
            light: '#38bdf8',
            dark: '#0369a1',
            contrastText: '#ffffff'
        },
        secondary: {
            main: '#0f172a', 
            light: '#334155',
            dark: '#020617',
            contrastText: '#ffffff'
        },
        background: {
            default: '#f8fafc',
            paper: '#ffffff',
        },
        text: {
            primary: '#0f172a',
            secondary: '#475569'
        }
    },
    shape: {
        borderRadius: 12
    },
    typography: {
        fontFamily: '"Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 700,
        },
        h5: {
            fontWeight: 700,
        },
        h6: {
            fontWeight: 600,
        },
        button: {
            fontWeight: 600,
            textTransform: 'none'
        }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 12px 0 rgba(2, 132, 199, 0.15)',
                    }
                },
                containedSecondary: {
                    '&:hover': {
                        boxShadow: '0 4px 12px 0 rgba(15, 23, 42, 0.15)',
                    }
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 4px 20px 0 rgba(15, 23, 42, 0.05)',
                    border: '1px solid rgba(15, 23, 42, 0.06)',
                }
            }
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(8px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: 'none',
                }
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 16,
                    boxShadow: '0 10px 30px 0 rgba(15, 23, 42, 0.1)',
                }
            }
        }
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