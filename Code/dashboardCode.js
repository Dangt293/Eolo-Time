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

    //Cargamos el pronóstico por horas
    obtenerPronosticoHoras(forecast);

    //Cargamos el pronóstico de los 5 próximos días
    const diasFuturos = obtenerPronostico5Dias(forecast);
    let html = "";

    diasFuturos.forEach(diaFuturo => {
        // Formatear la fecha para mostrar el día
        const fechaObj = new Date(diaFuturo.fecha + 'T00:00:00');
        const fecha = fechaObj.getDate() +"/"+ fechaObj.getMonth() +"/"+ fechaObj.getFullYear();
        const icono = obtenerIconoBootstrap(diaFuturo.icono);

        html += `
            <div class="forecast-day d-flex justify-content-between align-items-center py-2 border-bottom border-white border-opacity-10">
            <span class="fecha-col">${fecha}</span>

            <i class="bi ${icono} fs-5"></i>

            <div class="d-flex flex-column align-items-end temp-col text-nowrap">
                <span class="text-danger fw-semibold">
                    ${diaFuturo.temp_max}° <i class="bi bi-arrow-up"></i>
                </span>
                <span class="text-info fw-semibold">
                    ${diaFuturo.temp_min}° <i class="bi bi-arrow-down"></i>
                </span>
            </div>
        </div>
        `;
    });

    document.getElementById("pronostico-dias").innerHTML = html;

    //Desactiva el spinner de carga y muestra el contenido
    document.getElementById("spinner").style.display = "none";
    document.getElementById("capaSpinner").style.setProperty('display', 'none', 'important');
    document.getElementById("contenido-principal").classList.remove("d-none");
    document.getElementById("footer").classList.remove("d-none");
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

//Obtiene el pronóstico de las próximas 24h en bloques de 3 horas
function obtenerPronosticoHoras(forecast) {
    const ahoraEnSegundos = Math.floor(Date.now() / 1000);

    //Obtiene los siguientes 8 tramos a partir de la hora actual
    const proximosTramos = forecast.list.filter(item => item.dt > ahoraEnSegundos).slice(0, 9);

    let html = '';

    proximosTramos.forEach(tramo => {
        // Formatear hora a HH:mm
        const fecha = new Date(tramo.dt * 1000);
        const hora = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        
        const temp = Math.round(tramo.main.temp);
        const codIcono = tramo.weather[0].icon;

        const icono = obtenerIconoBootstrap(codIcono);

        html += `
            <div class="hourly-item">
                <small class="text-white-50">${hora}</small>
                    <i class = "bi ${icono} d-block my-2 fs-4"></i>
                    <strong>${temp}°</strong>
            </div>
        `;
    });

    document.getElementById('pronostico-horas').innerHTML = html;
}

//Obtiene el pronóstico principal de los próximos 5 días
function obtenerPronostico5Dias(forecast) {
    const resumenDias = {};

    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    const hoyString = `${año}-${mes}-${dia}`;

    forecast.list.forEach(item => {
        // Obtenemos la fecha en formato "YYYY-MM-DD"
        const fecha = item.dt_txt.split(' ')[0];

        if (fecha == hoyString) return; //Se asegura de no incluir el día de hoy

        if (!resumenDias[fecha]) {
            resumenDias[fecha] = {
                fecha: fecha,
                temp_min: Math.round(item.main.temp_min),
                temp_max: Math.round(item.main.temp_max),
                icono: item.weather[0].icon
            };
        } else {
            // Actualizamos la temperatura mínima y máxima del día completo
            if (item.main.temp_min < resumenDias[fecha].temp_min) {
                resumenDias[fecha].temp_min = Math.round(item.main.temp_min);
            }
            if (item.main.temp_max > resumenDias[fecha].temp_max) {
                resumenDias[fecha].temp_max = Math.round(item.main.temp_max);
            }
        }

        // Si el tramo es cercano al mediodía (12:00 o 15:00), usamos su icono como el "principal"
        if (item.dt_txt.includes("12:00:00") || item.dt_txt.includes("15:00:00")) {
            resumenDias[fecha].icono = item.weather[0].icon;
        }
    });

    //Convertimos el objeto en un Array y tomamos los primeros 5 días, ya que dependiendo la hora de a la que consultemos puede devolver 6
    return Object.values(resumenDias).slice(0, 5);
}

//Asigna un icono de bootstrap a cada código de icono que devuelve la API
function obtenerIconoBootstrap(codigoIcono) {
    const mapa = {
        '01d': 'bi-sun',               // Soleado día
        '01n': 'bi-moon-stars',         // Despejado noche
        '02d': 'bi-cloud-sun',          // Algo nublado día
        '02n': 'bi-cloud-moon',         // Algo nublado noche
        '03d': 'bi-cloud',              // Nublado
        '03n': 'bi-cloud',
        '04d': 'bi-clouds',             // Muy nublado
        '04n': 'bi-clouds',
        '09d': 'bi-cloud-drizzle',      // Llovizna
        '09n': 'bi-cloud-drizzle',
        '10d': 'bi-cloud-rain',         // Lluvia
        '10n': 'bi-cloud-rain',
        '11d': 'bi-cloud-lightning',    // Tormenta
        '11n': 'bi-cloud-lightning',
        '13d': 'bi-snowflake',          // Nieve
        '13n': 'bi-snowflake',
        '50d': 'bi-cloud-haze',         // Niebla
        '50n': 'bi-cloud-haze'
    };

    return mapa[codigoIcono];
}