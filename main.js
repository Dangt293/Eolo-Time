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

// *ESCRITURA*
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

//Guarda en el array de ciudades una nueva
ipcMain.handle('guardar-ciudad', async (event, nuevaCiudad) => {
    try {
        const carpetaUsuario = app.getPath('userData');
        const rutaConfig = path.join(carpetaUsuario, 'config-eolotime.json');

        // Estructura base por defecto
        let config = { ciudadesDefault: [] };

        // Si el archivo ya existe, lo leemos de forma segura
        if (fs.existsSync(rutaConfig)) {
            const contenido = fs.readFileSync(rutaConfig, 'utf-8');
            
            if (contenido.trim() !== "") {
                const parsed = JSON.parse(contenido);
                
                // Si el JSON guardado es directamente un array, lo adaptamos
                if (Array.isArray(parsed)) {
                    config.ciudadesDefault = parsed;
                } 
                // Si es un objeto, cogemos su contenido
                else if (parsed && typeof parsed === 'object') {
                    config = parsed;
                }
            }
        }

        // Evitar duplicados en el backend por seguridad
        const yaExiste = config.ciudadesDefault.some(
            c => c.toLowerCase() === nuevaCiudad.toLowerCase()
        );

        if (!yaExiste) {
            config.ciudadesDefault.push(nuevaCiudad);
        }

        // Escribimos los cambios limpios en el archivo JSON
        fs.writeFileSync(rutaConfig, JSON.stringify(config, null, 2), 'utf-8');
        console.log(`Ciudad "${nuevaCiudad}" guardada correctamente.`);

        return { success: true, ciudades: config.ciudadesDefault };

    } catch (error) {
        console.error("Error al guardar la ciudad en el JSON:", error);
        return { success: false, error: error.message };
    }
});

// *LECTURA*
// Función para leer la Key de OpenWeather
ipcMain.handle('leer-key', () => {
    if (fs.existsSync(rutaArchivo)) {
        const contenido = fs.readFileSync(rutaArchivo, 'utf8');
        const objeto = JSON.parse(contenido);
        return objeto.apiKey;
    }
    return null;
});

// *COMBINADA LECTURA Y ESCRITURA*
//Inicializa las 4 ciudades default
ipcMain.handle('inicializar-datos-defecto', async () => {
    if (fs.existsSync(rutaArchivo)) {
        try {
            const contenido = fs.readFileSync(rutaArchivo, 'utf8');
            let config = JSON.parse(contenido);

            // Solo añadimos las ciudades si NO existen ya en el JSON
            if (!config.ciudadesDefault) {
                config.ciudadesDefault = ["Madrid, ES", "Barcelona, ES", "Bilbao, ES", "Sevilla, ES"];
                fs.writeFileSync(rutaArchivo, JSON.stringify(config, null, 2));
                return { status: 'creadas', datos: config.ciudadesDefault };
            }
            
            return { status: 'existian', datos: config.ciudadesDefault };
        } catch (e) {
            console.error("Error al inicializar datos:", e);
            return null;
        }
    }
    return null;
});

// *OTROS*
//Para deridigir a navegador
ipcMain.on('abrir-link-externo', (event, url) => {
  shell.openExternal(url);
});