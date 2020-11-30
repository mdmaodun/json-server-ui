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

    // collections
    //   .remove((v) => {
    //     return (
    //       v.dbId === dbId &&
    //       Object.keys(jsonObj)
    //         .map((v) => v.trim())
    //         .includes(v.name)
    //     );
    //   })
    //   .write();

    const collectionsOfTheDB = collections.filter((v) => v.dbId === dbId).value();

    const jsonObjEntriesOfNotInTheDBCollecitons = Object.entries(jsonObj).filter(([k, v]) =>
      collectionsOfTheDB.every((c) => c.name !== k.trim())
    );

    const now = Date.now();

    for (const [k, v] of jsonObjEntriesOfNotInTheDBCollecitons) {
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
    const state = db2.getState();
    const keys = Object.keys(state);

    for (const [k, v] of Object.entries(jsonObj)) {
      if (keys.includes(k)) {
        if (db._.isArray(v)) {
          if (db._.isArray(state[k])) {
            state[k].push(...v);
          } else {
            state[k] = v;
          }
        } else {
          if (db._.isPlainObject(state[k])) {
            state[k] = { ...state[k], ...v };
          } else {
            collections.remove((v) => v.dbId === dbId && v.name === k.trim()).write();
            state[k] = v;
          }
        }
      } else {
        state[k] = v;
      }
    }
    db2.setState(state).write();

    res.send('ok.');
    return;
  }
  next();
};
