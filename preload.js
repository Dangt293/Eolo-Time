const { contextBridge, shell, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    saveKey: (key) => ipcRenderer.send('guardar-key', key),
    getKey: () => ipcRenderer.invoke('leer-key'),
    openExternal: (url) => ipcRenderer.send('abrir-link-externo', url),
    inicializarCiudades: () => ipcRenderer.invoke('inicializar-datos-defecto')
});