var express = require("express");
var cookieParser = require('cookie-parser')
var app = express();
app.use(cookieParser())
var PORT = 8080;

app.set("view engine", "ejs")
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

app.get("/urls", (req, res) => {
  let templateVars = {
   urls: urlDatabase,
   username: req.cookies["user_id"]
 };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
   username: req.cookies["user_id"]
 };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  res.render("urls_register")
});

app.post("/register", (req, res) => {
  // console.log(req.body.email)
  var userID = generateRandomString(6)
  const email = req.body.email
  const password = req.body.password
  if(email === "" || password === ""){
    res.status(400);
    res.send('fields not there');
    return
  }

  if(emailExisted(email)){
    res.status(400);
    res.send('email already used')
    return
  }

  addUser(userID, email, password)

  res.cookie('user_id', userID);
  res.redirect('/urls')
})

function emailExisted(email){
  for(var key in users){
    if(users[key].email === email){
    return true;
    }
  }
}

function addUser(userID, email, password) {
users[userID] = {
    id: userID,
    email: email,
    password: password
  }
}

app.post("/urls", (req, res) => {
  console.log("test", req.body);
  var shortURL = generateRandomString(6)
  urlDatabase[shortURL] = req.body.longURL
  res.redirect("/urls" + shortURL);
});

app.post("/login", (req, res) => {
  //loop the users to find
  res.cookie('user_id', req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL
  // console.log(shortURL, req.body.longURL)
  urlDatabase[shortURL] = req.body.longURL
  res.redirect('/urls')
})

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL]
  res.redirect('/urls')
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

function generateRandomString(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});