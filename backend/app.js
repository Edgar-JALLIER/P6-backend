//Ajout de dotenv pour sécuriser les identifiants mongoose
require("dotenv").config({ path: "../.env" });
//Fichier de l'application express qui va dialoguer averc l'application frontend depuis le serveur server.js
const express = require("express");
//création de l'appli express avec la méthode "express"
const app = express();
const mongoose = require("mongoose");
const path = require("path");
//Ajout de "helmet" pour aider à sécuriser les applications Express en définissant divers en-têtes HTTP
const helmet = require("helmet");
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
//Ajout des fichiers routes
const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauce");
//ajout du package cors pour debug
var cors = require("cors");
app.use(cors());
//pour nous donner accès au corps de la requête
app.use(express.json());

mongoose
  .connect(
    `mongodb+srv://${process.env.USER}:${process.env.MDP}@cluster0.w4kb9px.mongodb.net/?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

//Permet de gérer la sécurité entre le serveur du back et celui du front => ici on autorise certains accès
app.use((req, res, next) => {
  //d'autoriser l'accès à notre API depuis n'importe quelle origine '*'
  res.setHeader("Access-Control-Allow-Origin", "*");
  //d'ajouter les headers mentionnés aux requêtes envoyées vers notre API
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  //d'envoyer des requêtes avec les méthodes mentionnées
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

//début de route utilisé pour le login + sauces + images
app.use("/api/auth", userRoutes);
app.use("/api/sauces", sauceRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
