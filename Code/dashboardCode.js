window.addEventListener('DOMContentLoaded', () => {
    // Leer el parámetro ?ciudad= de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const ciudad = urlParams.get('ciudad');

    if (ciudad) {
        // Llamamos a la API con la ciudad seleccionada
        obtenerClima(ciudad);
    }
});

//Actualiza la fecha (hora del dispositivo)
function actualizarFecha() {
    const ahora = new Date();

    // Configuramos el formato de hora local
    const opciones = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };

    //Configuramos el formato de la fecha
    const opcionesFecha = {
        weekday: 'long', // Muestra el día completo
        day: 'numeric',  // Muestra el número del día
        month: 'long'    // Muestra el mes completo
    };
    
    //Undefined para que "coja" la hora del dispositivo
    let fechaString = ahora.toLocaleDateString(undefined, opcionesFecha);
    const horaString = ahora.toLocaleTimeString(undefined, opciones); 
 
    // Actualizamos el contenido del span
    document.getElementById('fecha').textContent = fechaString;
    document.getElementById('reloj').textContent = horaString.toUpperCase();
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
    const url2 = `https://api.openweathermap.org/data/2.5/forecast?q=${ciudad}&appid=${apiKey}&units=metric&lang=es`;

    try {
        const respuesta = await fetch(url);

        // Si la respuesta no es 200
        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            throw new Error(errorData.message);
        }

        const datos = await respuesta.json();

        //Hacemos la llamada a la API para obtener la previsión por horas
        const respForecast = await fetch(url2);

        // Si la respuesta no es 200
        if (!respForecast.ok) {
            const errorData = await respForecast.json();
            throw new Error(errorData.message);
        }

        const forecast = await respForecast.json();


        mostrarClima(datos, forecast, ciudad);
    } catch (error) {
        console.error("Error al obtener el clima:", error.message);
        alert("Error: " + error.message);
    }
}

//Muestra en el dashboard los datos obtenidos en el JSON de OpenWeather
async function mostrarClima(datos, forecast, ciudad) {
    console.log(JSON.stringify(datos, null, 2));
    console.log(JSON.stringify(forecast, null, 2));

    //Ajustamos los datos principales a los de la ciudad
    document.getElementById("ciudad").innerHTML = ciudad;
    document.getElementById("pais").innerHTML = datos.sys.country;

    const iconCode = datos.weather[0].icon;
    document.getElementById('icono-clima').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    document.getElementById("descrip").innerHTML = datos.weather[0].description;
    document.getElementById("pop").innerHTML = "Probabilidad de lluvia: " + Math.round(forecast.list[0].pop * 100) + "%";

    //Ajustamos los datos de temperatura
    document.getElementById('temp-main').innerHTML = datos.main.temp.toFixed(0);
    document.getElementById("temp-min").innerHTML = datos.main.temp_min.toFixed(0);
    document.getElementById("temp-max").innerHTML = datos.main.temp_max.toFixed(0);

    //Ajustamos los datos extra
    document.getElementById('sensacion').innerHTML = datos.main.feels_like.toFixed(0) + "°C";
    document.getElementById("humedad").innerHTML = datos.main.humidity +"%";
    document.getElementById("presion").innerHTML = datos.main.pressure +" hPa";
    //Calculamos el viento en km/h (la api lo da en m/s)
    document.getElementById("vel-viento").innerHTML = (datos.wind.speed * 3600 / 1000).toFixed(0) + " km/h";
    //Calculamos la visibilidad en km (la api lo da en m)
    document.getElementById("visibilidad").innerHTML = (datos.visibility / 1000).toFixed(0) + " km";
    //Obtenemos el índice UV
    const indice = await obtenerIndiceUV(datos.coord.lat, datos.coord.lon);

    //Tabla de rangos de índice UV
    const nivelesUV = [
    { max: 2, texto: "(Bajo)" },
    { max: 5, texto: "(Moderado)" },
    { max: 7, texto: "(Alto)" },
    { max: 10, texto: "(Muy alto)" },
    { max: Infinity, texto: "(Extremo)" }
    ];

    const nivel = nivelesUV.find(rango => indice <= rango.max)?.texto;

    document.getElementById("indice_uv").innerHTML = indice + " " + nivel;
}

//Hace una llamada a OpenWeather para obtener el índice UV de la ciudad
async function obtenerIndiceUV(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=uv_index`;
    
    const respuesta = await fetch(url);
    
    if (!respuesta.ok) {
      throw new Error(`Error en la petición: ${respuesta.status}`);
    }
    
    const datos = await respuesta.json();
    
    // Extrae el valor del índice UV del objeto 'current'
    const indiceUV = datos.current.uv_index;
    
    return indiceUV;
  } catch (error) {
    console.error("No se pudo obtener el índice UV:", error);
    return null;
  }
}