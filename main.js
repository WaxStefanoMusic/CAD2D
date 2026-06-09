const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

// Disabilita l'accelerazione GPU solo se da' problemi su alcune GPU vecchie.
// app.disableHardwareAcceleration();

let mainWindow = null;
let _manualUpdateCheck = false;

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    show: false,                     // mostra solo dopo aver massimizzato (evita flicker)
    backgroundColor: '#0d1117',
    autoHideMenuBar: true,           // niente barra menu di sistema (Alt per mostrarla)
    title: 'CAD 2D',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
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
// ======================================================================
function setupAutoUpdater() {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info) => {
    _manualUpdateCheck = false;
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

  autoUpdater.on('update-not-available', (info) => {
    if (_manualUpdateCheck) {
      _manualUpdateCheck = false;
      dialog.showMessageBox(mainWindow || undefined, {
        type: 'info',
        buttons: ['OK'],
        title: 'Aggiornamenti',
        message: 'Sei già alla versione più recente.',
        detail: `Versione installata: ${app.getVersion()}`
      });
    }
  });

  autoUpdater.on('error', (err) => {
    const msg = (err && err.message) || String(err);
    if (_manualUpdateCheck) {
      _manualUpdateCheck = false;
      dialog.showMessageBox(mainWindow || undefined, {
        type: 'warning',
        buttons: ['OK'],
        title: 'Errore controllo aggiornamenti',
        message: 'Impossibile verificare gli aggiornamenti.',
        detail: msg
      });
    } else {
      console.warn('[updater]', msg);
    }
  });

  autoUpdater.on('download-progress', (p) => {
    if (mainWindow) mainWindow.setProgressBar(Math.max(0, Math.min(1, p.percent / 100)));
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

  // Controllo automatico all'avvio (silenzioso).
  autoUpdater.checkForUpdates().catch(() => {});
}

// IPC: il renderer chiama questa quando l'utente clicca "Aggiornamenti".
ipcMain.handle('check-for-updates', async () => {
  if (!app.isPackaged) {
    dialog.showMessageBox(mainWindow || undefined, {
      type: 'info',
      buttons: ['OK'],
      title: 'Aggiornamenti',
      message: 'Controllo aggiornamenti disabilitato in modalità sviluppo.'
    });
    return { ok: true, dev: true };
  }
  _manualUpdateCheck = true;
  try {
    await autoUpdater.checkForUpdates();
    return { ok: true };
  } catch (e) {
    _manualUpdateCheck = false;
    return { ok: false, error: e.message };
  }
});

ipcMain.handle('get-app-version', () => app.getVersion());

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
  if (app.isPackaged) setupAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
