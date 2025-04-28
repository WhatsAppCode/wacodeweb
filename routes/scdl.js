const express = require('express');
const router = express.Router();
const path = require('path')
const SoundCloud = require("soundcloud-scraper");
const client = new SoundCloud.Client();
const fs = require("fs");


router.get('/', function(req, res){
client.getSongInfo(req.query.url)
    .then(async song => {
        const stream = await song.downloadProgressive();
        const writer = stream.pipe(fs.createWriteStream(`./${song.title}.mp3`));
        writer.on("finish", () => {
          console.log("Finished writing song!")
          const filePath = path.join(__dirname, `../${song.title}.mp3`); 
          res.sendFile(filePath);
        });
    })
    .catch(console.error);
})


module.exports = router;
