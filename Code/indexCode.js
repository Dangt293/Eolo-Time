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
    }else {
        //Comprobamos que existan las ciudades en el JSON
        const resultado = await window.api.inicializarCiudades();
        
        if (resultado && resultado.datos) {
            //Limpiamos el contenedor por si acaso
            document.getElementById('ciudadesCards').innerHTML = '';
            
            //Recorremos el array de ciudades y pedimos el clima de cada una
            for (const ciudad of resultado.datos) {
                await obtenerClima(ciudad); // El 'await' aquí obliga a esperar a que termine una para ir a la otra, manteniendo el orden
            }
        }
    }
}

//Hace una llamada a OpenWeather para obtener datos de la ciudad
async function obtenerClima(ciudad) {
    //Obtener la clave desde AppData
    const apiKey = await window.api.getKey();

    if (!apiKey) {
        console.error("No se encontró la API Key");
        window.location.href = "Pages/indicarApiKey.html";
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${apiKey}&units=metric&lang=es`;

    try {
        const respuesta = await fetch(url);

        // Si la respuesta no es 200
        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            throw new Error(errorData.message);
        }

        const datos = await respuesta.json();
        mostrarClima(datos, ciudad);
    } catch (error) {
        console.error("Error al obtener el clima:", error.message);
        alert("Error: " + error.message);
    }
}

//Muestra los datos de la ciudad
function mostrarClima(datos, ciudadSolicitada) {
    const contenedor = document.getElementById('ciudadesCards');
    const ciudad = ciudadSolicitada; //Para evitar nombres en inglés
    //Extraemos lo necesario
    const pais = datos.sys.country;
    const temp = Math.round(datos.main.temp);
    const descripcion = datos.weather[0].description;
    const iconoOriginal = datos.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconoOriginal}@2x.png`;

    // Creamos el HTML de la tarjeta
    const tarjetaHTML = `
      <div class="col animate__animated animate__fadeIn">
        <div class="card h-100 glass-card p-2 position-relative"> 
        <div class="d-flex justify-content-between align-items-start">
            <div>
            <h4 class="mb-0">${ciudad}</h4>
            <small class="text-white-50">${pais}</small>
            </div>
        </div>
        <div class="text-center my-2">
            <img src="${iconUrl}" alt="${descripcion}" style="width: 80px;">
            <div class="temp-main">${temp}°C</div>
            <p class="text-capitalize">${descripcion}</p>
        </div>
        
        <a href="Pages/dashboard.html?ciudad=${ciudad}" class="btn btn-outline-light w-100 border-0 bg-white bg-opacity-10 stretched-link">
            Ver detalles <i class="bi bi-arrow-right ms-2"></i>
        </a>
        </div>
    </div>
    `;

    //Insertamos al final del contenedor
    contenedor.insertAdjacentHTML('beforeend', tarjetaHTML);
}