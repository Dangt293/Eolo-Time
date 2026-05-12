const { app, BrowserWindow, ipcMain, shell } = require('electron');
const fs = require('fs');
const path = require('path');

//Carpeta de usuario y archivo conf. usuario
const carpetaUsuario = app.getPath('userData');
const rutaArchivo = path.join(carpetaUsuario, 'config-eolotime.json');

//La función createWindow() carga tu página web en una nueva instancia BrowserWindow:
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false, //Se crea oculta para evitar el salto visual
    // Favicono
    icon: path.join(__dirname, 'assets/Favicono.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.maximize();
  win.show(); //Se muestra a pantalla completa
  win.loadFile('index.html');
}

//Llama la función cuando la app este libre
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Al salir de todas las ventanas se cierra una aplicación por completo
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Función para guardar la Key de OpenWeather
ipcMain.on('guardar-key', (event, key) => {
    const carpetaUsuario = app.getPath('userData');
    const rutaArchivo = path.join(carpetaUsuario, 'config-eolotime.json');
    
    let configuracionExistente = {};

    //Intentamos leer lo que ya existe
    if (fs.existsSync(rutaArchivo)) {
        try {
            const contenido = fs.readFileSync(rutaArchivo, 'utf8');
            configuracionExistente = JSON.parse(contenido);
        } catch (e) {
            console.error("Error al leer el archivo actual, se creará uno nuevo.");
        }
    }

    // Modificamos SOLO el campo de la API Key, manteniendo el resto
    configuracionExistente.apiKey = key;

    //Guardamos el objeto completo de nuevo
    fs.writeFileSync(rutaArchivo, JSON.stringify(configuracionExistente, null, 2)); // El 'null, 2' hace que el JSON sea legible
});

// Función para leer la Key de OpenWeather
ipcMain.handle('leer-key', () => {
    if (fs.existsSync(rutaArchivo)) {
        const contenido = fs.readFileSync(rutaArchivo, 'utf8');
        const objeto = JSON.parse(contenido);
        return objeto.apiKey;
    }
    return null;
});

//Para deridigir a navegador
ipcMain.on('abrir-link-externo', (event, url) => {
  shell.openExternal(url);
});