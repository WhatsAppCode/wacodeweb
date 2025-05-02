const express = require('express');
const router = express.Router();
const { search, downloadTrack2, downloadAlbumV3 } = require('@nechlophomeriaa/spotifydl');

const validateInput = (req, res, next) => {
  const { query, url } = req.query;
  if (!query && !url) {
    return res.status(400).json({ error: 'Parameter query atau URL diperlukan' });
  }
  next();
};

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const createTrackResponse = (trackData) => ({
  title: trackData.title,
  artists: trackData.artists,
  duration: trackData.duration,
  duration_formatted: formatDuration(trackData.duration),
  explicit: trackData.explicit,
  popularity: trackData.popularity,
  url: trackData.url,
  album: {
    name: trackData.album.name,
    type: trackData.album.type,
    tracks: trackData.album.tracks,
    releaseDate: trackData.album.releaseDate,
    imageUrl: trackData.album.imageUrl,
    uri: trackData.album.uri,
  },
  imageUrl: trackData.imageUrl,
});

router.get('/search', validateInput, async (req, res) => {
  const { query, limit = 5 } = req.query;
  try {
    console.log(`Mencari lagu dengan query: ${query}, limit: ${limit}`);
    const searchTrack = await search(query, parseInt(limit));
    if (!searchTrack || searchTrack.length === 0) {
      return res.status(404).json({ error: 'Tidak ditemukan hasil untuk query tersebut' });
    }
    return res.json({
      status: 'success',
      results: searchTrack,
    });
  } catch (error) {
    console.error('Error saat mencari lagu:', error.message);
    return res.status(500).json({ error: 'Gagal melakukan pencarian' });
  }
});

router.get('/track', validateInput, async (req, res) => {
  const { url, query } = req.query;
  try {
    console.log(`Mengunduh lagu dengan input: ${url || query}`);
    const songInput = url || query;
    const downTrack = await downloadTrack2(songInput);
    if (!downTrack.status) {
      throw new Error('Gagal mengunduh lagu');
    }
    return res.json({
      status: 'success',
      metadata: createTrackResponse(downTrack),
    });
  } catch (error) {
    console.error('Error saat mengunduh lagu:', error.message);
    return res.status(500).json({ error: 'Gagal mengunduh lagu' });
  }
});

router.get('/album', validateInput, async (req, res) => {
  const { url } = req.query;
  try {
    console.log(`Mengunduh album dengan URL: ${url}`);
    const downAlbum = await downloadAlbumV3(url);
    if (!downAlbum || downAlbum.length === 0) {
      throw new Error('Gagal mengunduh album atau album kosong');
    }
    return res.json({
      status: 'success',
      tracks: downAlbum.map(track => ({
        ...createTrackResponse(track),
      })),
    });
  } catch (error) {
    console.error('Error saat mengunduh album:', error.message);
    return res.status(500).json({ error: 'Gagal mengunduh album' });
  }
});

router.get('/audio', validateInput, async (req, res) => {
  const { url, query } = req.query;
  try {
    console.log(`Mengunduh audio lagu dengan input: ${url || query}`);
    const songInput = url || query;
    const downTrack = await downloadTrack2(songInput);
    if (!downTrack.status) {
      throw new Error('Gagal mengunduh audio lagu');
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${downTrack.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3"`);

    res.send(downTrack.audioBuffer);

  } catch (error) {
    console.error('Error saat mengunduh audio lagu:', error.message);
    return res.status(500).json({ error: 'Gagal mengunduh audio lagu' });
  }
});

router.get('/', validateInput, async (req, res) => {
  const { url } = req.query;
  try {
    console.log(`Memproses URL Spotify: ${url}`);
    if (url.includes('track')) {
      const downTrack = await downloadTrack2(url);
      if (!downTrack.status) {
        throw new Error('Gagal memproses track');
      }
      return res.json({
        status: 'success',
        type: 'track',
        metadata: createTrackResponse(downTrack),
      });
    } else if (url.includes('album')) {
      const downAlbum = await downloadAlbumV3(url);
      if (!downAlbum || downAlbum.length === 0) {
        throw new Error('Gagal mengunduh album atau album kosong');
      }
      return res.json({
        status: 'success',
        type: 'album',
        tracks: downAlbum.map(track => ({
          ...createTrackResponse(track),
        })),
      });
    } else {
      return res.status(400).json({ error: 'URL tidak valid, harus berupa track atau album' });
    }
  } catch (error) {
    console.error('Error saat memproses URL:', error.message);
    return res.status(500).json({ error: 'Gagal memproses URL Spotify' });
  }
});

module.exports = router;
