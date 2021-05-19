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
    res.render('connexion',{});
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
	await fetch('http://localhost:3000/inscription', 
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
		.then(response => {
			console.log(`Inscription du user : ${JSON.stringify(req.body.pseudo)} , ${JSON.stringify(req.body.mdp)} : ${response.status}`);
			if(response.status=="ok"){
				//passer le user en paramètre : session ou paramètre ejs ou paramètre get
				//req.session.pseudo = req.body.pseudo;//stockage pseudo user dans session
				//res.redirect('discuss',{"pseudo":req.body.pseudo});
				//res.render(`discuss?pseudo=${JSON.stringify(pseudo)}`); GET
				res.render(`chat`,{pseudo:pseudoGiven});
			}else{
				res.render('inscription',{pseudoAlreadyTaken:true});
			}
		})
		.catch((err)=>{
              console.log(`(error) inscription du user : ${JSON.stringify(req.body.pseudo)} , ${JSON.stringify(req.body.mdp)}: ${response.status}`);
        });
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
	await fetch('http://localhost:3000/connexion', 
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
		.then(response => {
			console.log(`connexion au user : ${JSON.stringify(req.body.pseudo)} : ${response.status}`);
			if(response.status=="ok"){
				//passer le user en paramètre : session ou paramètre ejs ou paramètre get
				//req.session.pseudo = req.body.pseudo;//stockage pseudo user dans session
				//res.redirect('discuss',{"pseudo":req.body.pseudo});
				//res.render(`discuss?pseudo=${JSON.stringify(pseudo)}`); GET
				res.render(`chat`,{pseudo:pseudoGiven , isAdmin:response.isAdmin});
			}else{
				res.render('connexion',{wrongId:true});
			}
		})
		.catch((err)=>{
              console.log(`(error) connexion au user : ${JSON.stringify(req.body.pseudo)} : ${response.status}`);
        });
  }
);

app.get("/chat",(req,res)=> {
	console.log("get /chat")
	//todo : vérifier droit user
	res.render("chat");
})

//création d'un bot
app.get('/administration', function(req, res){
	console.log("get /administration")
    res.render('adminCreerBot',{});
  }
);

app.post('/creerBot', function(req, res){
	console.log("post /creerBot")
	var bot;
	var data=req.body;
	//fetch
	fetch('http://localhost:3000/creerBot', 
		{
			//mode: 'no-cors',
			method:"POST",
		 	headers: {
		      'Accept': 'application/json',
		      'Content-Type': 'application/json'
		    },
		    body: JSON.stringify(data)
		})
		.then(res => res.json())
		.then(data => {
			console.log(`res : ${data}`);
			bot=data;//le serveur renvoi le bot
		});	

	console.log(`post connexion : tentative de creation bot : ${JSON.stringify(req.body)} : ${bot}`);
	res.redirect('adminChoixCerveau');
	/* todo : implement creation bot cote serveur avec le nom donne
	if(bot!=undefined){
		console.log("creation bot suceed");
		res.redirect('administration');
	}else{
		console.log("creation bot failed");		
		res.redirect('administration');
	}
	*/
  }
);

app.get('/adminChoixCerveau', function(req, res){
	console.log("get /adminChoixCerveau")
    res.render('adminChoixCerveau',{});
  }
);

app.post('/adminChoixCerveau', function(req, res){
	console.log("post /adminChoixCerveau")
	var bot;
	var data=req.body;
	//fetch
	fetch('http://localhost:3000/adminChoixCerveau', 
		{
			//mode: 'no-cors',
			method:"POST",
		 	headers: {
		      'Accept': 'application/json',
		      'Content-Type': 'application/json'
		    },
		    body: JSON.stringify(data)
		})
		.then(res => res.json())
		.then(data => {
			console.log(`res : ${data}`);
			bot=data;//le serveur renvoi le bot
		});	

	res.redirect('adminChoixCerveau');
  }
);

app.listen(port, (err,data) => {
    console.log(`Client server listening on port ${port}`);
});

