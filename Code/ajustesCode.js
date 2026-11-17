document.addEventListener("DOMContentLoaded", async () => {
    //Api key
    const inputApiKey = document.getElementById("inputApiKey");
    const btnToggleVer = document.getElementById("btnToggleVer");
    const iconoOjo = document.getElementById("iconoOjo");

    inputApiKey.value = await obtenerApi(); //Obtiene la key real de la configuración del usuario

    //Botón para descensurar / censurar la API Key
    btnToggleVer.addEventListener("click", () => {
        if (inputApiKey.type === "password") {
            inputApiKey.type = "text";
            iconoOjo.classList.remove("bi-eye");
            iconoOjo.classList.add("bi-eye-slash");
        } else {
            inputApiKey.type = "password";
            iconoOjo.classList.remove("bi-eye-slash");
            iconoOjo.classList.add("bi-eye");
        }
    });

    //Listado ciudades
    const lista = document.getElementById("listaCiudades");
    let elementoArrastrado = null;
    let ciudadAEliminar = null;
    let elementoLiAEliminar = null;
    const modalElemento = document.getElementById('confirmarModal');
    const modalConfirmar = new bootstrap.Modal(modalElemento);
    const spanNombreModal = document.getElementById("nombreCiudadModal");
    const btnAceptarBorrar = document.getElementById("btnAceptarBorrar");

    //*GESTIÓN DE CLICS EN LA LISTA (Eliminar, Subir, Bajar)
    lista.addEventListener("click", async (e) => {
        const itemLi = e.target.closest("li");
        if (!itemLi) return;

        let huboCambio = false;

        //Botón Eliminar
        if (e.target.closest(".btn-eliminar")) {
            ciudadAEliminar = itemLi.getAttribute("id");
            elementoLiAEliminar = itemLi;

            spanNombreModal.textContent = ciudadAEliminar;

            // Mostramos el modal de Bootstrap
            modalConfirmar.show();
            return;
        }

        //Botón Subir
        if (e.target.closest(".btn-subir")) {
            const elementoAnterior = itemLi.previousElementSibling;
            if (elementoAnterior) {
                lista.insertBefore(itemLi, elementoAnterior);
                huboCambio = true;
            }
        }

        //Botón Bajar
        if (e.target.closest(".btn-bajar")) {
            const elementoSiguiente = itemLi.nextElementSibling;
            if (elementoSiguiente) {
                lista.insertBefore(elementoSiguiente, itemLi);
                huboCambio = true;
            }
        }

        if (huboCambio) {
            await sincronizarOrdenConBackend();
        }
    });

    //Si se confirma el borrar
    if (btnAceptarBorrar) {
        btnAceptarBorrar.addEventListener("click", async () => {
            if (ciudadAEliminar && elementoLiAEliminar) {
                console.log("Eliminando ciudad:", ciudadAEliminar);

                try {
                    //Llamamos al backend para borrarla del json
                    const resultado = await window.api.eliminarCiudad(ciudadAEliminar);

                    if (resultado && resultado.success) {
                        console.log("Ciudad eliminada del JSON con éxito.");

                        //La borramos de la vista de usuario solo si se ha borrado correctamente en el json
                        elementoLiAEliminar.remove();
                    } else {
                        console.error("No se pudo eliminar la ciudad del JSON:", resultado ? resultado.error : "Error desconocido");
                    }
                } catch (error) {
                    console.error("Error al invocar eliminar-ciudad:", error);
                }

                // Limpiamos las variables temporales
                ciudadAEliminar = null;
                elementoLiAEliminar = null;
            }
        });
    }

    //Arrastrar las ciudades
    lista.addEventListener("dragstart", (e) => {
        elementoArrastrado = e.target.closest("li");
        if (!elementoArrastrado) return;

        e.dataTransfer.effectAllowed = "move";
        setTimeout(() => elementoArrastrado.classList.add("opacity-50"), 0);
    });

    lista.addEventListener("dragend", async (e) => {
        const item = e.target.closest("li");
        if (item) {
            item.classList.remove("opacity-50");
        }
        elementoArrastrado = null;
        await sincronizarOrdenConBackend(); //Guardamos el nuevo orden
    });

    lista.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";

        const targetLi = e.target.closest("li");

        if (targetLi && targetLi !== elementoArrastrado) {
            const rect = targetLi.getBoundingClientRect();
            const offset = e.clientY - rect.top;
            const middle = rect.height / 2;

            if (offset > middle) {
                lista.insertBefore(elementoArrastrado, targetLi.nextSibling);
            } else {
                lista.insertBefore(elementoArrastrado, targetLi);
            }
        }
    });

    //Galería de fondos
    const galeria = document.getElementById("galeriaFondos");

    if (galeria) {
        galeria.addEventListener("click", async(e) => {
            const tarjetaSeleccionada = e.target.closest(".option-fondo");
            if (!tarjetaSeleccionada) return;

            //Obtener el fondo seleccionado
            const nombreFondo = tarjetaSeleccionada.getAttribute("data-fondo");
            if (!nombreFondo) return;
            console.log("Fondo seleccionado:", nombreFondo);

            //Quitar la selección a todas las tarjetas
            const todasLasTarjetas = galeria.querySelectorAll(".option-fondo");
            todasLasTarjetas.forEach(card => {
                card.classList.remove("border-primary");
                card.classList.add("border-secondary");
                
                const check = card.querySelector(".check-icono");
                if (check) check.classList.add("d-none");
            });

            //Aplicar estilo activo a la tarjeta pulsada
            tarjetaSeleccionada.classList.remove("border-secondary");
            tarjetaSeleccionada.classList.add("border-primary");

            const checkActivo = tarjetaSeleccionada.querySelector(".check-icono");
            if (checkActivo) checkActivo.classList.remove("d-none");

            //Enviar el cambio al Backend para que lo guarde en el JSON
            try {
                console.log("Enviando: " +nombreFondo);
                const resultado = await window.api.guardarFondo(nombreFondo);
                if (resultado && resultado.success) {
                    console.log("Fondo guardado con éxito en el JSON:", resultado.background);
                } else {
                    console.error("No se pudo guardar el fondo en el JSON:", resultado ? resultado.error : "Respuesta vacía o indefinida");
                }
            } catch (error) {
                console.error("Error al invocar guardar-fondo:", error);
            }
        });
    }
});

