

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
app.get('/bots',getBots)


//MongoDB (persistance de données)
const mongodb = require("mongodb");
var ServiceMongoDB = require('./ServiceMongoDB.js');
let mongoDBInstance;
// initialisation of ServiceMongoDB and server starts listening
ServiceMongoDB.create().then(mDBInst => {// ts est le retour du constructeur 
  mongoDBInstance = mDBInst;
  app.listen(3000, () => {
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
  const port = await mongoDBInstance.addBot(req.body.botName);
  //créer nouveaux bot
  createBot(port,req,res);
}

async function getBots(){
  return await mongoDBInstance.getBots();
}

//----------------------fonctions de création de serveurs pour les bots------------------

function createBot(port,req, res) {
  console.log(`post /create`)
  console.log(`nom (formulaire) : ${req.body.nom}`)


  //rivescript
  let bot = new RiveScript({
      utf8: true, errors: {
          replyNotFound: "I don't know how to reply to that (´ー｀)."
      }
  });
  
  //implémentation des ponctuations
  bot.unicodePunctuation = new RegExp(/[.,!?;:]/g);
  bot.sortReplies();
  try {
      bot.loadFile("brain/standard.rive");
  } catch (err) {
      console.log("Error loading batch #" + loadcount + ": " + err + "\n");
      return res.status(500)
  }

  

  //création d'un serveur pour le nouveau robot conversationnel
  const app = createRivescriptServer(bot, port); 
  app.listen(port);
  console.log("New bot is listening to port:",port);
}

function createRivescriptServer(bot, port) {
  console.log("Brain loaded!");

  //express
  const app = express();

  //CORS
  app.use(cors()); //Cross-origin resource sharing (requêtes multi origines - client ou serveur)
  var corsOptions = {
      origin: 'http://localhost:' + port,//URL
      methods: 'GET,POST,PUT,DELETE',
      optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  };

  //prise en charge format JSON (formulaire)
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // Set up routes.
  app.post("/reply", getReply(bot));

  //erreur URL
  app.use(function (req, res, next) {
      res.setHeader('Content-Type', 'text/plain');
      res.send(404, 'Page introuvable !');
  });

  // Error handling middleware.
  app.use((err, req, res, next) => {
      const isDev = process.env.NODE_ENV === 'development'; //sécurité pour ne pas dévoiler les failles à un utilisateur
      res.status(500).json({
          "status": "error",
          "error": isDev ? err : "Unknown error",
      });
  });

  return app;
}


// POST to /reply to get a RiveScript reply.
async function getReply(bot,req, res) {
  // récupérer les données du post format JSON.
  var username = req.body.username;
  var message = req.body.message;
  var vars = req.body.vars;

  // Make sure username and message are included.
  if (typeof (username) === "undefined" || typeof (message) === "undefined") {
    return error(res, "username and message are required keys");
  }

  // Copy any user vars from the post into RiveScript.
  if (typeof (vars) !== "undefined") {
    for (var key in vars) {
      if (vars.hasOwnProperty(key)) {
        bot.setUservar(username, key, vars[key]);
      }
    }
  }

  // Obtenir une réponse du bot.
  // bot.reply(username, message, this).then(function(reply) {
  //   // Récupérer les variables du bot pour les envoyer dans la réponse.
  //   vars = bot.getUservars(username);

  //   // Send the JSON response.
  //   console.log(reply);
  //   res.json({
  //     "status": "ok",
  //     "reply": reply,
  //     "vars": vars
  //   });
  // }).catch(function(err) {
  //   res.json({
  //     "status": "error",
  //     "error": err
  //   });
  // });

  const reply = await bot.reply(username, message, this);
  vars = bot.getUservars(username);

  res.status(200).json({
    "status": "ok",
    "reply": reply,
    "vars": vars
  });
}

