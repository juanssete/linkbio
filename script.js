const CHANNEL_ID = 'UC7utmH7ukZCKB_jpgXxN0Pg';

async function cargarUltimoVideo() {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
  const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    const data = await response.json();

    if (data.status === 'ok' && data.items && data.items.length > 0) {
      const videoUrl = data.items[0].link;
      const videoId = new URL(videoUrl).searchParams.get('v');

      if (videoId) {
        document.getElementById('yt-player').src = `https://www.youtube.com/embed/${videoId}`;
      }
    } else {
      console.error('No se encontraron videos.');
    }
  } catch (error) {
    console.error('Error al cargar el video:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  cargarUltimoVideo();
});
