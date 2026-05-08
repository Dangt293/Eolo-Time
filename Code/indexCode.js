//Actualiza el reloj (hora del dispositivo)
function actualizarReloj() {
    const ahora = new Date();
    
    // Configuramos el formato de hora local
    const opciones = { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
    };
    
    const horaString = ahora.toLocaleTimeString(undefined, opciones);
    
    // Actualizamos el contenido del span
    document.getElementById('reloj').textContent = horaString.toUpperCase();
}