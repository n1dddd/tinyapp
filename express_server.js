const express = require("express");
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const PORT = 8080;


app.use(morgan("tiny"));
app.use(bodyParser.urlencoded({ extended: true }));
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req,res) => {
  const templateVars = { urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("urls/new", (req,res) => {
  res.render("urls_new");
});


app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const longURLs = req.body.longURL;
  urlDatabase[id] = longURLs;
  console.log(urlDatabase);
  res.redirect(`/urls/${id}`);
});


app.get("/urls/:id", (req,res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req,res) => {
  res.send("<html><body>Hello <b>World<b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
