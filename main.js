const { app, BrowserWindow, Menu, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

// Disabilita l'accelerazione GPU solo se da' problemi su alcune GPU vecchie.
// app.disableHardwareAcceleration();

let mainWindow = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    show: false,                     // mostra solo dopo aver massimizzato (evita flicker)
    backgroundColor: '#0d1117',
    autoHideMenuBar: true,           // niente barra menu (premi Alt per mostrarla)
    title: 'CAD 2D',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      // File System Access API (showSaveFilePicker) funziona perche' file:// e' secure context.
      spellcheck: false
    }
  });

  // Apri sempre a finestra intera (massimizzata).
  win.maximize();
  win.once('ready-to-show', () => { win.maximize(); win.show(); });

  // Fallback nativo: se il salvataggio passa da un download (showSaveFilePicker
  // non disponibile), forza la finestra "Salva con nome" nativa.
  win.webContents.session.on('will-download', (event, item) => {
    item.setSaveDialogOptions({ defaultPath: item.getFilename() });
  });

  win.loadFile(path.join(__dirname, 'renderer', 'CAD2D.html'));

  // Apri i link esterni nel browser di sistema, non in finestre Electron.
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  mainWindow = win;
  win.on('closed', () => { mainWindow = null; });
}

// ======================================================================
//  AGGIORNAMENTI AUTOMATICI (electron-updater + GitHub Releases)
//  - All'avvio controlla la repo pubblica CAD2D-releases.
//  - Se trova una versione superiore: dialog nativo "Vuoi aggiornare?"
//  - In caso affermativo scarica l'installer in background e, a download
//    completato, chiede "Installa ora" (chiude e riavvia con la nuova versione).
// ======================================================================
function setupAutoUpdater() {
  // Niente verifica codice (l'installer non e' firmato): autoUpdater dei
  // pacchetti NSIS non firmati funziona comunque scaricando l'exe e
  // rilanciandolo come fa un installer normale.
  autoUpdater.autoDownload = false;       // chiediamo conferma prima di scaricare
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info) => {
    dialog.showMessageBox(mainWindow || undefined, {
      type: 'info',
      buttons: ['Scarica e installa', 'Più tardi'],
      defaultId: 0,
      cancelId: 1,
      title: 'Aggiornamento disponibile',
      message: `È disponibile la versione ${info.version} di CAD 2D.`,
      detail: 'Vuoi scaricarla e installarla ora? L’app si chiuderà per completare l’aggiornamento.'
    }).then(r => {
      if (r.response === 0) autoUpdater.downloadUpdate();
    });
  });

  autoUpdater.on('update-not-available', () => {
    // silenzioso (non disturba l'utente quando e' gia' aggiornato)
  });

  autoUpdater.on('error', (err) => {
    // niente alert: errori di rete o nessuna release ancora pubblicata.
    console.warn('[updater]', err && err.message);
  });

  autoUpdater.on('download-progress', (p) => {
    if (mainWindow) {
      mainWindow.setProgressBar(Math.max(0, Math.min(1, p.percent / 100)));
    }
  });

  autoUpdater.on('update-downloaded', () => {
    if (mainWindow) mainWindow.setProgressBar(-1);
    dialog.showMessageBox(mainWindow || undefined, {
      type: 'info',
      buttons: ['Installa ora', 'Al prossimo avvio'],
      defaultId: 0,
      cancelId: 1,
      title: 'Aggiornamento pronto',
      message: 'Il nuovo installer e’ stato scaricato.',
      detail: 'Vuoi installarlo subito? L’app verra’ chiusa e riaperta nella nuova versione.'
    }).then(r => {
      if (r.response === 0) autoUpdater.quitAndInstall();
    });
  });

  // Controlla subito all'avvio (silenziosamente: l'utente vede il dialog
  // SOLO se c'e' davvero un aggiornamento).
  autoUpdater.checkForUpdates().catch(() => {});
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null); // nessun menu applicazione di default
  createWindow();

  // Avvia il controllo aggiornamenti solo quando l'app e' confezionata
  // (in sviluppo non c'e' alcun installer da scaricare).
  if (app.isPackaged) setupAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
