# CAD 2D

Applicazione desktop di disegno tecnico 2D, basata su Electron.

Questa è la repo del **sorgente** (privata). Gli installer pubblici per il download
si trovano nella repo separata:
**https://github.com/WaxStefanoMusic/CAD2D-Releases**

## Sviluppo

```bash
npm install        # installa le dipendenze
npm start          # avvia l'app in modalita' sviluppo
npm run dist       # compila l'installer (output in ./Installer)
npm run release    # build + pubblica nuova Release su GitHub (auto-update)
```

## Aggiornamenti automatici

L'app installata controlla la repo `CAD2D-Releases` all'avvio. Quando trova una
versione superiore alla propria, mostra una finestra di dialogo nativa e propone
di scaricare e installare il nuovo installer.
