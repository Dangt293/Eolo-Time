# Eolo Time - Desktop Weather Dashboard

![Versión](https://img.shields.io/badge/version-1.0.0-blue)
![Electron](https://img.shields.io/badge/Electron-First%20Project-brightgreen)
![Español](https://img.shields.io/badge/-%F0%9F%87%AA%F0%9F%87%B8%20Español-brightgreen)

Una aplicación de escritorio moderna y elegante construida con ***Electron***, ***Node.js***, ***Bootstrap 5*** y la ***API gratuita de OpenWeather***.

---

## Requisitos previos

Antes de clonar e instalar el proyecto en tu equipo, asegúrate de tener instalado lo siguiente:
* **Node.js** (Puedes descargarlo desde [nodejs.org](https://nodejs.org/)).
* Una **API Key gratuita de OpenWeather** (puedes obtener una registrándote en [OpenWeatherMap](https://openweathermap.org/)).

---
## Instalación y Puesta en Marcha 

Sigue estos sencillos pasos para clonar y ejecutar la aplicación en tu entorno local:

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/Dangt293/Eolo-Time.git
   ```
2. **Accede a la carpeta del proyecto (usando tu ruta real)**
   <br>Ejemplo:
    ```bash
   cd Eolo-Time
   ```

3. **Instala las dependencias necesarias:**
   ```bash
   npm install
   ```
4. **Inicia la aplicación:**
   ```bash
   npm start
   ```
--- 
## Funcionalidades Principales por Página

1. **Dashboard Principal (índice)**

    Muestra las tarjetas con el clima actual de las ciudades guardadas (por defecto: Madrid, Barcelona, Bilbao y Sevilla) utilizando la API de OpenWeather. 
    
    Permite añadir nuevas ciudades validando estrictamente su formato mediante expresiones regulares (ej. Madrid, ES) usando el botón de "Añadir ciudad" o el atajo de teclado Ctrl + N

    Haz clic en "Ver detalles" en cualquiera de las tarjetas para abrir la vista ampliada de esa ciudad específica.

    También tiene un reloj funcional en el header de la página, así como el enlace a la página de ajustes.

2. **Página de Ajustes**

    Permite configurar y modificar la aplicación a nuestro gusto:

    - Configuración de la API Key: Introduce, valida y guarda de forma segura tu clave de OpenWeather.

    - Gestión de Ciudades:

        - Visualiza la lista de tus ciudades predeterminadas.

        - Reordena las ciudades arrastrándolas o utilizando botones de flechas.

        - Elimina las que ya no desees.

    - Personalización del Fondo: Selecciona un fondo de pantalla entre varias imágenes extraídas de Unsplash (Dejar cursor sobre un fondo para ver los créditos al autor).

    - Estilo de Visualización: Elige entre los modos de contraste (Claro, Normal o Oscuro) para adaptar la legibilidad de los textos según la imagen de fondo seleccionada.

    Todos estos datos se almacenarán localmente en un JSON llamado config-eolotime, dentro de...

    - Windows: %APPDATA%\eolo-time\

    - Linux: ~/.config/eolo-time/

3. **Dashboard detallado**

    Muestra información meteorológica detallada y el pronóstico por cada 3 horas para la ciudad seleccionada en el dashboard principal.
    
    (Dejar el cursor sobre un icono del clima el pronóstico por horas indica a que clima se refiere dicho icono).