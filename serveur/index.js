var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
const RiveScript = require('rivescript');
const Discord = require('discord.js');//discord
var fetch = require("node-fetch");

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
app.get('/bots', getBots);
app.get('/recupererCerveaux', recupererCerveaux);
app.get('/recupererBots', recupererBots);
app.post('/setFavoriteColor', cors(corsOptions), setFavoriteColor);
app.post('/getFavoriteColor', getFavColor);
app.post('/associationBotDiscord', associationBotDiscord);
app.post('/deleteBot', deleteBot);

//MongoDB (persistance de données)
const mongodb = require("mongodb");
var ServiceMongoDB = require('./ServiceMongoDB.js');
let mongoDBInstance;
// initialisation of ServiceMongoDB and server starts listening
ServiceMongoDB.create().then(mDBInst => {// ts est le retour du constructeur 
  mongoDBInstance = mDBInst;
  app.listen(3000, () => {
    console.log(`Server listening on http://localhost:3000`);
  });
  launchExistingBots();
});

function launchBotsServers() {
  mongoDBInstance.collection("Bots").find("SELECT * FROM Bots").each(element => {
    createBot(port, req, res);
  });
}

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

async function addNewBot(req, res) {
  //ajouter le bot dans la base de données et détermination d'un port disponible
  const port = await mongoDBInstance.addBot(req.body.botName, req.body.cerveau)
    .catch((err) => {
      console.log(`(error) addNewBot : ${response.status}`);
    });

  if (port == null) {
    console.log("Index > error > nom de bot déjà pris");
    res.status(500).json({
      "status": "nom de bot déjà pris",
      "cerveaux": ["standard", "firstbot"],
    })
  } else {
    //créer nouveau bot
    createBot(port, req, res);
  }
}

async function getBots(req, res) {
  const botlist = await mongoDBInstance.getBots();
  res.json(botlist);
}

async function launchExistingBots() {
  const botlist = await mongoDBInstance.getBots();
  botlist.forEach(element => {
    if (element.brain != undefined) {
      console.log('bot launched')
      createBotAtLauch(element.port, element.brain, element.botName);
    }

  });
}

async function deleteBot(req, res) {
  await mongoDBInstance.deleteBot(req.body.botPort)
    .catch((err) => {
      console.log(`(error) deleteBot : ${response.status}`);
    });

 
  res.status(200).json({
    "status": "ok",
  });
}

