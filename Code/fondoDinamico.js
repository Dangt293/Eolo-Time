document.addEventListener("DOMContentLoaded", async () => {
    try {
        const respuesta = await window.api.obtenerFondo();

        if (respuesta && respuesta.datos) {
            const nombreFondo = respuesta.datos;

            // Construimos la ruta exacta de la imagen relativa a la carpeta assets
            const rutaCompleta = `../assets/Backgrounds/${nombreFondo}`;

            //Inyectamos dinámicamente el valor en la variable CSS --bg-img del :root
            document.documentElement.style.setProperty('--bg-img', `url('${rutaCompleta}')`);

            console.log("Fondo cargado desde el JSON:", nombreFondo);
        }
    } catch (error) {
        console.error("Error al aplicar el fondo dinámico:", error);
    }
});