const getdb = require('../utils/getdb');
const { join } = require('path');
const db = getdb(join(__dirname, '../db.json'));
const runjsonserver = require('../utils/runjsonserver');
const { dbsRootDirPath } = require('../utils/consts');
const killPort = require('kill-port');

module.exports = (req, res, next) => {
  const { method, path } = req;

  if (method === 'POST' && path === '/runServer') {
    const { body } = req;
    const { dbId, port, utime } = body;

    db.read();

    const dbOfLowdb = db.get('dbs').find({ id: dbId });
    const { name, status } = dbOfLowdb.value();

    if (status === 'running') {
      res.send('The API service for this database has already been started.');
      return;
    }

    const dbJsonFilePath = join(dbsRootDirPath, name, 'db.json');

    runjsonserver({ dbJsonFilePath, port })
      .then(({ pid: processId }) => {
        dbOfLowdb.assign({ status: 'running', port, processId, utime }).write();
        res.send('ok.');
      })
      .catch((err) => {
        res.status(400).send(err.message);
      });

    return;
  }

  if (method === 'POST' && path === '/stopServer') {
    const { body } = req;
    const { dbId, utime } = body;

    db.read();

    const dbOfLowdb = db.get('dbs').find({ id: dbId });
    const { status, port } = dbOfLowdb.value();

    if (status === 'stopped') {
      res.send('The API service for this database has already been stopped.');
      return;
    }

    dbOfLowdb.assign({ status: 'stopped', processId: '', utime }).write();

    killPort(port).catch((err) => {
      console.log('kill err1.', err.message);
    });
    res.send('ok.');
    return;
  }

  next();
};