async function setFavoriteColor(req, res) {
  console.log(`post setFavoriteColor : ${req.body.color}`);
  await mongoDBInstance.setFavoriteColor(req.body.pseudo, req.body.mdp, req.body.color)
    //envoyer la réponse
    .then((result) => {
      if (result != null) {
        console.log(`index : setFavoriteColor ok`);
        res.status(200).json({
          "status": "ok",
        });
      } else {
        console.log(`error : index : setFavoriteColor : ${result}`);
        res.status(500).json({
          "status": "error",
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

async function getFavColor(req, res) {
  console.log(req.body.username);
  const color = await mongoDBInstance.getFavColor(req.body.username).catch(err => {
    console.log(err);
    res.status(500).json({
      "status": "problem finding your preferences"
    })
  });

  res.status(200).json({
    "status": "ok",
    "favcolor": color
  });


}

//----------------------fonctions de création de serveurs pour les bots------------------

async function createBot(port, req, res) {
  console.log(`post /create`)
  console.log(`nom (formulaire) : ${req.body.botName}`)

  //rivescript
  let bot = await new RiveScript({
    utf8: true, errors: {
      replyNotFound: "I don't know how to reply to that (´ー｀)."
    }
  });

  //implémentation des ponctuations
  bot.unicodePunctuation = new RegExp(/[.,!?;:]/g);

  try {
    await bot.loadFile(`brain/${req.body.cerveau}.rive`);
  } catch (err) {
    console.log("Error loading batch #" + loadcount + ": " + err + "\n");
    return res.status(500)
  }

  bot.sortReplies();

  //création d'un serveur pour le nouveau robot conversationnel
  const app = createRivescriptServer(bot, port);
  app.listen(port);

  res.status(200).json({
    "status": "bot created",
    "botName": req.body.botName,
    "botCerveau": req.body.cerveau,
    "botPort": port,
  })


  console.log("New bot is listening to port:", port);

  return res;
}

//création des bots au lancement du serveur
async function createBotAtLauch(port, cerveau, botName) {
  console.log(`nom (formulaire) : ${botName} port :` + port)

  //rivescript
  let bot = await new RiveScript({
    utf8: true, errors: {
      replyNotFound: "I don't know how to reply to that (´ー｀)."
    }
  });

  //implémentation des ponctuations
  bot.unicodePunctuation = new RegExp(/[.,!?;:]/g);

  try {
    await bot.loadFile(`brain/${cerveau}.rive`);
  } catch (err) {
    console.log("Error loading batch #" + loadcount + ": " + err + "\n");
    return res.status(500)
  }

  bot.sortReplies();

  //création d'un serveur pour le nouveau robot conversationnel
  const app = createRivescriptServer(bot, port);
  app.listen(port);


  console.log("New bot is listening to port:", port);


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
  app.post("/reply", (req, res) => {
    getReply(bot, req, res);
  });

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
async function getReply(bot, req, res) {
  // récupérer les données du post format JSON.
  var username = req.body.username;
  var message = req.body.message;
  var vars = req.body.vars;

  // Make sure username and message are included.
  if (typeof (username) === "undefined") {
    username = "men";
  }

  if (typeof (message) === "undefined") {
    message = "empty";
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

  let reply = await bot.reply(username, message, this).catch(err => {
    res.status(200).json({
      "status": "error",
      "reply": "I ran into an error (╯`□`）╯︵ ┻━┻",
      "vars": bot.getUservars(username)
    })

    console.log(err);
  });

  vars = bot.getUservars(username);

  res.status(200).json({
    "status": "ok",
    "reply": reply,
    "vars": vars
  });
}

async function recupererCerveaux(req, res) {
  /*
  const bots  = await mongoDBInstance.getBots();
  console.log(`get bots`,bots);
  */
  //envoyer la réponse
  res.status(200).json({
    "status": "ok",
    "cerveaux": ["standard", "steeve"],
  });
};

async function recupererBots(req, res) {
  const bots = await mongoDBInstance.getBots();
  console.log(`get bots`);

  //mise au bon format
  let botTab = [];
  let botTab2 = [];
  bots.forEach(bot => botTab.push({ bot }));
  for (i = 0; i < botTab.length; i++) {
    botTab2[i] = [botTab[i].bot.botName, botTab[i].bot.port, botTab[i].bot.brain];
  }
  //console.log(`recupererBots renvoie : `,botTab2);

  //envoyer la réponse
  res.status(200).json({
    "status": "ok",
    "bots": botTab2,
  });
};

async function associationBotDiscord(req, res) {
  console.log("post /associationBotDiscord");

  let botPort = req.body.botPort;
  let token = req.body.token

  const prefix = "!bot"

  //discord
  const clientDiscord = new Discord.Client();
  clientDiscord.once('ready', () => {
    console.log('Ready!');
  });
  clientDiscord.login(token);//token du bot discord
  clientDiscord.on('message', async function (chatmessage) {

    //check prefix to see if bot has to respond
    var messageSplited = chatmessage.toString().split(' ');
    var messagePrefix = messageSplited[0];
  

    if (messagePrefix.toString().localeCompare(prefix)==0) {
      const messageLength = messageSplited.length;
      let realMessage = "";

      for (let i = 1;i<messageLength;i++){
        realMessage = realMessage + messageSplited[i] + " ";
      }

      //request construction

      const username = "men";
      const vars = undefined;
      const message = realMessage;

      let corp = {
        username,
        message,
        vars
      }


      let param = {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body : JSON.stringify(corp)
      }

      try {
        let response = await fetch('http://localhost:' + botPort + '/reply', param);
        const json = await response.json();
        let botResponse = json.reply;
        chatmessage.channel.send(botResponse); //response display in the Discord chat
      } catch (error) {
        console.log(error);
        chatmessage.channel.send('An error occured');
      }

    }
  });

  //envoie réponse
  res.status(200).json({
    "status": "ok",
  });

}