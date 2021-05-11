const express = require('express');
const app = expresss();
const RiveScript = require('rivescript');
let bot = new RiveScript({utf8: true});
bot.unicodePunctuation = new RegExp(/[.,!?;:]/g);
const bodyParser = require("body-parser");


//charger une personnalite pour le bot
bot.loadFile("brain/firstbot.rive").then(loading_done).catch(loading_error);

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


	// Parse application/json inputs.
	app.use(bodyParser.json());


	// Set up routes.
	app.post("/reply", getReply);
	app.get("/", showUsage);
	app.get("*", showUsage);

	// Start listening.
	app.listen(3000, function() {
		console.log("Listening on http://localhost:2001");
	});
  }

  // POST to /reply to get a RiveScript reply.
function getReply(req, res) {
	// Get data from the JSON post.
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

	// Get a reply from the bot.
	bot.reply(username, message, this).then(function(reply) {
		// Get all the user's vars back out of the bot to include in the response.
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