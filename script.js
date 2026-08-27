const CHANNEL_ID = 'UC7utmH7ukZCKB_jpgXxN0Pg';
const FALLBACK_VIDEO_ID = '_qqJd1SHDz4'; // Video de respaldo largo de Juansete

async function cargarUltimoVideo() {
    const iframe = document.getElementById('yt-player');
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

    // Intento 1: rss2json con filtro de Shorts
    try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
        const data = await response.json();

        if (data.status === 'ok' && data.items && data.items.length > 0) {
            // Busca el primer video que NO sea un Short
            const videoNormal = data.items.find(item => !item.link.includes('/shorts/'));
            
            if (videoNormal) {
                const videoId = new URL(videoNormal.link).searchParams.get('v');
                if (videoId) {
                    iframe.src = `https://www.youtube.com/embed/${videoId}`;
                    return; // Encontró video largo reciente
                }
            }
        }
    } catch (e) {
        console.warn('Primer intento falló, probando respaldo...');
    }

    // Intento 2: allorigins con filtro de Shorts
    try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`);
        const data = await response.json();
        
        if (data.contents) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data.contents, "text/xml");
            const entries = Array.from(xmlDoc.querySelectorAll("entry"));
            
            // Filtra los entries para omitir links de Shorts
            const entryNormal = entries.find(entry => {
                const link = entry.querySelector("link")?.getAttribute("href") || "";
                return !link.includes("/shorts/");
            });
            
            if (entryNormal) {
                const videoId = entryNormal.querySelector("videoId")?.textContent || 
                                entryNormal.querySelector("yt\\:videoId")?.textContent;
                                
                if (videoId) {
                    iframe.src = `https://www.youtube.com/embed/${videoId}`;
                    return; // Encontró video largo reciente
                }
            }
        }
    } catch (e) {
        console.error('Segundo intento falló:', e);
    }

    // Si no encuentra ningún video largo o fallan las peticiones, pone el video de respaldo
    iframe.src = `https://www.youtube.com/embed/${FALLBACK_VIDEO_ID}`;
}

document.addEventListener('DOMContentLoaded', cargarUltimoVideo);
