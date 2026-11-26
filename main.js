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
ipcMain.handle('guardar-key', async(event, key) => {
    if (!key || key.trim() === "") {
        return { success: false, error: "La API Key no puede estar vacía." };
    }

    //Hacemos una llamada a OpenWeather para probar si la api key es válida
    const urlPrueba = `https://api.openweathermap.org/data/2.5/weather?q=Madrid&appid=${key}`;

    try {
        const respuesta = await fetch(urlPrueba);
        
        // Si OpenWeather responde con un código distinto a 200, la key es inválida
        if (!respuesta.ok) {
            return { success: false, error: `Error al validar la API Key (Código: ${respuesta.status})` };
        }

        //Si la key es VÁLIDA, procedemos a guardarla en el JSON
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

        fs.writeFileSync(rutaArchivo, JSON.stringify(configuracionExistente, null, 2));
        
        return { success: true, apiKey: configuracionExistente.apiKey };

    } catch (error) {
        console.error("Error de red al intentar validar la API Key:", error);
        return { success: false, error: "No se pudo conectar con OpenWeather para validar la key." };
    }
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

// Elimina una ciudad del array ciudadesDefault en el JSON
ipcMain.handle('eliminar-ciudad', async (event, ciudadAEliminar) => {
    try {
        const carpetaUsuario = app.getPath('userData');
        const rutaArchivo = path.join(carpetaUsuario, 'config-eolotime.json');

        if (!fs.existsSync(rutaArchivo)) {
            return { success: false, error: "El archivo de configuración no existe" };
        }

        const contenido = fs.readFileSync(rutaArchivo, 'utf8');
        let config = JSON.parse(contenido);

        // Si existe el array, filtramos para quitar la ciudad seleccionada
        if (config.ciudadesDefault && Array.isArray(config.ciudadesDefault)) {
            config.ciudadesDefault = config.ciudadesDefault.filter(c => c !== ciudadAEliminar);
        }

        // Guardamos el JSON actualizado
        fs.writeFileSync(rutaArchivo, JSON.stringify(config, null, 2), 'utf8');

        return { success: true, ciudades: config.ciudadesDefault };
    } catch (error) {
        console.error("Error al eliminar la ciudad:", error);
        return { success: false, error: error.message };
    }
});

//Guarda el fondo seleccionado por el usuario
ipcMain.handle('guardar-fondo', async (event, nuevoFondo) => {
    const rutaArchivo = path.join(app.getPath('userData'), 'config-eolotime.json');
    console.log("Fondo recibido en el backend:", nuevoFondo);
    
    let config = {};

    try {
        // Si ya existe el archivo, leemos su contenido actual
        if (fs.existsSync(rutaArchivo)) {
            const contenido = fs.readFileSync(rutaArchivo, 'utf8');
            if (contenido.trim() !== "") {
                config = { ...config, ...JSON.parse(contenido) };
            }
        }

        // Actualizamos el fondo con el valor recibido
        config.background = nuevoFondo;

        // Guardamos el JSON actualizado
        fs.writeFileSync(rutaArchivo, JSON.stringify(config, null, 2), 'utf8');

        return { success: true, background: config.background };
    } catch (error) {
        console.error("Error al guardar el fondo:", error);
        return { success: false, error: error.message };
    }
});

//Guarda el modo de la fuente seleccionado por el usuario
ipcMain.handle('guardar-fuente', async (event, nuevoModo) => {
    const rutaArchivo = path.join(app.getPath('userData'), 'config-eolotime.json');
    console.log("Modo recibido en el backend:", nuevoModo);
    
    let config = {};

    try {
        // Si ya existe el archivo, leemos su contenido actual
        if (fs.existsSync(rutaArchivo)) {
            const contenido = fs.readFileSync(rutaArchivo, 'utf8');
            if (contenido.trim() !== "") {
                config = { ...config, ...JSON.parse(contenido) };
            }
        }

        // Actualizamos el fondo con el valor recibido
        config.modoFuente = nuevoModo;

        // Guardamos el JSON actualizado
        fs.writeFileSync(rutaArchivo, JSON.stringify(config, null, 2), 'utf8');

        return { success: true, datos: config.modoFuente };
    } catch (error) {
        console.error("Error al guardar el modo de fuente:", error);
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

// Guarda el nuevo orden de las ciudades en el JSON
ipcMain.handle('guardar-orden-ciudades', async (event, nuevasCiudades) => {
    try {
        const carpetaUsuario = app.getPath('userData');
        const rutaArchivo = path.join(carpetaUsuario, 'config-eolotime.json');
        
        let config = {};
        if (fs.existsSync(rutaArchivo)) {
            const contenido = fs.readFileSync(rutaArchivo, 'utf8');
            if (contenido.trim() !== "") {
                config = JSON.parse(contenido);
            }
        }

        // Actualizamos el array de ciudades con el nuevo orden recibido
        config.ciudadesDefault = nuevasCiudades;

        // Guardamos el JSON actualizado
        fs.writeFileSync(rutaArchivo, JSON.stringify(config, null, 2), 'utf8');

        return { success: true, ciudades: config.ciudadesDefault };
    } catch (error) {
        console.error("Error al guardar el orden de las ciudades:", error);
        return { success: false, error: error.message };
    }
});

//Inicializa un fondo default o lee el que el usuario eligió
ipcMain.handle('obtener-fondo', async () => {
        if (fs.existsSync(rutaArchivo)) {
        try {
            const contenido = fs.readFileSync(rutaArchivo, 'utf8');
            let config = JSON.parse(contenido);

            // Solo añadimos el fondo si NO existe ya en el JSON
            if (!config.background) {
                config.background = "neda-unsplash-soleado.jpg";
                fs.writeFileSync(rutaArchivo, JSON.stringify(config, null, 2));
            }
            
            return { status: 'success', datos: config.background };
        } catch (e) {
            console.error("Error al inicializar fondo:", e);
            return null;
        }
    }
    return null;
});

//Lee el color de la fuente
ipcMain.handle('leer-modo-fuente', async () => {
    if (fs.existsSync(rutaArchivo)) {
        try {
            const contenido = fs.readFileSync(rutaArchivo, 'utf8');
            let config = JSON.parse(contenido);

            // Solo añadimos el modo si no existía ya
            if (!config.modoFuente) {
                config.modoFuente = "Normal";
                fs.writeFileSync(rutaArchivo, JSON.stringify(config, null, 2));
                return { success: true, datos: config.modoFuente };
            }
            
            return { success: true, datos: config.modoFuente };
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