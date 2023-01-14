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

const getUserByEmail = function (email, database) {
  for (const id in database) {
    if (email === database[id]['email']) {
      return database[id]['id']
    }
  }
}

const urlsForUser = (id, database) => {
  const matchingIdObject = {};
  for (const key in database) {
    if (database[key].userID === id) {
      matchingIdObject[key] = database[key];
    }
  }
  return matchingIdObject;
}

module.exports = {
  generateRandomString,
  userValidator,
  getUserByEmail,
  urlsForUser
}