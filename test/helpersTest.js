const { assert } = require('chai');

const {getUserByEmail} = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserId = "userRandomID"
    assert.strictEqual(user, expectedUserId)
  })
  it('should return undefined if user is not found in database', function() {
    const user = getUserByEmail("user3@example.com", testUsers)
    const expectedUserId = undefined;
    assert.strictEqual(user, expectedUserId)
  })
})