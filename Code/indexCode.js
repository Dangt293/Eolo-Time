//Actualiza el reloj (hora del dispositivo)
function actualizarReloj() {
    const ahora = new Date();
    
    // Configuramos el formato de hora local
    const opciones = { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
    };
    
    const horaString = ahora.toLocaleTimeString(undefined, opciones); //Undefined para que "coja" la hora del dispositivo
    
    // Actualizamos el contenido del span
    document.getElementById('reloj').textContent = horaString.toUpperCase();
}

async function comprobarApi() {
    const key = await window.api.getKey();
    
    if (!key) {
        window.location.href = "Pages/indicarApiKey.html";
    }
}