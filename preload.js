const { contextBridge, shell, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    saveKey: (key) => ipcRenderer.invoke('guardar-key', key),
    getKey: () => ipcRenderer.invoke('leer-key'),
    openExternal: (url) => ipcRenderer.send('abrir-link-externo', url),
    inicializarCiudades: () => ipcRenderer.invoke('inicializar-datos-defecto'),
    guardarCiudad: (ciudad) => ipcRenderer.invoke('guardar-ciudad', ciudad),
    eliminarCiudad: (ciudad) => ipcRenderer.invoke('eliminar-ciudad', ciudad),
    guardarOrdenCiudades: (nuevoOrden) => ipcRenderer.invoke('guardar-orden-ciudades', nuevoOrden),
    obtenerFondo: () => ipcRenderer.invoke('obtener-fondo'),
    guardarFondo: (nombreFondo) => ipcRenderer.invoke('guardar-fondo', nombreFondo),
    getModoFuente: () => ipcRenderer.invoke('leer-modo-fuente'),
    guardarModoFuente: (modoFuente) => ipcRenderer.invoke('guardar-fuente', modoFuente)
});