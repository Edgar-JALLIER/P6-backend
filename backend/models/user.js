const uniqueValidator = require("mongoose-unique-validator");
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

//on utilise "uniqueValidator" pour être sur que une adresse mail soit autorisé par compte
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
