const express = require('express');
const router = express.Router();
const Tiktok = require('@tobyg74/tiktok-api-dl');

router.get('/', async (req, res) => {
  const tiktokUrl = req.query.url;
  if (!tiktokUrl) {
    return res.status(400).json({ error: 'URL TikTok diperlukan' });
  }
  const versions = ['v2', 'v3'];
  for (const version of versions) {
    try {
      console.log(`Mencoba versi ${version}...`);
      const result = await Tiktok.Downloader(tiktokUrl, { version });
      if (result.status !== 'success') {
        throw new Error(result.message);
      }
      const downloadLinks = {
        desc: result.result?.desc || null,
        video: result.result?.video || null,
        ...(version === 'v3' && { videoHD: result.result?.videoHD || null }),
      };
      return res.json(downloadLinks);
    } catch (error) {
      console.error(`Error versi ${version}:`, error.message);
      if (version === versions[versions.length - 1]) {
        return res.status(500).json({ error: 'Gagal mengunduh tiktok' });
      }
    }
  }
});

module.exports = router;
