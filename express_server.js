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

const generateRandomString = function () { //function to return randomized 6 char string
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const userValidator = function (userProperty, reqBody, database) { //Function to return false if user email registered in users database, true if not
  for (const user in database) {
    if (reqBody[userProperty] === database[user][userProperty]) {
      return false
    }
  }
  return true;
}

const urlsForUser = (id, database) => {
  const matchingIdObject = {};
  for (const key in database) {
    if (database[key].userID === id) {
      matchingIdObject[key] = database[key];
    }
  }
  console.log(matchingIdObject)
  return matchingIdObject;
}

const urlDatabase = {

};

const users = {

}

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  if (!users[req.cookies.user_id]) {
    res.status(401).send("Must be logged in to see urls")
  }
  templateVars.urls = urlsForUser(templateVars.user["id"], urlDatabase)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!users[req.cookies.user_id]) {
    res.redirect("/login")
  }
  const templateVars = { user: users[req.cookies.user_id] }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.cookies.user_id] };
  if(!users[req.cookies.user_id]) {
    res.status(401).send("Must be logged in to see this")
  }
  if (users[req.cookies.user_id] && !(urlsForUser(templateVars.user["id"], urlDatabase)[templateVars.id])) {
    res.status(403).send("Not your urls")
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  if (users[req.cookies.user_id]) {
    res.redirect("/urls");
  }
  else if (!users[req.cookies.user_id]) {
    const templateVars = { user: users[req.cookies.user_id] }
    res.render("register", templateVars)
  }
});

app.get("/login", (req, res) => {
  if (users[req.cookies.user_id]) {
    res.redirect("/urls");
  }
  else if (!users[req.cookies.user_id]) {
    const templateVars = { user: users[req.cookies.user_id] };
    res.render("login", templateVars)
  }
});

app.post("/urls", (req, res) => {
  if (!users[req.cookies.user_id]) {
    res.status(401).send(`Must be logged into the shorten urls`)
  }
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = {
    longURL: longURL,
    userID: req.cookies.user_id
  };
  console.log(urlDatabase)
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  if(!users[req.cookies.user_id]) {
    res.status(401).send("Must be logged in to do this")
  }
  if (users[req.cookies.user_id] && !(urlsForUser(users["id"], urlDatabase)[req.params.id])) {
    res.status(404).send("Not yours to delete!")
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  if(!users[req.cookies.user_id]) {
    res.status(401).send("Must be logged in to do this")
  }
  if(users[req.cookies.user_id] && !(urlsForUser(users["id"], urlDatabase)[req.params.id]))
  urlDatabase[req.params.id].longURL = req.body.newURL;
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  if (userValidator('email', req.body, users)) {
    return res.status(403).send(`${req.body.email} user cannot be found.`)
  }
  else if (userValidator('password', req.body, users)) {
    return res.status(403).send('Incorrect password');
  }
  else if (!userValidator('password', req.body, users)) {
    res.cookie('user_id', users.user.id)
    res.redirect("/urls")
  }
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
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
    const userRandomId = generateRandomString();
    users[userRandomId] = {
      id: userRandomId,
      email,
      password
    }
    res.cookie('user_id', userRandomId)
    res.redirect("/urls")
  }
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