//Obtiene la API Key de la configuración de usuario
async function obtenerApi() {
    try {
        const resultado = await window.api.getKey(); 
        
        if (resultado) {
            return resultado
        }else {
            console.log("Error al obtener la API Key");
        }
    } catch (error) {
        console.error("Error al cargar la API Key en el input:", error);
    }
}

//Guarda la API Key introducida en la configuración de usuario
async function guardarKey() {
    const inputApiKey = document.getElementById("inputApiKey");

    try {
        const nuevaKey = inputApiKey.value.trim();
        const resultado = await window.api.saveKey(nuevaKey); 
        
        if (resultado && resultado.success) {
            mostrarMensaje();
            console.log("API Key guardada con éxito en el JSON!");
        }else {
            const mensajeError = resultado ? resultado.error : "Respuesta vacía del backend";
            mostrarError("No se pudo guardar la API Key. Motivo:", mensajeError);
        }
    } catch (error) {
        console.error("Error al guardar la API Key:", error);
    }
}

//Muestra el modal si se guarda correctamente
function mostrarMensaje() {
    const myModal = new bootstrap.Modal(document.getElementById('guardarModal'));
    myModal.show();
}

//Muestra el modal si algo falla
function mostrarError(error) {
    const modalCuerpo = document.querySelector('#errorModal .modal-body');
    modalCuerpo.innerHTML = '<p>'+error+'</p>';

    const myModal = new bootstrap.Modal(document.getElementById('errorModal'));
    myModal.show();
}

async function obtenerCiudades() {
    try {
        const respuesta = await window.api.inicializarCiudades();

        //Validamos que la respuesta y la propiedad 'datos' existan
        if (!respuesta || !respuesta.datos) {
            console.error("No se pudieron cargar las ciudades.");
            return;
        }

        //Extraemos el array real de ciudades
        const ciudades = respuesta.datos;
        let divCiudades = document.getElementById("listaCiudades");

        for (const ciudad of ciudades) {
            let datos = ciudad.split(",");
            let divCiudad = `
                <li class="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center py-3"
                    draggable="true" id="${ciudad}">
                    <div class="d-flex align-items-center gap-3">
                        <i class="bi bi-grip-vertical text-white d-none d-md-inline" style="cursor: grab;"
                            title="Arrastrar para mover"></i>
                        <span class="fw-bold">${datos[0]}</span>
                        <span class="badge bg-secondary text-light">${datos[1]}</span>
                    </div>
            
                    <!-- Controles de acción (Mover arriba, abajo y eliminar) -->
                    <div class="btn-group btn-group-sm" role="group">
                        <button type="button" class="btn btn-outline-light border-0 btn-subir" title="Mover arriba">
                            <i class="bi bi-arrow-up"></i>
                        </button>
                        <button type="button" class="btn btn-outline-light border-0 btn-bajar" title="Mover abajo">
                            <i class="bi bi-arrow-down"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger border-0 btn-eliminar" title="Eliminar ciudad">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </li>`;

            divCiudades.innerHTML += divCiudad;
        }
    } catch (error) {
        console.error("Error al obtener las ciudades:", error);
    }
}

// Extrae el array de ciudades ordenadas del HTML
function obtenerCiudadesDesdeDOM() {
    const items = document.querySelectorAll("#listaCiudades li");
    const ciudadesOrdenadas = [];
    items.forEach(item => {
        ciudadesOrdenadas.push(item.getAttribute("id"));
    });
    return ciudadesOrdenadas;
}

// Función para enviar el nuevo orden al backend
async function sincronizarOrdenConBackend() {
    const nuevasCiudades = obtenerCiudadesDesdeDOM();
    try {
        const resultado = await window.api.guardarOrdenCiudades(nuevasCiudades);
        if (resultado && resultado.success) {
            console.log("Orden de ciudades actualizado en el JSON:", resultado.ciudades);
        } else {
            console.error("No se pudo guardar el orden:", resultado ? resultado.error : "Error desconocido");
        }
    } catch (error) {
        console.error("Error al invocar guardar-orden-ciudades:", error);
    }
}