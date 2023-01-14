const express = require("express");
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');
const {getUserByEmail, generateRandomString, urlsForUser, userValidator} = require('./helpers');

const app = express();
const PORT = 8080;


app.use(morgan("tiny"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1','key2']
}));

app.set('view engine', 'ejs');

const urlDatabase = {

};

const users = {

}

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  if (!templateVars.user) {
    res.status(401).send("Must be logged in to see urls")
  }
  templateVars.urls = urlsForUser(templateVars.user["id"], urlDatabase)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!users[req.session.user_id]) {
    res.redirect("/login")
  }
  const templateVars = { user: users[req.session.user_id] }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session.user_id] };
  if(!users[req.session.user_id]) {
    res.status(401).send("Must be logged in to see this")
  }
  if (users[req.session.user_id] && !(urlsForUser(templateVars.user["id"], urlDatabase)[templateVars.id])) {
    res.status(403).send("Not your urls")
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls"); 
  }
  else if (!users[req.session.user_id]) {
    const templateVars = { user: users[req.session.user_id] }
    res.render("register", templateVars)
  }
});

app.get("/login", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  }
  else if (!users[req.session.user_id]) {
    const templateVars = { user: users[req.session.user_id] };
    res.render("login", templateVars)
  }
});

app.post("/urls", (req, res) => {
  if (!users[req.session.user_id]) {
    res.status(401).send(`Must be logged into the shorten urls`)
  }
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = {
    longURL: longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const variables = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]['longURL'],
    user: req.session.user_id
  }
  if(!users[req.session.user_id]) {
    res.status(401).send("Must be logged in to do this")
  }
  const id = getUserByEmail(req.body.email, users);
  if (users[req.session.user_id] && !(urlsForUser(variables.user, urlDatabase)[variables.id])) {
    res.status(403).send("Not yours to delete!")
  }
  delete urlDatabase[variables.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const variables = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]['longURL'],
    user: req.session.user_id
  }
  if(!users[req.session.user_id]) {
    res.status(401).send("Must be logged in to do this")
  }
  if(users[req.session.user_id] && !(urlsForUser(variables.user, urlDatabase)[variables.id])) {
    res.status(403).send('Not yours to update!')
  }
  urlDatabase[req.params.id].longURL = req.body.newURL;
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  const id = getUserByEmail(req.body.email, users);
  if (userValidator('email', req.body, users)) {
    return res.status(404).send(`${req.body.email} user cannot be found.`)
  }
  if (!bcrypt.compareSync(req.body.password, users[id].hashedPassword)) {
    return res.status(401).send('Incorrect password');
  }
  req.session.user_id = users[id].id
  res.redirect('/urls')
})

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login")
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send(`Please enter valid entriers into BOTH data fields`);
  }
  else if (!userValidator('email', req.body, users)) {
    return res.status(400).send(`User with the email ${req.body['email']} already registered.`);
  }
  else if (userValidator('email', req.body, users)) {
    const email = req.body.email;
    const password = req.body.password
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userRandomId = generateRandomString();
    users[userRandomId] = {
      id: userRandomId,
      email,
      hashedPassword
    }
    req.session.user_id = userRandomId;
    res.redirect("/urls")
  }
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
