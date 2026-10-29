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

//Comprueba que la ciudad exista, y verifica que no estuviese ya en el json.
async function aniadirCiudad() {
    const modalElement = document.getElementById('nuevaCiudadModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    const ciudadBuscada = document.getElementById("ciudadNueva").value;

    if (!ciudadBuscada) {
        alert("Por favor, introduce una ciudad.");
        return;
    }

    const apiKey = await window.api.getKey();
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudadBuscada}&appid=${apiKey}&units=metric&lang=es`;
    try {
        const respuesta = await fetch(url);

        // Si OpenWeather devuelve un error es porque la ciudad no existe
        if (!respuesta.ok) {
            throw new Error("La ciudad introducida no existe o no es válida.");
        }

        const datos = await respuesta.json();

        // Datos oficiales que devuelve la API
        const ciudadOficial = datos.name;         
        const paisOficial = datos.sys.country;

        console.log(`Ciudad verificada con éxito: ${ciudadOficial}, ${paisOficial}`);

        //Comprobar que no existe ya en el array
        const ciudadesArray = await window.api.inicializarCiudades();
        for (const ciudad of ciudadesArray.datos) {
            if (ciudad.toLowerCase() === ciudadBuscada.toLowerCase()) {
                throw new Error("La ciudad ya estaba registrada.");
            }
        }

        //Si llega hasta aquí todo ha ido bien, la añadimos al json y la cargamos en la página
        const resultado = await window.api.guardarCiudad(ciudadBuscada);

        if (resultado.success) {
            console.log("Ciudades actualizadas:", resultado.ciudades);
                
            if (document.activeElement) {
                document.activeElement.blur();
            }
            modal.hide();

            // Recargamos el dashboard para que aparezca la nueva tarjeta
            obtenerClima(ciudadBuscada); 
        } else {
            throw new Error("Hubo un error al guardar la ciudad en el disco.");
        }

    } catch (error) {
        if (document.activeElement) {
            document.activeElement.blur();
        }

        modal.hide();
        mostrarMensaje(error);
    }
}

//Muestra un modal de error si algo falla
function mostrarMensaje(error) {
    const modalCuerpo = document.querySelector('#errorModal .modal-body');
    modalCuerpo.innerHTML = '<p>'+error+'</p>';

    const myModal = new bootstrap.Modal(document.getElementById('errorModal'));
    myModal.show();
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

    const [nombreCiudad, codigoPais] = ciudadSolicitada.split(',');
    const ciudad = nombreCiudad.trim();
    const pais = codigoPais ? codigoPais.trim() : '';

    //Extraemos lo necesario
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
        
        <a href="Pages/dashboard.html?ciudad=${ciudad}&pais=${pais}" class="btn btn-outline-light w-100 border-0 bg-white bg-opacity-10 stretched-link">
            Ver detalles <i class="bi bi-arrow-right ms-2"></i>
        </a>
        </div>
    </div>
    `;

    //Insertamos al final del contenedor
    contenedor.insertAdjacentHTML('beforeend', tarjetaHTML);
}