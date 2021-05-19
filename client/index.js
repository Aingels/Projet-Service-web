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
    res.render('create',{});
  }
);

//création d'un bot
app.get('/create', function(req, res){
	console.log("get /create")
    res.render('create',{});
  }
);

app.post('/create', function(req, res){
	console.log("post /create")
	var bot;
	var data=req.body;
	//fetch
	fetch('http://localhost:3000/create', 
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
	if(bot!=undefined){
		console.log("creation bot suceed");
		res.redirect('connexion');
	}else{
		console.log("creation bot failed");		
		res.redirect('create');
	}
  }

  
);

app.get('/inscription', function(req, res){
	console.log("get inscription")
    res.render('inscription',{});
  }
);

app.post('/inscription', function(req, res){
	console.log(`post inscription : ajouter un user : ${JSON.stringify(req.body.pseudo)} , ${JSON.stringify(req.body.mdp)}`);
	var pseudoGiven=req.body.pseudo;
	var mdpGiven=req.body.mdp;

	//fetch request
	fetch('http://localhost:3000/inscription', 
		{method:"POST",
		 	headers: {
		      'Accept': 'application/json',
		      'Content-Type': 'application/json'
		    },
		    body: JSON.stringify(req.body)}
		);

    res.render('discuss',{pseudo:pseudoGiven, mdp:mdpGiven});
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
				res.render(`discuss`,{pseudo:pseudoGiven});
			}else{
				res.redirect('connexion');
			}
		})
		.catch((err)=>{
              console.log(`(error) connexion au user : ${JSON.stringify(req.body.pseudo)} : ${response.status}`);
        });
  }
);

app.get('/discuss', function(req, res){
	console.log("get /discuss")
    res.render('discuss',{});
  }
);

app.listen(port, (err,data) => {
    console.log(`Client server listening on port ${port}`);
});

app.get("/chat",(req,res)=> {
	res.render("chat");
})