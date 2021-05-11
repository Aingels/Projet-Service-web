var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();

app.use(cors()); //Cross-origin resource sharing (requêtes multi origines - client ou serveur)
var corsOptions = {
  origin: 'http://localhost:3000',//URL
  methods: 'GET,POST,PUT,DELETE',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

//prise en charge format JSON (formulaire)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/create', cors(corsOptions),function(req, res) {
  console.log(`post /create`)
  console.log(`nom (formulaire) : ${req.body.nom}`)
  //creation du bot
  //bot=${req.body};
  //return bot;
});

app.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.send(404, 'Page introuvable !');
});

app.listen(3000, () => {
    console.log(`Example app listening at http://localhost:3000`)
});