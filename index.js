var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();
var autoLoadRoutes = require('./routeLoader');
const PORT = process.env.PORT || 80;

app.use(morgan('dev'));
app.use(express.static('client'));

app.use(express.json());

const availableEndpoints = autoLoadRoutes(app);

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,recording-session");
    next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.use((req, res) => {
  res.status(404).json({
    error: 'not available',
    requested: {
      method: req.method,
      path: req.originalUrl,
    },
    availableEndpoints: availableEndpoints.length > 0 ? availableEndpoints : 'Tidak ada endpoint yang tersedia',
  });
});

app.listen(PORT, () => {
    console.log(`Server Run on port ${PORT} `)
});


