const express = require('express');
const app = express();
const port = 3001;
var bodyParser = require('body-parser');
var fetch = require("node-fetch");

app.set('view engine', 'ejs');

app.use(express.static(__dirname+'/public')); // to get static pages

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//default url
app.get('/', function(req, res){
    console.log("get /")
    res.redirect('connexion');
  }
);

app.get('/inscription', function(req, res){
	console.log("get inscription")
    res.render('inscription',{});
  }
);

app.post('/inscription', async function(req, res){
	console.log(`post inscription : ajouter un user : ${JSON.stringify(req.body.pseudo)} , ${JSON.stringify(req.body.mdp)}`);
	var data=req.body;
	var pseudoGiven=req.body.pseudo;
	var mdpGiven=req.body.mdp;

	//fetch request
	const response = await fetch('http://localhost:3000/inscription', 
		{
			//mode: 'no-cors',
			method:"POST",
		 	headers: {
		      'Accept': 'application/json',
		      'Content-Type': 'application/json'
		    },
		    body: JSON.stringify(data)
		})
		//traitement de la réponse
		.then(response => response.json())//pay attention not using res twice 
		.catch((err)=>{
              console.log(`(error) inscription du user : ${JSON.stringify(req.body.pseudo)} , ${JSON.stringify(req.body.mdp)}: ${response.status}`);
        });
    console.log(`Inscription du user : ${JSON.stringify(req.body.pseudo)} , ${JSON.stringify(req.body.mdp)} : ${response.status}`);
	if(response.status=="ok"){
		//passer le user en paramètre : session ou paramètre ejs ou paramètre get
		//req.session.pseudo = req.body.pseudo;//stockage pseudo user dans session
		//res.redirect('discuss',{"pseudo":req.body.pseudo});
		//res.render(`discuss?pseudo=${JSON.stringify(pseudo)}`); GET

		//récupération des bots
		let bots;
		//fetch request
		await fetch('http://localhost:3000/recupererBots')
		//traitement de la réponse
		.then(response => response.json())//pay attention not using res twice 
		.then(response => {
			console.log(`recupererBots : ${response.status}`);
			if(response.status=="ok"){
				//affichage
				/*
				console.log(`bots :`);
				for(const bot of response.bots){
					console.log(`${bot}`);
				}*/
				bots=response.bots;
			}else{
				bots=null;
			}
		})
		.catch((err)=>{
	          console.log(`(error) recupererBots : ${response.status}`);
	    });

		res.render(`chat`,{'botPort':-1 , pseudo:pseudoGiven , isAdmin:false , "bots":bots});
	}else{
		res.render('inscription',{pseudoAlreadyTaken:true});
	}
  }
);

app.get('/connexion', function(req, res){
	console.log("get connexion")
    res.render('connexion',{});
  }
);

app.post('/connexion', async function(req, res){
	console.log(`post connexion`);
	var data=req.body;
	var pseudoGiven=data.pseudo;
	var mdpGiven=data.mdp;

	//fetch request
	const response = await fetch('http://localhost:3000/connexion', 
		{
			//mode: 'no-cors',
			method:"POST",
		 	headers: {
		      'Accept': 'application/json',
		      'Content-Type': 'application/json'
		    },
		    body: JSON.stringify(data)
		})
		//traitement de la réponse
		.then(response => response.json())//pay attention not using res twice 
		.catch((err)=>{
              console.log(`(error) connexion au user : ${JSON.stringify(req.body.pseudo)} : ${response.status}`);
        });
        console.log(`connexion au user : ${JSON.stringify(req.body.pseudo)} : ${response.status}`);
	if(response.status=="ok"){
		//passer le user en paramètre : session ou paramètre ejs ou paramètre get
		//req.session.pseudo = req.body.pseudo;//stockage pseudo user dans session
		//res.redirect('discuss',{"pseudo":req.body.pseudo});
		//res.render(`discuss?pseudo=${JSON.stringify(pseudo)}`); GET

		//récupération des bots
		let bots;
		//fetch request
		await fetch('http://localhost:3000/recupererBots')
		//traitement de la réponse
		.then(response => response.json())//pay attention not using res twice 
		.then(response => {
			console.log(`recupererBots : ${response.status}`);
			if(response.status=="ok"){
				//affichage
				/*
				console.log(`bots :`);
				for(const bot of response.bots){
					console.log(`${bot}`);
				}*/
				bots=response.bots;
			}else{
				bots=null;
			}
		})
		.catch((err)=>{
	          console.log(`(error) recupererBots : ${response.status}`);
	    });

		res.render(`chat`,{'botPort':-1 , pseudo:pseudoGiven , isAdmin:response.isAdmin , "bots":bots});
	}else{
		res.render('connexion',{wrongId:true});
	}
  }
);

app.get("/chat",(req,res)=> {
	console.log("get /chat")
	let port = req.query.port;
	res.render("chat");
})

//discussion avec le bot sur un nouveau port
app.post("/chat",(req,res)=> {
	console.log("post /chat")
	//todo : discussion avec le bot sur un nouveau port
})

//création d'un bot
app.get('/administration', async function(req, res){
	console.log("get /administration")

	console.log("recupererCerveaux");

	//fetch request
	await fetch('http://localhost:3000/recupererCerveaux')
		//traitement de la réponse
		.then(response => response.json())//pay attention not using res twice 
		.then(response => {
			console.log(`recupererCerveaux : ${response.status}`);
			if(response.status=="ok"){
				console.log(`cerveaux :`);
				for(const cerveau of response.cerveaux){
					console.log(`${cerveau}`);
				}
				res.render(`adminCreerBot`,{"cerveaux":response.cerveaux});
			}else{
				res.render('adminCreerBot',{});
			}
		})
		.catch((err)=>{
              console.log(`(error) recupererCerveaux : ${response.status}`);
        });    
  }
);

app.post('/administration', async function(req,res){
	console.log("post /administration");
	var data=req.body;

	//fetch
	const response = await fetch('http://localhost:3000/creerBot', 
		{
			//mode: 'no-cors',
			method:"POST",
		 	headers: {
		      'Accept': 'application/json',
		      'Content-Type': 'application/json'
		    },
		    body: JSON.stringify(data)
		})
		.then(response => response.json())//pay attention not using res twice 
		.catch((err)=>{
            console.log(`(error) creerBot : ${response.status}`);
        });	
    console.log(`post administration : tentative de creation bot : ${JSON.stringify(response.status)}`);
	if(response.status=="bot created"){

		console.log("creation bot suceed");
		console.log(`botName : ${response.botName}`);
		console.log(`botCerveau : ${response.botCerveau}`);
		console.log(`botPort : ${response.botPort}`);
		let botPort=response.botPort;

		//récupération des bots
		let bots;
		//fetch request
		await fetch('http://localhost:3000/recupererBots')
		//traitement de la réponse
		.then(response => response.json())//pay attention not using res twice 
		.then(response => {
			console.log(`recupererBots : ${response.status}`);
			if(response.status=="ok"){
				//affichage
				/*
				console.log(`bots :`);
				for(const bot of response.bots){
					console.log(`${bot}`);
				}*/
				bots=response.bots;
			}else{
				bots=null;
			}
		})
		.catch((err)=>{
	          console.log(`(error) recupererBots : ${response.status}`);
	    });

	    res.render(`chat`,{'botPort':botPort , "bots":bots});
	}else{
		console.log("creation bot failed (nom de bot déjà pris)");		
		res.render('adminCreerBot',{"nomPris":true,"cerveaux":response.cerveaux});
	}
  }
);

app.listen(port, (err,data) => {
    console.log(`Client server listening on port ${port}`);
});
