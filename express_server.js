var express = require("express");
var cookieSession = require('cookie-session')
var app = express();
const bcrypt = require('bcrypt');
var PORT = 8080;
app.use(cookieSession({
    name: 'session',
    keys: ["1"],
}))
app.set("view engine", "ejs")
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: true
}));
const urlDatabase = {
    b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "userRandomID"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
};
const users = {
    "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: bcrypt.hashSync("1", 10)
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: bcrypt.hashSync("dishwasher-funk", 10)
    },
}
app.get("/urls", (req, res) => {
    if (req.session.user_id === undefined) {
        return res.redirect("/login")
    }
    let ownUrls = {}
    for (var key in urlDatabase) {
        if (urlDatabase[key].userID === req.session.user_id) {
            ownUrls[key] = urlDatabase[key]
        }
    }
    let templateVars = {
        urls: ownUrls,
        email: users[req.session.user_id].email,
    };
    res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
    if (req.session.user_id === undefined) {
        return res.redirect("/login")
    }
    let templateVars = {
        email: users[req.session.user_id].email
    };
    res.render("urls_new", templateVars);
});
app.get("/register", (req, res) => {
    let templateVars = {
        email: ''
    };
    res.render("urls_register", templateVars)
});
app.get("/login", (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        email: req.session.user_email,
    };
    res.render("urls_login", templateVars)
});
app.post("/register", (req, res) => {
    var userID = generateRandomString(6)
    const email = req.body.email
    const password = req.body.password
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    if (email === "" || password === "") {
        res.status(400);
        res.send('fields not there');
        return
    }
    if (emailExisted(email)) {
        res.status(400);
        res.send('email already used')
        return
    }
    addUser(userID, email, hashedPassword)

    req.session['user_id'] = userID;
    res.redirect('/urls')
})
function emailExisted(email) {
    for (var key in users) {
        if (users[key].email === email) {
            return true;
        }
    }
}
function addUser(userID, email, hashedPassword) {
    users[userID] = {
        id: userID,
        email: email,
        password: hashedPassword
    }
}
app.post("/urls", (req, res) => {
    var shortURL = generateRandomString(6)
    urlDatabase[shortURL] = {
        longURL: req.body.longURL,
        userID: req.session.user_id
    }
    res.redirect("/urls");
});
app.post("/login", (req, res) => {
    var userID = generateRandomString(6)
    const email = req.body.email
    const password = req.body.password
    if (email === "" || password === "") {
        res.status(400);
        res.send('fields not there');
        return
    }
    if (!emailExisted(email)) {
        res.status(403);
        res.send('email is not existed')
        return
    }
    for (var key in users) {
        if (users[key].email === email && !bcrypt.compareSync(req.body.password, users[key].password)) {
            res.status(403);
            res.send('password is wrong')
            return
        } else if (users[key].email === email && bcrypt.compareSync(req.body.password, users[key].password)) {
            req.session['user_id'] = key;
            res.redirect('/urls')
            return
        }
    }
});
app.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/urls");
});
app.post('/urls/:shortURL', (req, res) => {
    const shortURL = req.params.shortURL
    urlDatabase[shortURL] = {
        longURL: req.body.longURL,
        userID: req.session.user_id
    }
    res.redirect('/urls')
})
app.get("/urls/:shortURL", (req, res) => {
    let ownUrls = {}
    for (var key in urlDatabase) {
        if (urlDatabase[key].userID === req.session.user_id) {
            ownUrls[key] = urlDatabase[key]
        }
    }
    let templateVars = {
        urls: ownUrls,
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL],
        user_id: req.session["user_id"],
        email: req.session.user_email
    };
    res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL].longURL
    res.redirect(longURL);
});
app.post('/urls/:shortURL/delete', (req, res) => {
    const shortURL = req.params.shortURL
    for (var key in urlDatabase) {
        if (urlDatabase[key].userID === req.session.user_id) {
            delete urlDatabase[shortURL]
        }
    }
    res.redirect('/urls')
})
app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});
function generateRandomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});
