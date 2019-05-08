var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

app.set("view engine", "ejs")
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.post("/urls", (req, res) => {
  console.log(req.body);
  var shortURL = generateRandomString(6)
  urlDatabase[shortURL] = req.body.longURL
  res.redirect("/urls/" + shortURL);
});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL
  console.log(shortURL, req.body.longURL)
  urlDatabase[shortURL] = req.body.longURL
  res.redirect('/urls')
})

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
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