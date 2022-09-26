const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  //try permet d'essayer de faire ... sinon renvoie le catch
  try {
    //récupération du token en séparant la réponse et en récupérant uniquemnt la 2ème partie qui nous intéresse
    const token = req.headers.authorization.split(" ")[1];
    //décoder le token => utilisation de "verify" pour savoir si notre token est valide ou non
    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
    //extraction de l'ID utilisateur du token
    const userId = decodedToken.userId;
    //on le rajoute à l'objet request pour que nos routes puissent l'exploiter
    req.auth = {
      userId: userId,
    };
    //permet de passer à la prochaine middleware
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
