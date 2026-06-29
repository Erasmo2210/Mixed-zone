# Diagramma di sequenza - Mixed-Zone Web App

## Panoramica funzionale
La web app consente a tre tipologie di utenti di interagire con una piattaforma sportiva:
- Cliente: registrazione, login, visualizzazione campi, prenotazione, matchmaking, iscrizione ai tornei.
- Gestore: gestione campi, gestione prenotazioni, creazione tornei, aggiornamento classifiche e risultati.
- Admin: moderazione utenti, campi e tornei.

## Diagramma Mermaid
```mermaid
sequenceDiagram
    autonumber
    actor U as Utente
    participant FE as Frontend (React)
    participant Auth as AuthContext / API
    participant BE as Backend (Express)
    participant DB as MongoDB
    participant WS as Socket.IO

    %% Registrazione/Login
    U->>FE: Accede / Registrati / Login
    FE->>Auth: invia credenziali
    Auth->>BE: POST /api/auth/register o /login
    BE->>DB: salva/legge utente
    DB-->>BE: risultato
    BE-->>Auth: token + dati utente
    Auth-->>FE: stato autenticazione aggiornato
    FE-->>U: mostra dashboard / home

    %% Cliente: visualizza campi e prenota
    alt Ruolo = Cliente
        U->>FE: apre pagina Campi
        FE->>BE: GET /api/campi
        BE->>DB: recupera campi visibili
        DB-->>BE: elenco campi
        BE-->>FE: campi disponibili
        FE-->>U: mostra lista campi

        U->>FE: compila prenotazione
        FE->>BE: POST /api/prenotazioni
        BE->>DB: controlla campo e disponibilità
        DB-->>BE: disponibilità/slot
        BE->>DB: salva prenotazione
        alt giocatori sufficienti = false
            BE->>DB: crea partita automatica in cerca di giocatori
        end
        BE-->>FE: conferma prenotazione
        FE-->>U: mostra stato prenotazione
    end

    %% Gestore: gestisce campi e prenotazioni
    alt Ruolo = Gestore
        U->>FE: apre Dashboard
        FE->>BE: GET /api/campi + GET /api/prenotazioni/gestore
        BE->>DB: recupera campi del gestore e prenotazioni associate
        DB-->>BE: dati
        BE-->>FE: elenco dati gestionali
        FE-->>U: mostra dashboard

        U->>FE: crea/aggiorna campo
        FE->>BE: POST/PUT /api/campi
        BE->>DB: salva/aggiorna campo
        DB-->>BE: conferma
        BE-->>FE: esito
        FE-->>U: mostra successo

        U->>FE: conferma o rifiuta prenotazione
        FE->>BE: PUT /api/prenotazioni/:id/conferma o /rifiuta
        BE->>DB: aggiorna stato prenotazione
        DB-->>BE: conferma
        BE-->>FE: esito
        FE-->>U: aggiorna stato
    end

    %% Matchmaking in tempo reale
    alt Cliente entra in Matchmaking
        U->>FE: apre pagina Matchmaking
        FE->>BE: GET /api/partite
        BE->>DB: recupera partite in cerca di giocatori
        DB-->>BE: elenco partite
        BE-->>FE: partite aperte
        FE-->>U: mostra lobby

        U->>FE: clicca Unisciti al Match
        FE->>BE: POST /api/partite/:id/unisciti
        BE->>DB: aggiorna partecipanti e stato partita
        BE->>WS: emit lobbyAggiornata
        WS-->>FE: aggiornamento live
        FE-->>U: aggiorna formazione e posti mancanti
    end

    %% Tornei
    alt Ruolo = Gestore o Cliente
        U->>FE: apre pagina Tornei
        FE->>BE: GET /api/tornei
        BE->>DB: recupera tornei visibili o gestiti
        DB-->>BE: elenco tornei
        BE-->>FE: tornei
        FE-->>U: mostra tornei

        alt Ruolo = Gestore
            U->>FE: crea torneo
            FE->>BE: POST /api/tornei
            BE->>DB: salva torneo
            DB-->>BE: conferma
            BE-->>FE: esito
        else Ruolo = Cliente
            U->>FE: iscrive squadra al torneo
            FE->>BE: POST /api/tornei/:id/iscriviti
            BE->>DB: aggiunge squadra iscritta
            DB-->>BE: conferma
            BE-->>FE: esito
        end
    end

    %% Admin
    alt Ruolo = Admin
        U->>FE: apre Dashboard Admin
        FE->>BE: GET /api/admin/utenti + GET /api/tornei
        BE->>DB: recupera utenti, campi, tornei
        DB-->>BE: dati
        BE-->>FE: elenco
        FE-->>U: mostra pannello admin

        U->>FE: attiva/disattiva utente o oscura/riattiva campo/torneo
        FE->>BE: PUT /api/admin/utenti/:id/stato o /campi/:id/oscura o /tornei/:id/oscura
        BE->>DB: aggiorna stato
        DB-->>BE: conferma
        BE-->>FE: risultato
        FE-->>U: mostra aggiornamento
    end
```

## Riepilogo dei flussi descritti
- Autenticazione e autorizzazione basata su JWT.
- Prenotazione di campi da parte dei clienti.
- Gestione delle prenotazioni da parte dei gestori.
- Matchmaking in tempo reale con Socket.IO.
- Gestione tornei e classifiche.
- Moderazione amministrativa centralizzata.