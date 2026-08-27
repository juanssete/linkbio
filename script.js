const CHANNEL_ID = 'UC7utmH7ukZCKB_jpgXxN0Pg';
// Video por defecto de respaldo si falla todo
const FALLBACK_VIDEO_ID = '5qap5aO4i9A'; 

async function cargarUltimoVideo() {
    const iframe = document.getElementById('yt-player');
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

    // Intento 1: rss2json
    try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
        const data = await response.json();

        if (data.status === 'ok' && data.items && data.items.length > 0) {
            const videoUrl = data.items[0].link;
            const videoId = new URL(videoUrl).searchParams.get('v');
            if (videoId) {
                iframe.src = `https://www.youtube.com/embed/${videoId}`;
                return; // Éxito
            }
        }
    } catch (e) {
        console.warn('Primer intento con rss2json falló, intentando respaldo...');
    }

    // Intento 2 (Respaldo): allorigins
    try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`);
        const data = await response.json();
        
        if (data.contents) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data.contents, "text/xml");
            const entry = xmlDoc.querySelector("entry");
            
            if (entry) {
                const videoId = entry.querySelector("videoId")?.textContent || 
                                entry.querySelector("yt\\:videoId")?.textContent;
                                
                if (videoId) {
                    iframe.src = `https://www.youtube.com/embed/${videoId}`;
                    return; // Éxito
                }
            }
        }
    } catch (e) {
        console.error('Segundo intento falló:', e);
    }

    // Si fallan los dos servicios, pone el video por defecto para no dejar la caja negra
    iframe.src = `https://www.youtube.com/embed/${FALLBACK_VIDEO_ID}`;
}

document.addEventListener('DOMContentLoaded', cargarUltimoVideo);
