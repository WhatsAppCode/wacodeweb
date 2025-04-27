const express = require('express')
const app = express()
const path = require('path')
const SoundCloud = require("soundcloud-scraper");
const client = new SoundCloud.Client();
const fs = require("fs");

app.get('/test', (req, res) => {
res.send('hello ngentod')
})

app.get('/', function(req, res){
res.sendFile(path.join(__dirname, './index.html'));
})

app.get('/sounddl', function(req, res){
client.getSongInfo(req.query.url)
    .then(async song => {
        const stream = await song.downloadProgressive();
        const writer = stream.pipe(fs.createWriteStream(`./${song.title}.mp3`));
        writer.on("finish", () => {
          console.log("Finished writing song!")
        });
    })
    .catch(console.error);
})


app.listen(3000, () => {
console.log(`running on port: 3000`)
})


