const mongodb = require("mongodb");

//mongo DB connection
class ServiceMongoDB{	
	constructor(){ 
		this.MongoClient = require('mongodb').MongoClient;
		this.uri = "mongodb+srv://bmartin:azerty@cluster0.yvirr.mongodb.net/TPNodejs?retryWrites=true&w=majority";
	}

	static async create(){ 
		const service = new ServiceMongoDB();
		return service;
	}

	async addUser(pseudoGiven, mdpGiven){ 
		const client = await this.MongoClient.connect(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
		var db = client.db("TPNodejs");
		var collection = db.collection("User");
		var user = { pseudo: pseudoGiven , mdp : mdpGiven};
		//envoyer la réponse
		var pseudoAlreadyTaken = await collection.findOne({pseudo : pseudoGiven});
		if(pseudoAlreadyTaken != null){
			console.log(`Erreur : pseudo déjà utilisé : ${pseudoAlreadyTaken}!`);
			return null;
		}else{
			return await collection.insertOne(user)
		    .then((result)=>{
		    	if(result != null){
		    		console.log(`MongoDB > addUser : ${pseudoGiven} , ${mdpGiven}`);
			        client.close();
		    	}else{
		    		console.log('MongoDB > addUser : error');
		    		client.close();
		    	}
		    	client.close();
		    	return result;
		    })
		    .catch((err)=>{
		        console.error(err)
		    });
		}
	}

	async getUser(pseudoGiven , mdpGiven){ 
		const client = await this.MongoClient.connect(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
		var db = client.db("TPNodejs");
		var collection = db.collection("User");
		var user = { pseudo: pseudoGiven , mdp : mdpGiven};
		//envoyer la réponse
		return await collection.findOne(user)
		    .then((result)=>{
		    	if(result != null){
		    		 console.log(`MongoDB > getUser : ${result.pseudo}`);
			        client.close();
		    	}else{
		    		console.log('MongoDB > getUser : not found');
		    		client.close();
		    	}
		    	client.close();
		    	return result;
		    })
		    .catch((err)=>{
		        console.error(err)
		    });
	}
}

module.exports = ServiceMongoDB;
