const multer = require("multer");

//Bibliothèque des mime-types possible d'une image du frontend
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

//création d'un objet de configuration pour multer => enregistrement sur le disque grace à "diskStorage"
const storage = multer.diskStorage({
  // "destination" fonction pour savoir dans quel dossier on va stocker ces images
  destination: (req, file, callback) => {
    // "null" pour dire qu'il n'y a pas d'erreur / nom du dossier en 2ème argument
    callback(null, "images");
  },
  // "filname" fonction pour dire quel nom de fichier utiliser
  filname: (req, file, callback) => {
    // génération du nouveau nom utilisé
    // "originalname" permet de récupérer le nom d'origine du fichier enregistré par l'utilisateur => ensuite on remplace les espaces par des "_"
    const name = file.originalname.split(" ").join("_");
    // création de l'extension du fichier grace au mime_types des images
    const extension = MIME_TYPES[file.mimetype];
    // date.now => renvoi l'heure exacte de la publication pour la rendre unique
    callback(null, name + Date.now() + "." + extension);
  },
});

//on exporte le multer en lui mettant comme storage notre fonction et ensuite dire avec "single" que l'on accepte uniquement les images
module.exports = multer({ storage: storage }).single("image");
