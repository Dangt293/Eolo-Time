//Configuración de la Api key
document.addEventListener("DOMContentLoaded", () => {
    const inputApiKey = document.getElementById("inputApiKey");
    const btnToggleVer = document.getElementById("btnToggleVer");
    const iconoOjo = document.getElementById("iconoOjo");
    const btnGuardar = document.getElementById("btnGuardarApiKey");

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
});