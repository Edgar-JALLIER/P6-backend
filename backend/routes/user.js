const express = require("express");
//création du routeur avec la méthode Router de express
const router = express.Router();
//importation du controller "user" pour avoir la logique métier des routes
const userCtrl = require("../controllers/user");

//route pour enregistrement / connection des utilisateurs
router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);

//on exporte le router de ce fichier
module.exports = router;
