var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
const RiveScript = require('rivescript');

//rivescript
let bot = new RiveScript({utf8: true});
//charger une personnalite pour le bot
bot.loadFile("brain/firstbot.rive").then(loading_done).catch(loading_error);
bot.unicodePunctuation = new RegExp(/[.,!?;:]/g);
/*// Load a list of files all at once (the best alternative to loadDirectory
// for the web!)
bot.loadFile([
    "brain/begin.rive",
    "brain/admin.rive",
    "brain/clients.rive"
  ]).then(loading_done).catch(loading_error);*/

function loading_done(){
  console.log("Brain loaded!");
  bot.sortReplies();

  //express
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

  // Set up routes.
  app.post('/create', cors(corsOptions), createBot);
  app.post("/reply", getReply);
  // app.get("/", showUsage);
  // app.get("*", showUsage);

  // Start listening.
  app.listen(3000, function() {
    console.log("Listening on http://localhost:3000");
  });

  //erreur URL
  app.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.send(404, 'Page introuvable !');
});
}

function createBot(req, res) {
  console.log(`post /create`)
  console.log(`nom (formulaire) : ${req.body.nom}`)
  //creation du bot
  //bot=${req.body};
  //return bot;
}

// POST to /reply to get a RiveScript reply.
function getReply(req, res) {
  // récupérer les données du post format JSON.
  var username = req.body.username;
  var message  = req.body.message;
  var vars     = req.body.vars;

  // Make sure username and message are included.
  if (typeof(username) === "undefined" || typeof(message) === "undefined") {
    return error(res, "username and message are required keys");
  }

  // Copy any user vars from the post into RiveScript.
  if (typeof(vars) !== "undefined") {
    for (var key in vars) {
      if (vars.hasOwnProperty(key)) {
        bot.setUservar(username, key, vars[key]);
      }
    }
  }

  // Obtenir une réponse du bot.
  bot.reply(username, message, this).then(function(reply) {
    // Récupérer les variables du bot pour les envoyer dans la réponse.
    vars = bot.getUservars(username);

    // Send the JSON response.
    res.json({
      "status": "ok",
      "reply": reply,
      "vars": vars
    });
  }).catch(function(err) {
    res.json({
      "status": "error",
      "error": err
    });
  });
}

function loading_error(loadcount, err) {
  console.log("Error loading batch #" + loadcount + ": " + err + "\n");
}

