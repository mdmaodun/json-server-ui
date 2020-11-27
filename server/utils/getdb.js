const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

module.exports = (jsonFilePath) => {
  const db = lowdb(new FileSync(jsonFilePath));
  return db;
};

// const path = require('path');
// const lowdb = require('lowdb');
// const FileSync = require('lowdb/adapters/FileSync');
// const adapter = new FileSync(path.join(__dirname, '../db.json'));
// const db = lowdb(adapter);

// module.exports = () => db;
