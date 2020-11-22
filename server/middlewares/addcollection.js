const { join } = require('path');
const getdb = require('../utils/getdb.js');
const db = getdb(join(__dirname, '../db.json'));
const { dbsRootDirPath } = require('../utils/consts');

module.exports = (req, res, next) => {
  const { method, path, body } = req;
  if (method === 'POST' && path.startsWith('/collections')) {
    const { dbId, name } = body;
    db.read();
    const { name: dbName } = db
      .get('dbs')
      .find({ id: dbId })
      .value();
    const db2 = getdb(join(dbsRootDirPath, dbName, 'db.json'));
    db2.read();
    db2.set(name, []).write();
  }
  next();
};
