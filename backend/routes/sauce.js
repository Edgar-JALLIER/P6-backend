const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const sauceCtrl = require("../controllers/sauce");
// Pour l'enregistrement de nouvelles images dans la BDD
const multer = require("../images/multer-config");

//On met l'authentification avant le multer pour que la route soit bien sécurisé avant les potentiels changements
router.post("/", auth, multer, sauceCtrl.createSauce);
// Utilisation de put pour la mise à jour / modification des données
// Utilisation de ":id" pour indiquer que c'est un élément dynamique

router.put("/:id", auth, multer, sauceCtrl.modifySauce);
router.get("/", auth, sauceCtrl.getAllSauce);
router.get("/:id", auth, sauceCtrl.getOneSauce);
// Utilisation de delete pour la suppression d'une donnée
router.delete("/:id", auth, multer, sauceCtrl.deleteSauce);
router.post("/:id/like", auth, sauceCtrl.likeSauce);

module.exports = router;
