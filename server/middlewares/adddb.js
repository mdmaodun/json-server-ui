const fs = require('fs');
const path = require('path');
const { dbsRootDirPath } = require('../utils/consts');
// if (!fs.existsSync(dbsRootDirPath)) {
//   fs.mkdirSync(dbsRootDirPath);
// }

module.exports = (req, res, next) => {
  const { method, path: path2, body } = req;
  if (method === 'POST' && path2.startsWith('/dbs')) {
    body.status = 'stopped'; // stopped|running
    body.port = '';
    body.processId = '';
    const { name } = body;
    const dbDirPath = path.join(dbsRootDirPath, name);
    const middlewaresDirPath = path.join(dbDirPath, 'middlewares');
    const uploadMiddlewareFilePathDest = path.join(middlewaresDirPath, './upload.js');
    fs.mkdirSync(middlewaresDirPath, { recursive: true });
    if (!fs.existsSync(uploadMiddlewareFilePathDest)) {
      fs.copyFileSync(path.join(__dirname, './upload.js'), uploadMiddlewareFilePathDest);
    }
    fs.writeFileSync(path.join(dbDirPath, 'routes-map.json'), '{}');
    fs.writeFileSync(
      path.join(dbDirPath, `db.json`),
      JSON.stringify(
        {
          _db: {
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
