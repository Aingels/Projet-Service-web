const express = require('express');
const app = express();
const port = 3001;
var bodyParser = require('body-parser');
var fetch = require("node-fetch");
var session = require('express-session');//session

app.set('view engine', 'ejs');

app.use(express.static(__dirname+'/public')); // to get static pages

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//session
app.use(session({secret: "shhh"}));
var sess;


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

		//session --> ajouté droit user
	    sess=req.session;
	    sess.pseudo=pseudoGiven;
	    sess.mdp=mdpGiven;
	    sess.favoriteColor=null;
	    sess.isAuth=true;
	    sess.isAdmmin=false;

		//récupération des bots
		let bots = await getBots();

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

		//récupération des bots
		let bots = await getBots();

		//session --> ajouté droit user
	    sess=req.session;
	    sess.pseudo=pseudoGiven;
	    sess.isAuth=true;
	    sess.isAdmin=response.isAdmin;  
	    sess.favoriteColor=null;

		res.render(`chat`,{'botPort':-1 , pseudo:pseudoGiven , isAdmin:response.isAdmin , "bots":bots});
	}else{
		res.render('connexion',{wrongId:true});
	}
  }
);

app.get('/deconnexion', function(req, res){
    console.log("get /deconnexion");

    //session --> retirer droit user
    sess=req.session;
 	sess.pseudo=null;
    sess.isAuth=null;
    sess.isAdmin=null;  
    sess.favoriteColor=null;

    res.redirect('connexion');
  }
);

app.get("/chat",async function (req,res) {
	console.log("get /chat")

	//vérification droits
	if(sess == undefined || ! sess.isAuth){
		console.log("Session non autorisée !");
		res.render('connexion',{wrongSession:true});
	}else{
		//récupération des bots
		let bots = await getBots();

		res.render(`chat`,{'botPort':-1 , isAdmin:sess.isAdmin , "bots":bots});
	}
})

//---------------------- partie administration ------------------------------------

//création d'un bot
app.get('/adminAccueil', async function(req, res){
	console.log("get /adminAccueil")

	//vérification droits
	if(sess == undefined || ! sess.isAdmin){
		console.log("Session non autorisée !");
		res.render('connexion',{wrongSession:true});
	}else{
		res.render('adminAccueil',{});
	}
  }
);

//création d'un bot
app.get('/creerBot', async function(req, res){
	console.log("get /creerBot")

	//vérification droits
	if(sess == undefined || ! sess.isAdmin){
		console.log("Session non autorisée !");
		res.render('connexion',{wrongSession:true});
	}else{
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
  }
);

app.post('/creerBot', async function(req,res){
	console.log("post /creerBot");

	//vérification droits
	if(sess == undefined || ! sess.isAdmin){
		console.log("Session non autorisée !");
		res.render('connexion',{wrongSession:true});
	}else{
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
	    console.log(`post creerBot : tentative de creation bot : ${JSON.stringify(response.status)}`);
		if(response.status=="bot created"){

			console.log("creation bot suceed");
			console.log(`botName : ${response.botName}`);
			console.log(`botCerveau : ${response.botCerveau}`);
			console.log(`botPort : ${response.botPort}`);
			let botPort=response.botPort;

			//récupération des bots
			let bots = await getBots();

		    res.render(`chat`,{'botPort':botPort , "bots":bots , isAdmin:sess.isAdmin});
		}else{
			console.log("creation bot failed (nom de bot déjà pris)");		
			res.render('adminCreerBot',{"nomPris":true,"cerveaux":response.cerveaux});
		}
	}
  }
);

//création d'un bot
app.get('/associationBotDiscord', async function(req, res){
	console.log("get /associationBotDiscord")

	//vérification droits
	if(sess == undefined || ! sess.isAdmin){
		console.log("Session non autorisée !");
		res.render('connexion',{wrongSession:true});
	}else{
		//récupération des bots
		let bots = await getBots();

		res.render('adminAssociationBotDiscord',{'botPort':-1 , "bots":bots});
	}
  }
);



app.post('/associationBotDiscord', async function(req,res){
	console.log("post /associationBotDiscord");

	//vérification droits
	if(sess == undefined || ! sess.isAdmin){
		console.log("Session non autorisée !");
		res.render('connexion',{wrongSession:true});
	}else{
		var data=req.body;

		console.log(`token : ${req.body.token}`);
		console.log(`botPort : ${req.body.botPort}`);
		let botPort=req.body.botPort;

		//récupération des bots
		let bots = await getBots();

		//fetch request
		const response2 = await fetch('http://localhost:3000/associationBotDiscord',
			{
					//mode: 'no-cors',
					method:"POST",
				 	headers: {
				      'Accept': 'application/json',
				      'Content-Type': 'application/json'
				    },
				    body: JSON.stringify(req.body)
				})
		.catch((err)=>{
	          console.log(`(error) associationBotDiscord`);
	    });

	    console.log(`fetch > associationBotDiscord : ${response2.status}`);	

	    if(response2.status==200){
	    	res.render(`chat`,{'botPort':botPort , "bots":bots , isAdmin:sess.isAdmin});
	    }else{
	    	res.render('adminAssociationBotDiscord',{'botPort':-1 , "bots":bots});
	    }
	}
  }
);


app.get('/deleteBot', async function(req, res){
	console.log("get /deleteBot")

	//vérification droits
	if(sess == undefined || ! sess.isAdmin){
		console.log("Session non autorisée !");
		res.render('connexion',{wrongSession:true});
	}else{
		//récupération des bots
		let bots = await getBots();
		res.render('deleteBot',{isAdmin:sess.isAdmin , bots:bots});
	}	
  }
);

app.post('/deleteBot', async function(req,res){
	console.log("post /deleteBot");

	//vérification droits
	if(sess == undefined || ! sess.isAdmin){
		console.log("Session non autorisée !");
		res.render('connexion',{wrongSession:true});
	}else{
		var data=req.body;

		//fetch
		const response = await fetch('http://localhost:3000/deleteBot', 
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
	            console.log(`(error) deleteBot : ${response.status}`);
	        });	
	    console.log(`post deleteBot : tentative de suppression bot : ${JSON.stringify(response.status)}`);
		if(response.status=="ok"){
		    res.render(`adminAccueil`,{isAdmin:sess.isAdmin});
		}else{
			//récupération des bots
			let bots = await getBots();
			res.render('deleteBot',{isAdmin:sess.isAdmin , bots:bots});
		}
	}
  }
);


app.listen(port, (err,data) => {
	console.log(`Client server listening on port ${port}`);
});

async function getBots() {
	let bots;
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
	return bots;
}



