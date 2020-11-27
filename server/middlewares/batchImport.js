const { join } = require('path');
const getdb = require('../utils/getdb.js');
const db = getdb(join(__dirname, '../db.json'));
const { dbsRootDirPath } = require('../utils/consts');
const getNextId = require('../utils/getNextId');

module.exports = (req, res, next) => {
  const { method, path, body } = req;
  if (method === 'POST' && path === '/batchImport') {
    const { dbId, jsonObj } = body;

    db.read();

    const { name: dbName } = db
      .get('dbs')
      .find({ id: dbId })
      .value();

    let collections = db.get('collections');

    let nextId = getNextId(collections.value());

    collections
      .remove((v) => {
        return (
          v.dbId === dbId &&
          Object.keys(jsonObj)
            .map((v) => v.trim())
            .includes(v.name)
        );
      })
      .write();

    const now = Date.now();

    for (const [k, v] of Object.entries(jsonObj)) {
      if (db._.isArray(v)) {
        collections
          .push({
            name: k,
            description: '',
            dbId,
            ctime: now,
            utime: now,
            id: nextId++,
          })
          .write();
      }
    }

    const db2 = getdb(join(dbsRootDirPath, dbName, 'db.json'));
    db2.setState(db2._.assign(db2.getState(), jsonObj)).write();

    res.send('ok.');
    return;
  }
  next();
};
