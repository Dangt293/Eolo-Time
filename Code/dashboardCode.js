window.addEventListener('DOMContentLoaded', () => {
    // Leer el parámetro ?ciudad= de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const ciudad = urlParams.get('ciudad');

    if (ciudad) {
        // Llamamos a la API con la ciudad seleccionada
        obtenerClima(ciudad);
    }
});

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
function mostrarClima(datos, forecast, ciudad) {
    console.log(JSON.stringify(datos, null, 2));
    console.log(JSON.stringify(forecast, null, 2));

    //Ajustamos los datos principales a los de la ciudad
    document.getElementById("ciudad").innerHTML = ciudad;
    document.getElementById("pais").innerHTML = datos.sys.country;

    const iconCode = datos.weather[0].icon;
    document.getElementById('icono-clima').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    document.getElementById("descrip").innerHTML = datos.weather[0].description;
    document.getElementById("pop").innerHTML = "Probabilidad de lluvia: " + Math.round(forecast.list[0].pop * 100) + "%";
}