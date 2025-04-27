const express = require('express')
const app = express()
const path = require('path')

app.get('/test', (req, res) => {
res.send('hello ngentod')
})

app.get('/', function(req, res){
res.sendFile(path.join(__dirname, './index.html'));
})

app.listen(3000, () => {
console.log(`running on port: 3000`)
})
