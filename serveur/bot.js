export function createBot(port,req, res) {
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
        await bot.loadFile("brain/standard.rive");
    } catch (err) {
        console.log("Error loading batch #" + loadcount + ": " + err + "\n");
        return res.status(500)
    }

    

    //création d'un serveur pour le nouveau robot conversationnel
    const app = createRivescriptServer(bot, port); 
    app.listen(port);
}

export function createRivescriptServer(bot, port) {
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
export async function getReply(bot,req, res) {
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
  