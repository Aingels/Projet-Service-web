const mongodb = require("mongodb");

//mongo DB connection
class ServiceMongoDB {
	constructor() {
		this.MongoClient = require('mongodb').MongoClient;
		this.uri = "mongodb+srv://bmartin:azerty@cluster0.yvirr.mongodb.net/TPNodejs?retryWrites=true&w=majority";
	}

	static async create() {
		const service = new ServiceMongoDB();
		return service;
	}

	async addUser(pseudoGiven, mdpGiven) {
		const client = await this.MongoClient.connect(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
		var db = client.db("TPNodejs");
		var collection = db.collection("User");
		var user = { pseudo: pseudoGiven, mdp: mdpGiven, favoriteColor:null };
		//envoyer la réponse
		var pseudoAlreadyTaken = await collection.findOne({ pseudo: pseudoGiven });
		if (pseudoAlreadyTaken != null) {
			console.log(`Erreur : pseudo déjà utilisé : ${pseudoAlreadyTaken}!`);
			return null;
		} else {
			return await collection.insertOne(user)
				.then((result) => {
					if (result != null) {
						console.log(`MongoDB > addUser : ${pseudoGiven} , ${mdpGiven}`);
						client.close();
					} else {
						console.log('MongoDB > addUser : error');
						client.close();
					}
					client.close();
					return result;
				})
				.catch((err) => {
					console.error(err)
				});
		}
	}

	async getUser(pseudoGiven, mdpGiven) {
		const client = await this.MongoClient.connect(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
		var db = client.db("TPNodejs");
		var collection = db.collection("User");
		var user = { pseudo: pseudoGiven, mdp: mdpGiven };

		//clean DB --> 
		//collection.deleteMany();

		return await collection.findOne(user)
			.then((result) => {
				if (result != null) {
					console.log(`MongoDB > getUser : ${result.pseudo}`);
					client.close();
				} else {
					console.log('MongoDB > getUser : not found');
					client.close();
				}
				return result;
			})
			.catch((err) => {
				console.error(err)
			});
	}

	//todo : vérif droit admin
	async addBot(botName,brain) {
		const client = await this.MongoClient.connect(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
		var db = client.db("TPNodejs");
		var collection = db.collection("Bots");

		//clean DB --> 
		//collection.deleteMany();
		
		//vérifier disponibilité port		
		let port = parseInt(Math.random() * (3100 - 3002) + 3002);
		var portAlreadyTaken = await collection.findOne({ port: port });

		//vérifier disponibilité nom de bot
		var botNameAlreadyTaken = await collection.findOne({ botName: botName });
		if (botNameAlreadyTaken != null) {
			console.log(`Erreur : nom de bot déjà utilisé : ${botNameAlreadyTaken}!`);
			return null;

		} else {
			//changer de port
			while (portAlreadyTaken != null) {
				port = parseInt(Math.random() * (3100 - 3002) + 3002);
				portAlreadyTaken = await collection.findOne({ port: port });
			}
			const bot = { botName: botName, port: port, brain:brain }
			collection.insertOne(bot)
				.then((result) => {
					if (result != null) {
						console.log(`MongoDB > addBot : ${botName} , ${port} , ${brain}`);
						client.close();
					} else {
						console.log('MongoDB > addBot : error');
						client.close();
					}
					client.close();
				})
				.catch((err) => {
					console.error(err)
				});
			return port;
		}
	}
	async getBots() {
		const client = await this.MongoClient.connect(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
		var db = client.db("TPNodejs");
		return await db.collection("Bots").find("SELECT * FROM Bots").toArray();
	}

	async deleteBot(botPort) { 
		const client = await this.MongoClient.connect(this.uri, { useNewUrlParser: true, useUnifiedTopology: true }); 
		var db = client.db("TPNodejs"); 
		var collection = db.collection("Bots"); 
 
 
		await collection.deleteOne( { port : parseInt(botPort) } ); 
		 
		console.log(`MongoDB > deleteBot : ${botPort}`); 
		client.close();		 
	} 

	async setFavoriteColor(pseudoGiven, mdpGiven, color) {
		const client = await this.MongoClient.connect(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
		var db = client.db("TPNodejs");
		var collection = db.collection("User");
      	//var favoriteColor = { favoriteColor: color };
      	//modification couleur préférée
		return collection.updateOne(
				{"pseudo" : pseudoGiven},
				{$set: { "favoriteColor" : color}}
			)
			.then((result2) => {
				if (result2 != null) {
					console.log(`MongoDB > setFavoriteColor : ok`);
					client.close();
				} else {
					console.log('MongoDB > setFavoriteColor : error');
					client.close();
				}
				return result2;
			})
			.catch((err) => {
				console.error(err)
			});   
	}

	async getFavColor(pseudo){
		console.log(pseudo);
		const client = await this.MongoClient.connect(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
		var db = client.db("TPNodejs");
		try {
			return await db.collection("Bots").findOne({ pseudo: pseudo }).favoriteColor.toString();
		} catch (err){
			console.log("Favorite color hasn't been found in the database.");
			return undefined;
		}	
	}
}



module.exports = ServiceMongoDB;
