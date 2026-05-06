const { app, BrowserWindow } = require('electron');

//La función createWindow() carga tu página web en una nueva instancia BrowserWindow:
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  })

  win.loadFile('index.html')
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