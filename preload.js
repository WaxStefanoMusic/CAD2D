// Preload: espone al renderer un piccolo set di API sicure (contextBridge)
// per il controllo aggiornamenti manuali.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  getAppVersion:   () => ipcRenderer.invoke('get-app-version')
});
