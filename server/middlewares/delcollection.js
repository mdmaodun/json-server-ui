const { join } = require('path');
const getdb = require('../utils/getdb.js');
const db = getdb(join(__dirname, '../db.json'));
const UrlPattern = require('url-pattern');
const idParamsPattern = new UrlPattern('/collections(/:id)');
const { dbsRootDirPath } = require('../utils/consts');

module.exports = (req, res, next) => {
  const { method, path } = req;
  if (method === 'DELETE' && path.startsWith('/collections/')) {
    let { id } = idParamsPattern.match(path);
    id = parseInt(id);
    db.read();

    const { name, dbId } = db
      .get('collections')
      .find({ id })
      .value();
    const { name: dbName } = db
      .get('dbs')
      .find({ id: dbId })
      .value();

    const db2 = getdb(join(dbsRootDirPath, dbName, 'db.json'));
    db2.read();
    db2.unset(name).write();
  }
  next();
};
