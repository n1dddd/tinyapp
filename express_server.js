const express = require("express");
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { getUserByEmail, generateRandomString, urlsForUser, userValidator } = require('./helpers');

const app = express();
const PORT = 8080;


app.use(morgan("tiny"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.set('view engine', 'ejs');

const urlDatabase = {

};

const users = {

};

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  if (!templateVars.user) { //check if user logged in
    res.status(401).send("Must be logged in to see urls");
  }
  templateVars.urls = urlsForUser(templateVars.user["id"], urlDatabase); //set template.Vars.urls to the urls held in the matched user_id database
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (!templateVars.user) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session.user_id] };
  if (!templateVars.user) {
    res.status(401).send("Must be logged in to see this");
  }
  if (templateVars.user && !(urlsForUser(templateVars.user["id"], urlDatabase)[templateVars.id])) { //checks if user, then validated that the urls they are trying to access are not theirs
    res.status(403).send("Not your urls");
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (templateVars.user) { //if logged in, redirect to /urls
    res.redirect("/urls");
  } else if (!templateVars.user) {
    res.render("register", templateVars);
  }
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (templateVars.user) {
    res.redirect("/urls");
  } else if (!templateVars.user) {
    res.render("login", templateVars);
  }
});

app.post("/urls", (req, res) => {
  if (!users[req.session.user_id]) {
    res.status(401).send(`Must be logged into the shorten urls`);
  }
  const id = generateRandomString(); //id for url property
  const longURL = req.body.longURL;
  urlDatabase[id] = { //set longURL and userID to id in urlDatabase object
    longURL: longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const variables = { //create object to access variables from
    id: req.params.id,
    longURL: urlDatabase[req.params.id]['longURL'],
    user: req.session.user_id
  };
  if (!variables.user) {
    res.status(401).send("Must be logged in to do this");
  }
  if (variables.user && !(urlsForUser(variables.user, urlDatabase)[variables.id])) {
    res.status(403).send("Not yours to delete!");
  }
  delete urlDatabase[variables.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const variables = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]['longURL'],
    user: req.session.user_id
  };
  if (!variables.user) {
    res.status(401).send("Must be logged in to do this");
  }
  if (variables.user && !(urlsForUser(variables.user, urlDatabase)[variables.id])) {
    res.status(403).send('Not yours to update!');
  }
  urlDatabase[req.params.id].longURL = req.body.newURL;
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  const id = getUserByEmail(req.body.email, users);
  if (userValidator('email', req.body, users)) { //validates if the email is already in the database
    return res.status(404).send(`${req.body.email} user cannot be found.`);
  }
  if (!bcrypt.compareSync(req.body.password, users[id].hashedPassword)) {
    return res.status(401).send('Incorrect password');
  }
  req.session.user_id = users[id].id;
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send(`Please enter valid entriers into BOTH data fields`);
  } else if (!userValidator('email', req.body, users)) {
    return res.status(400).send(`User with the email ${req.body['email']} already registered.`);
  } else if (userValidator('email', req.body, users)) {
    const hashedPassword = bcrypt.hashSync(password, 10); //hash password
    const userRandomId = generateRandomString();
    users[userRandomId] = { //create new user with generated random string in users object
      id: userRandomId,
      email,
      hashedPassword
    };
    req.session.user_id = userRandomId; //set cookie to generated random string (or user identifier)
    res.redirect("/urls");
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
