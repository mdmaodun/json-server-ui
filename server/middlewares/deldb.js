const fs = require('fs');
const path = require('path');
const getdb = require('../utils/getdb.js');
const db = getdb(path.join(__dirname, '../db.json'));
const UrlPattern = require('url-pattern');
const idParamsPattern = new UrlPattern('/dbs(/:id)');
const { dbsRootDirPath } = require('../utils/consts');

module.exports = (req, res, next) => {
  const { method, path: path2 } = req;
  if (method === 'DELETE' && path2.startsWith('/dbs/')) {
    const params = idParamsPattern.match(path2);
    const id = parseInt(params.id);
    db.read();
    db.get('collections')
      .remove({ dbId: id })
      .write();
    const { name } = db
      .get('dbs')
      .find({ id })
      .value();
    fs.rmdirSync(path.join(dbsRootDirPath, name), { recursive: true });
  }
  next();
};
