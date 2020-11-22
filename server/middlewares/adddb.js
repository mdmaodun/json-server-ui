const fs = require('fs');
const path = require('path');
const { dbsRootDirPath } = require('../utils/consts');
if (!fs.existsSync(dbsRootDirPath)) {
  fs.mkdirSync(dbsRootDirPath);
}

module.exports = (req, res, next) => {
  const { method, path: path2, body } = req;
  if (method === 'POST' && path2.startsWith('/dbs')) {
    body.status = 'stopped'; // stopped|running
    body.port = '';
    body.processId = '';
    const { name } = body;
    fs.mkdirSync(path.join(dbsRootDirPath, name));
    fs.writeFileSync(
      path.join(dbsRootDirPath, `${name}/db.json`),
      JSON.stringify(
        {
          db: {
            version: '1.0.0',
          },
        },
        null,
        2
      )
    );
  }
  next();
};
