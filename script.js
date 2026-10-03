const CHANNEL_ID = 'UC7utmH7ukZCKB_jpgXxN0Pg';
const FALLBACK_VIDEO_ID = '_qqJd1SHDz4'; // Video de respaldo largo de Juansete

// --- FUNCIÓN 1: CARGAR ÚLTIMO VIDEO DE YOUTUBE (SIN SHORTS) ---
async function cargarUltimoVideo() {
    const iframe = document.getElementById('yt-player');
    if (!iframe) return;
    
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

    // Intento 1: rss2json con filtro de Shorts
    try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
        const data = await response.json();

        if (data.status === 'ok' && data.items && data.items.length > 0) {
            const videoNormal = data.items.find(item => !item.link.includes('/shorts/'));
            
            if (videoNormal) {
                const videoId = new URL(videoNormal.link).searchParams.get('v');
                if (videoId) {
                    iframe.src = `https://www.youtube.com/embed/${videoId}`;
                    return;
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
            
            const entryNormal = entries.find(entry => {
                const link = entry.querySelector("link")?.getAttribute("href") || "";
                return !link.includes("/shorts/");
            });
            
            if (entryNormal) {
                const videoId = entryNormal.querySelector("videoId")?.textContent || 
                                entryNormal.querySelector("yt\\:videoId")?.textContent;
                                
                if (videoId) {
                    iframe.src = `https://www.youtube.com/embed/${videoId}`;
                    return;
                }
            }
        }
    } catch (e) {
        console.error('Segundo intento falló:', e);
    }

    // Video de respaldo
    iframe.src = `https://www.youtube.com/embed/${FALLBACK_VIDEO_ID}`;
}

// --- FUNCIÓN 2: VERIFICAR ESTADO Y ÚLTIMO DIRECTO EN TWITCH ---
async function checkTwitchStatus() {
    const channel = "juanssete";
    const statusDetail = document.getElementById("twitch-status-detail");
    const liveBadge = document.getElementById("live-badge");
    const twitchBtn = document.getElementById("twitch-btn");

    if (!statusDetail || !liveBadge || !twitchBtn) return;

    try {
        // Consulta la API de IVR para obtener datos del directo o la fecha del último stream grabado
        const response = await fetch(`https://api.ivr.fi/v2/twitch/user?login=${channel}`);
        const data = await response.json();

        if (data && data.length > 0) {
            const userData = data[0];
            const streamData = userData.stream;
            const lastBroadcast = userData.lastBroadcast;

            if (streamData) {
                // Si ESTÁ EN VIVO
                twitchBtn.classList.remove("offline");
                twitchBtn.classList.add("is-live");
                liveBadge.textContent = "🔴 EN VIVO";
                
                const timeAgo = formatTimeAgo(streamData.createdAt);
                statusDetail.textContent = `En directo desde hace ${timeAgo}`;
            } else {
                // Si ESTÁ OFFLINE
                twitchBtn.classList.remove("is-live");
                twitchBtn.classList.add("offline");
                liveBadge.textContent = "OFFLINE";

                if (lastBroadcast && lastBroadcast.startedAt) {
                    const timeAgo = formatTimeAgo(lastBroadcast.startedAt);
                    statusDetail.textContent = `Último directo hace ${timeAgo}`;
                } else {
                    statusDetail.textContent = "Último stream grabado disponible";
                }
            }
        }
    } catch (error) {
        console.error("Error consultando Twitch:", error);
        statusDetail.textContent = "Ver canal de Twitch";
    }
}

// Función auxiliar para formatear el tiempo transcurrido
function formatTimeAgo(dateString) {
    const past = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) {
        return "unos segundos";
    }

    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) {
        return `${minutes} min${minutes > 1 ? 's' : ''}`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours} hora${hours > 1 ? 's' : ''}`;
    }

    const days = Math.floor(hours / 24);
    if (days < 30) {
        return `${days} día${days > 1 ? 's' : ''}`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
        return `${months} mes${months > 1 ? 'es' : ''}`;
    }

    const years = Math.floor(months / 12);
    return `${years} año${years > 1 ? 's' : ''}`;
}

// --- FUNCIÓN 3: CONTADOR DE VISITAS ---
async function cargarContadorVisitas() {
    const visitCountEl = document.getElementById("visit-count");
    if (!visitCountEl) return;

    try {
        // Usa CountAPI para contar y acumular visitas de la página
        const response = await fetch("https://api.countapi.xyz/hit/juanssete-linktree/visits");
        const data = await response.json();
        if (data && data.value) {
            visitCountEl.textContent = data.value.toLocaleString();
        } else {
            visitCountEl.textContent = "0"; // Valor inicial si falla
        }
    } catch (error) {
        visitCountEl.textContent = "Error";
    }
}

// --- FUNCIÓN 4: REPRODUCTOR DE MÚSICA Y CONTROL DE VOLUMEN ---
function initMusicPlayer() {
    const audio = document.getElementById('bg-music');
    const playBtn = document.getElementById('play-btn');
    const playIcon = document.getElementById('play-icon');
    const seekBar = document.getElementById('seek-bar');
    const currentTimeEl = document.getElementById('current-time');
    const totalDurationEl = document.getElementById('total-duration');
    const volumeBar = document.getElementById('volume-bar');
    const volumeIcon = document.getElementById('volume-icon');

    if (!audio || !playBtn) return;

    // Volumen inicial (80%)
    audio.volume = 0.8;

    // Play / Pausa con manejo de promesas
    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().then(() => {
                if (playIcon) {
                    playIcon.classList.remove('fa-play');
                    playIcon.classList.add('fa-pause');
                }
            }).catch(err => {
                console.error("Error al iniciar audio:", err);
            });
        } else {
            audio.pause();
            if (playIcon) {
                playIcon.classList.remove('fa-pause');
                playIcon.classList.add('fa-play');
            }
        }
    });

    // Cargar duración total al cargar metadatos de la canción
    audio.addEventListener('loadedmetadata', () => {
        if (totalDurationEl && audio.duration) {
            totalDurationEl.textContent = formatTime(audio.duration);
        }
    });

    // Actualizar barra de tiempo según avanza la canción
    audio.addEventListener('timeupdate', () => {
        if (audio.duration && seekBar) {
            const progress = (audio.currentTime / audio.duration) * 100;
            seekBar.value = progress;
            if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
            if (totalDurationEl && totalDurationEl.textContent === "4:18") {
                totalDurationEl.textContent = formatTime(audio.duration);
            }
        }
    });

    // Cambiar posición de la canción al arrastrar la barra
    if (seekBar) {
        seekBar.addEventListener('input', () => {
            if (audio.duration) {
                audio.currentTime = (seekBar.value / 100) * audio.duration;
            }
        });
    }

    // Control de volumen
    if (volumeBar) {
        volumeBar.addEventListener('input', (e) => {
            const val = e.target.value / 100;
            audio.volume = val;
            
            if (volumeIcon) {
                if (val === 0) {
                    volumeIcon.className = 'fas fa-volume-mute';
                } else if (val < 0.5) {
                    volumeIcon.className = 'fas fa-volume-down';
                } else {
                    volumeIcon.className = 'fas fa-volume-up';
                }
            }
        });
    }

    // Formatear segundos a formato MM:SS
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
}

// Inicializar todo al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
    cargarUltimoVideo();
    checkTwitchStatus();
    cargarContadorVisitas();
    initMusicPlayer();
});
