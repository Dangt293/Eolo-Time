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