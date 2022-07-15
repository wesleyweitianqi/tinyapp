const getUserByEmail = function(email, database) {
  for (i in database) {
    if (database[i].email === email) {
      return database[i];
    }
  }
  return null;
}

module.exports = {getUserByEmail}