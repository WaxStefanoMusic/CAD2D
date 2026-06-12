# CAD 2D

Applicazione desktop di disegno tecnico 2D, basata su Electron.

In questa repository convivono **sorgente** e **installer pubblici**: il codice e' visibile,
gli installer compilati si trovano nella sezione [Releases](../../releases) e l'app
installata li scarica automaticamente all'avvio quando esce una nuova versione.

## Sviluppo

```bash
npm install        # installa le dipendenze
npm start          # avvia l'app in modalita' sviluppo
npm run dist       # compila l'installer (output in ./Installer)
npm run release    # build + pubblica nuova Release su GitHub (auto-update)
```

## Aggiornamenti automatici

All'avvio l'app interroga questa repository: se la versione installata e' inferiore
all'ultima `Release` mostra una finestra di dialogo nativa e propone di scaricare
e installare il nuovo installer. Il check si puo' lanciare anche manualmente dal
menu **Aggiornamenti > Cerca aggiornamenti**.

## Licenza

Il codice e' rilasciato sotto licenza proprietaria (vedi `LICENSE`). Uso del binario
consentito ai soli fini personali, senza diritto di redistribuzione.
