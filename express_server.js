const express = require("express");
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieParser = require('cookie-parser')

const app = express();
const PORT = 8080;


app.use(morgan("tiny"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.set('view engine', 'ejs');

const generateRandomString = function () {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const emailValidator = function (userProperty, reqBody, database) { //Function to return if user email registered in database
  for (const user in database) {
    if (reqBody[userProperty] === database[user][userProperty]) {
      return false
    }
  }
  return true;
}

const urlDatabase = {

};

const users = {

}

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.cookies.user_id };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: req.cookies.user_id }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: req.cookies.user_id };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("urls/new", (req, res) => {
  const templateVars = { user: req.cookies.user_id }
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  res.render("register")
});

app.get("/login", (req, res) => {
  res.render("login")
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const longURLs = req.body.longURL;
  urlDatabase[id] = longURLs;
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  res.cookie('user_id', req.cookie.user_id);
  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls")
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send(`Please enter valid entriers into BOTH data fields`);
  }
  else if (!emailValidator('email', req.body, users)) {
    return res.status(400).send(`User with the email ${req.body['email']} already registered.`);
  }
  else if (emailValidator('email', req.body, users)) {
    const email = req.body.email;
    const password = req.body.password
    const userRandomId = generateRandomString();
    users[userRandomId] = {
      id: userRandomId,
      email,
      password
    }
    res.cookie('user_id', users[userRandomId])
    res.redirect("/urls")
  }
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
