// Ici on importe le model sauce pour récupérer les champs enregistrés par l'utilisateur
const Sauce = require("../models/sauce");
//ajout de fs => "file system" pour pouvoir modifer les fichiers
const fs = require("fs");
//----------------Création de nouvelle sauce-----------------
exports.createSauce = (req, res, next) => {
  //il faut parse l'objet requête => JSON vers JS
  const sauceInfos = JSON.parse(req.body.sauce);
  console.log(sauceInfos);
  //supprimer dans cette objet l'id puisqu'il est généré automatiquement par la BDD
  delete sauceInfos._id;
  //supprimer le champ userId puisque il est possible d'utiliser le meme userId pour se faire passer pour quelqu'un d'autre
  delete sauceInfos._userId;
  //création de l'objet sans les éléments supprimés
  const sauce = new Sauce({
    ...sauceInfos,
    // remplacement de l'userId extrait du token du middleware d'authentification
    userId: req.auth.userId,
    // génération de l'URL par nous même puisque multer ne nous passe que le nom du fichier
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [""],
    usersDisliked: [""],
  });
  sauce
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

//---------------- Modification d'une sauce ----------------
exports.modifySauce = (req, res, next) => {
  //il faut savoir si il y a un champ file dans notre requete => l'utilisateur à t-il modifier l'image ?
  //si oui je modifie l'URL de l'image
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : //si non, alors je prend tout le reste
      { ...req.body };
  //pour la sécurité il faut supprimer le user-Id venant de la requête puisque sinon quelqu'un pourrait modifier le user-Id et asigner un objet à une autre personne
  delete sauceObject._userId;
  //chercher l'objet dans la BDD pour savoir si l'utilisateur qui veux modifier l'objet est bien celui qui l'a créé
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(403).json({ message: "Not authorized" });
      } else {
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

//---------------- Affichage d'une sauce choisie -----------------
exports.getOneSauce = (req, res, next) => {
  //On cherche une sauce qui a le même ID que le paramètre de la requête
  Sauce.findOne({ _id: req.params.id })
    //si la sauce est trouvé elle est renvoyée au frontend
    .then((sauce) => res.status(200).json(sauce))
    //si pas de sauce trouvée alors erreur 404
    .catch((error) => res.status(404).json({ error }));
};

//---------------- Affichage de toutes les sauces -----------------
exports.getAllSauce = (req, res, next) => {
  //"find" pour retourner toutes les sauces
  Sauce.find()
    .then((toutesLesSauces) => res.status(200).json(toutesLesSauces))
    .catch((error) => res.status(400).json({ error }));
};

//--------------- Supprimer une sauce -----------------
exports.deleteSauce = (req, res, next) => {
  //récupération de la sauce avec l'id
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      //si ce n'est pas le créateur de la sauce on autorise pas
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
        //si c'est bien le créateur alors il faut supprimer la sauce dans la BBD mais aussi supprimer l'image du système de fichiers
      } else {
        //on trouve le numéro de l'image en supprimant "images" de l'URL
        const filename = sauce.imageUrl.split("/images/")[1];
        //Puis on l'enlève du dossier images
        fs.unlink(`images/${filename}`, () => {
          //suppression de la sauce dans la BDD
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

//-----------------Like et Dislike des sauces---------------------

exports.likeSauce = (req, res, next) => {
  const userId = req.body.userId;
  const like = req.body.like;
  const sauceId = req.params.id;

  switch (like) {
    case 1:
      Sauce.updateOne(
        { _id: sauceId },
        { $push: { usersLiked: userId }, $inc: { likes: +1 } }
      )
        .then(() => {
          res.status(200).json({ message: "Like ajouté" });
          test = res;
        })
        .catch((error) => res.status(400).json({ error }));
      break;

    case -1:
      Sauce.updateOne(
        { _id: sauceId },
        { $push: { usersDisliked: userId }, $inc: { dislikes: +1 } }
      )
        .then(() => res.status(200).json({ message: "Dislike ajouté" }))
        .catch((error) => res.status(400).json({ error }));
      break;

    case 0:
      Sauce.findOne({ _id: sauceId })
        .then((sauce) => {
          if (sauce.usersLiked.includes(userId)) {
            Sauce.updateOne(
              { _id: sauceId },
              { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
            )
              .then(() => res.status(200).json({ message: "Like annulé" }))
              .catch((error) => res.status(400).json({ error }));
          }
          if (sauce.usersDisliked.includes(userId)) {
            Sauce.updateOne(
              { _id: sauceId },
              { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } }
            )
              .then(() => res.status(200).json({ message: "Dislike annulé" }))
              .catch((error) => res.status(400).json({ error }));
          }
        })
        .catch((error) => res.status(404).json({ error }));
      break;
  }
};
