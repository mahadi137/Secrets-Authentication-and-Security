require('dotenv').config();
const express = require ("express");
const bodyParser = require ("body-parser");
const ejs = require ("ejs");
const mongoose = require ("mongoose");
const session = require ("express-session");
const passport = require ("passport");
const passportLocalMongoose = require ("passport-local-mongoose");


const app = express ();

app.use (express.static ("public"));
app.set ("view engine", "ejs");
app.use (bodyParser.urlencoded ({
  extended: true
}));

app.use(session({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize ());
app.use(passport.session ());


/////////////////////// Database for Users ///////////////////////
mongoose.connect ("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set ("useCreateIndex", true);

 const userSchema = new mongoose.Schema ({
   email: String,
   password: String,
   secret: String
 });

userSchema.plugin (passportLocalMongoose);

const User = new mongoose.model ("user", userSchema);

passport.use (User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser (User.serializeUser ());
passport.deserializeUser (User.deserializeUser ());


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

app.get ("/secrets", function (req, res) {

  User.find ({"secret": {$ne: null}}, function (err, foundUsers) {
    if (err) {
      console.log (err);
    } else {
      if (foundUsers) {
        res.render ("secrets", {usersWithSecrets: foundUsers});
      }
    }
  });
});

app.get ("/submit", function (req, res) {
  if (req.isAuthenticated ()) {
    res.render ("submit");
  } else {
    res.redirect ("/login");
  }
});

app.get ("/logout", function (req, res) {
  req.logout ();
  res.redirect ("/");
});

/////////////////////// Post request for Submit Secrets ///////////////////////
app.post ("/submit", function (req, res) {
  const submittedSecret = req.body.secret;

  User.findById (req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.secret = submittedSecret;
        foundUser.save (function () {
          res.redirect ("/secrets");
        });
      }
    }
  });
});


/////////////////////// Post request for registration ///////////////////////
app.post ("/register", function (req, res) {

  User.register ({username:req.body.username}, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.render ("register");
    } else {
      res.render ("registered");
    }
  });
});

/////////////////////// Post request for login ///////////////////////
app.post ("/login", function (req, res) {

  const user = new User ({
    username: req.body.username,
    password: req.body.password
  });

  req.login (user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate ("local") (req, res, function () {
        res.redirect ("/secrets");
      });
    }
  });
});



/////////////////////// Listening PORT ///////////////////////
app.listen (3000, function () {
  console.log ("Server started on port 3000.");
});
