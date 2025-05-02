const express = require('express');
const router = express.Router();
const { instagramGetUrl } = require("instagram-url-direct");

router.get('/instagram', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Parameter URL Instagram diperlukan' });
  }

  try {
    console.log(`Memproses URL Instagram: ${url}`);
    const instagramData = await instagramGetUrl(url);
    return res.json({
      status: 'success',
      data: instagramData,
    });
  } catch (error) {
    console.error('Error saat mengambil data Instagram:', error);
    return res.status(500).json({ error: 'Gagal mengambil data dari URL Instagram' });
  }
});

module.exports = router;
