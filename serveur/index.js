import {createBot} from './bot';

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
const RiveScript = require('rivescript');


var app = express();

//CORS
app.use(cors()); //Cross-origin resource sharing (requêtes multi origines - client ou serveur)
var corsOptions = {
  origin: 'http://localhost:3000',//URL
  methods: 'GET,POST,PUT,DELETE',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

//prise en charge format JSON (formulaire)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/creerBot', cors(corsOptions), addNewBot);
app.post('/inscription', cors(corsOptions), inscription);
app.post('/connexion', cors(corsOptions), connexion);

// initialisation of ServiceMongoDB and server starts listening
ServiceMongoDB.create().then(mDBInst => {// ts est le retour du constructeur 
  mongoDBInstance = mDBInst;
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:3000`)
  });
});

/*// Load a list of files all at once (the best alternative to loadDirectory
// for the web!)
bot.loadFile([
    "brain/begin.rive",
    "brain/admin.rive",
    "brain/clients.rive"
  ]).then(loading_done).catch(loading_error);*/

//MongoDB (persistance de données)
const mongodb = require("mongodb");
var ServiceMongoDB = require('./ServiceMongoDB.js');
let mongoDBInstance;




async function inscription(req, res) {
  console.log(`post inscription : ${req.body.pseudo}, ${req.body.mdp}`)
  //enregistrer user in db
  mongoDBInstance.addUser(req.body.pseudo, req.body.mdp)
    //envoyer la réponse
    .then((result) => {
      if (result != null) {
        console.log(`index : user found : ${result.pseudo}`);
        res.status(200).json({
          "status": "ok",
        });
      } else {
        console.log(`index : pseudo already taken : ${result}`);
        res.status(500).json({
          "status": "pseudo already taken",
        });
      }
    })
    .catch((err) => {
      console.error(err)
      res.status(500).json({
        "status": "error",
      });
    });
  //TODO : deal with multiple same pseudo
};

async function connexion(req, res) {
  console.log(`post connexion : ${req.body.pseudo}`)
  var pseudo = req.body.pseudo;
  var mdp = req.body.mdp;
  //connexion user in db
  var user = await mongoDBInstance.getUser(pseudo, mdp)
    //envoyer la réponse
    .then((result) => {
      if (result != null) {
        console.log(`index : user found : ${result.pseudo}`);
        res.status(200).json({
          "status": "ok",
          "isAdmin": result.isAdmin,
        });
      } else {
        console.log(`index : user not found : ${result}`);
        res.status(500).json({
          "status": "wrong id",
        });
      }
    })
    .catch((err) => {
      console.error(err)
      res.status(500).json({
        "status": "error",
      });
    });
};

async function addNewBot(req,res){
  //ajouter le bot dans la base de données et détermination d'un port disponible
  const port = await mongoDBInstance.addPort(req.body.botName);
  //créer nouveaux bot
  createBot(port,req,res);
}