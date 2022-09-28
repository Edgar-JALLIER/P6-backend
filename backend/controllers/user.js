const User = require("../models/User");
const bcrypt = require("bcrypt");
//package pour vérifier les tokens d'authentification
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "../../.env" });

exports.signup = (req, res, next) => {
  console.log(req.body);
  //fonction pour hacher le MDP avant de l'enregistré dans la BDD => fonction async qui prend du temps
  bcrypt
    //le 10 indique le nombre de fois que l'on veux "saler" le MDP, plus le chiffre est élevé plus le hachage sera sécurisé
    .hash(req.body.password, 10)
    //promesse then qui renvoie le hash généré + création d'un nouvel objet "user" qui sera enregistré dans la BDD
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    //erreur 500 => problème serveur
    .catch((error) => res.status(500).json({ error }));
};

//Vérifier si le mail utilisateur est bien dans notre BDD + si le MDP transmis par le client correspond bien
exports.login = (req, res, next) => {
  //Utilise un filtre pour trouver le mail
  User.findOne({ email: req.body.email })
    //vérifier si l'utilisateur est bien trouvé
    .then((user) => {
      //si user === nul
      if (!user) {
        //Attention ici le message renvoyé reste flou et n'indique pas si l'utilisateur existe ou non => données sécurisés
        return res
          .status(401)
          .json({ message: "Paire identifiant/mot de passe incorrecte" });
      } else {
        //On compare le MDP qui est transmis par le client et ce qui est enregistré dans la BDD
        bcrypt
          //en 1er ce qui est transmis par le client et ensuite ce qui est dans notre BDD
          .compare(req.body.password, user.password)
          .then((valid) => {
            if (!valid) {
              return res
                .status(401)
                .json({ message: "Paire identifiant/mot de passe incorrecte" });
            }
            res.status(200).json({
              userId: user._id,
              // fonction "sign" pour mettre des données à encoder => chiffrer un nouveau token, le token contient l'ID de l'utilisateur en tant que payload
              // chaine secrete pour crypter notre token => en remplacer par une chaine aléatoire
              // validité du token est de 24h
              token: jwt.sign(
                { userId: user._id },
                `${process.env.KEY_TOKEN}`,
                {
                  expiresIn: "24h",
                }
              ),
            });
          })
          .catch((error) => res.status(500).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
