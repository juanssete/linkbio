// CONFIGURACIÓN
const CHANNEL_ID = 'UC7utmH7ukZCKB_jpgXxN0Pg'; // El ID real de Juansete
const API_KEY = 'AIzaSyCNyXjsI06IfxYOn8JF7w0UqVZXxZ4AFjA'; // Ahora te explico cómo obtenerla

// Función para obtener el último video
async function cargarUltimoVideo() {
  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=1&type=video`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            const videoId = data.items[0].id.videoId;
            // Insertamos el ID del video automáticamente en el iframe
           document.getElementById('yt-player').src = `https://www.youtube.com/embed/${videoId}`;
        } else {
            console.error('No se encontraron videos en el canal.');
        }
    } catch (error) {
        console.error('Error al conectar con la API de YouTube:', error);
    }
}

// Ejecutar la función en cuanto cargue la página
window.onload = cargarUltimoVideo;