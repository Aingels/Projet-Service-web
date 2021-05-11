const express = require('express');
const app = expresss();
const RiveScript = require('rivescript');
let bot = new RiveScript();

//charger une presonnalite pour le bot
bot.loadFile("brain/firstbot.rive").then(loading_done).catch(loading_error);