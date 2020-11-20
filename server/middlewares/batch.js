const db = require('../utils/getdb.js')();

module.exports = (req, res, next) => {
  const { method, path, query, body } = req;
  if (['PUT', 'PATCH'].includes(method) && /^\/\w+\/?$/.test(path)) {
    let records = db.read().get(path.replace(/\//g, ''));
    if (!db._.isEmpty(query)) {
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
    } else {
      records = records.forEach((v) => db._.assign(v, body));
    }

    records.write();
    res.send('ok.');
    return;
  }
  next();
};
