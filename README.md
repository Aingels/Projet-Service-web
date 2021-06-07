# Projet Service web

# 0. Vidéo explicative
https://youtu.be/qSgl9fKcuEs

# 1.Lancement du service

### Description

Le service est détaché en deux parties. L'API REST côté serveur qui s'occupe du lancement et de l'administration des bots et le côté client que s'occupe des vues et de la mémorisation des droits.

### Consignes de lancement

Lancer les deux index.js :

```
node index.js
```
dans chacun des deux répertoire */serveur/index.js* et */client/index.js*.

Le serveur écoute sur le port `3000` et le client sur `3001`. Tous les bots enregistrés dans la base de données seront lancés.

# 2.Utilisation du service

## Première étape :
Rendez vous sur *localhost:3001* sur cette page vous pourrez vous connecter ou créer un compte puis commencer à utiliser les services.

>Note : *session-express a été utilisé pour vérifier que le client s'est bien authentifier avant de parcourir les URL.

## Chat avec le robot conversationnel

Après connexion ou sur l'url *localhost:3001/chat* vous aurez accès à la liste des bots disponibles. Il faut en sélectionner un et confirmer pour lancer la conversation. Vous pouvez ensuite discuter avec la boite de dialogue dédiée.

## Administration des bots

Connectez vous avec le compte administrateur : 

- `id` : admin
- `mdp` : admin

L'interface administration est accessible depuis le chat ou à l'adresse suivante : *localhost:3001/adminAccueil*.
Dans l'interface administration, vous pourrez créer un bot en définissant son nom et en sélectionant son cerveau. Celui-ci sera lancé et enregistré dans la base de données persistante.
La base de données utilisée est MongoDB.

## Connexion du bot à Discord

En tant qu'administrateur vous avez accès à cette fonctionnalité.
Il suffit de choisir un bot et d'entrer le `token` de votre bot Discord.

Pour que le bot réponde et réagisse à vos messages il faudra rajouter le préfix `!bot` :

```
!bot my name is Anthony
> Nice to meet you, Anthony.
```

