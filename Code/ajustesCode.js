//Configuración de la Api key
document.addEventListener("DOMContentLoaded", () => {
    //Api key
    const inputApiKey = document.getElementById("inputApiKey");
    const btnToggleVer = document.getElementById("btnToggleVer");
    const iconoOjo = document.getElementById("iconoOjo");
    const btnGuardar = document.getElementById("btnGuardarApiKey");
    //Listado ciudades
    const botonesEliminar = document.querySelectorAll(".btn-eliminar");
    const lista = document.getElementById("listaCiudades");
    let elementoArrastrado = null;

    //Borrar ciudad
    botonesEliminar.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const itemLi = e.target.closest("li");
            if (itemLi) {
                itemLi.remove();
                console.log("Ciudad eliminada de la vista");
            }
        });
    });

    //Arrastrar ciudades
    lista.addEventListener("dragstart", (e) => {
        elementoArrastrado = e.target.closest("li");
        if (!elementoArrastrado) return;
        
        // Efecto visual de transparencia al arrastrar
        e.dataTransfer.effectAllowed = "move";
        setTimeout(() => elementoArrastrado.classList.add("opacity-50"), 0);
    });

    lista.addEventListener("dragend", (e) => {
        const item = e.target.closest("li");
        if (item) {
            item.classList.remove("opacity-50");
        }
        elementoArrastrado = null;
    });

    lista.addEventListener("dragover", (e) => {
        e.preventDefault(); // Necesario para permitir soltar elementos
        e.dataTransfer.dropEffect = "move";
        
        const targetLi = e.target.closest("li");
        
        // Si estamos sobre otro elemento de la lista que no sea el mismo que arrastramos
        if (targetLi && targetLi !== elementoArrastrado) {
            const rect = targetLi.getBoundingClientRect();
            const offset = e.clientY - rect.top;
            const middle = rect.height / 2;

            // Si el cursor está en la mitad superior o inferior, reordenamos dinámicamente
            if (offset > middle) {
                lista.insertBefore(elementoArrastrado, targetLi.nextSibling);
            } else {
                lista.insertBefore(elementoArrastrado, targetLi);
            }
        }
    });

    //Mover con flechas (móviles)
    lista.addEventListener("click", (e) => {
        const itemLi = e.target.closest("li");
        if (!itemLi) return;

        // Botón Subir
        if (e.target.closest(".btn-subir")) {
            const elementoAnterior = itemLi.previousElementSibling;
            if (elementoAnterior) {
                // Inserta el elemento actual justo antes del anterior
                lista.insertBefore(itemLi, elementoAnterior);
            }
        }

        // Botón Bajar
        if (e.target.closest(".btn-bajar")) {
            const elementoSiguiente = itemLi.nextElementSibling;
            if (elementoSiguiente) {
                // Inserta el elemento siguiente justo antes del actual para que baje
                lista.insertBefore(elementoSiguiente, itemLi);
            }
        }
    });

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

    //Botón para guardar
    btnGuardar.addEventListener("click", () => {
        const valorKey = inputApiKey.value.trim();

        if (!valorKey) {
            alert("Por favor, introduce una API Key válida.");
            return;
        }

        // Aquí más adelante conectarás tu window.api para guardarla en el main/json
        console.log("API Key guardada (Plantilla Frontend):", valorKey);
        alert("¡API Key guardada con éxito (Modo simulación)!");
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