const express = require("express");
const bodyParser = require('body-parser')
const morgan = require('morgan')
const app = express();
const PORT = 8080;

function generateRandomString() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result;
}

app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

app.set('view engine','ejs');

const urlDatabase = {
  "b2xVn2": "http://lighthouselabs.ca",
  "9sm5xK": "http://google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req,res) => {
  const templateVars = { urls: urlDatabase};
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})

// app.get("urls/new", (req,res) => {
//   res.render("urls_new");
// })

app.post("/urls",(req,res)=> {
  console.log(req.body);
  res.send("Ok");
})

app.post("/urls", (req, res) => {
  res.redirect(`/urls/${id}`)
})

app.get("/urls/:id", (req,res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars)
}) 

app.get("/hello", (req,res) => {
  res.send("<html><body>Hello <b>World<b></body></html>\n")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})