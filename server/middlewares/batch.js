const { join } = require('path');
const getdb = require('../utils/getdb.js');
const db = getdb(join(__dirname, '../db.json'));

module.exports = (req, res, next) => {
  const { method, path, query, body } = req;
  if (['PUT', 'PATCH', 'DELETE'].includes(method) && /^\/\w+\/?$/.test(path)) {
    let records = db.read().get(path.replace(/\//g, ''));
    if (method !== 'DELETE' && !db._.isEmpty(query)) {
      records = records.filter((obj) => {
        for ([k, v] of Object.entries(query)) {
          if (obj[k] != v) {
            return false;
          }
        }
        return true;
      });
    }
    if (method === 'PUT') {
      records = records.forEach((v) => {
        const id = v.id;
        for (k of Object.keys(v)) {
          delete v[k];
        }
        db._.assign(v, { ...body, id });
      });
    } else if (method === 'PATCH') {
      records = records.forEach((v) => db._.assign(v, body));
    } else if (method === 'DELETE') {
      records = records.remove((obj) => {
        for ([k, v] of Object.entries(query)) {
          if (obj[k] != v) {
            return false;
          }
        }
        return true;
      });
    }

    records.write();
    res.send('ok.');
    return;
  }
  next();
};
