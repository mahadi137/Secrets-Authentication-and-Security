require('dotenv').config();
const express = require ("express");
const bodyParser = require ("body-parser");
const ejs = require ("ejs");
const mongoose = require ("mongoose");
const encrypt = require('mongoose-encryption');


const app = express ();

app.use (express.static ("public"));
app.set ("view engine", "ejs");
app.use (bodyParser.urlencoded ({
  extended: true
}));

/////////////////////// Database for Users ///////////////////////
mongoose.connect ("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});

 const userSchema = new mongoose.Schema ({
   email: String,
   password: String
 });

/////////////////////// Password Encryption ///////////////////////
userSchema.plugin(encrypt, { process.env.SECRET, encryptedFields: ["password"] });

const User = new mongoose.model ("user", userSchema);


/////////////////////// Get request routes ///////////////////////
app.get ("/", function (req, res) {
  res.render ("home");
});

app.get ("/login", function (req, res) {
  res.render ("login");
});

app.get ("/register", function (req, res) {
  res.render ("register");
});

/////////////////////// Post request for registration ///////////////////////
app.post ("/register", function (req, res) {
  const newUser = new User ({
    email: req.body.username,
    password: req.body.password
  });

  newUser.save (function (err) {
    if (!err) {
      // Open success page if user registered
      res.render ("registered");
    }
  });
});

/////////////////////// Post request for login ///////////////////////
app.post ("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password

// Find the user and match password
  User.findOne ({email: username}, function (err, foundUser) {
    if (err) {
      console.log (err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render ("Secrets");
        }
      }
    }
  });
});






/////////////////////// Listening PORT ///////////////////////
app.listen (3000, function () {
  console.log ("Server started on port 3000.");
});
