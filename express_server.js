const express = require("express");
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080;


app.use(morgan("tiny"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine','ejs');

const generateRandomString = function() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const urlDatabase = {
  
};

app.get("/urls", (req,res) => {
  const templateVars = { urls: urlDatabase , username: req.cookies['username']};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const longURLs = req.body.longURL;
  urlDatabase[id] = longURLs;
  res.redirect(`/urls/${id}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies['username'] }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req,res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies['username']};
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req,res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("urls/new", (req,res) => {
  const templateVars = { username: req.cookies['username'] }
  res.render("urls_new", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req,res) => {
  res.send("<html><body>Hello <b>World<b></body></html>\n");
});

app.post("/urls/:id/delete", (req,res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect(`/urls`);
});

app.post("/urls/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls")
})

app.post("/logout", (req,res) => {
  res.clearCookie("username");
  res.redirect("/urls")
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
