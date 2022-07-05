const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('API', {
  gen: value => ipcRenderer.invoke('gen', value),
  select: () => ipcRenderer.invoke('select'),
});
