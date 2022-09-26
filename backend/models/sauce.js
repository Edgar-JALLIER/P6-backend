const mongoose = require("mongoose");

//Création du modèle qui contient les champs souhaités pour chaque "sauce"
//Pas besoin de mettre de champ ID puisqu'il est fait automatiquement par Mongoose
const sauceSchema = mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true },
  likes: { type: Number, default: 0, required: false },
  dislikes: { type: Number, default: 0, required: false },
  usersLiked: { type: [String], default: [], required: false },
  usersDisliked: { type: [String], default: [], required: false },
});

//Il faut exporter le modèle pour pouvoir l'utiliser dans notre application
module.exports = mongoose.model("Sauce", sauceSchema);
