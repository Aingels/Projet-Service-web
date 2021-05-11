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
		console.log("creation bot failed");
		res.render('create',{});
	}else{
		console.log("creation bot suceed");
		res.render('create',{});
	}
  }
);

app.listen(port, (err,data) => {
    console.log(`Example app listening on port ${port}!`);
});