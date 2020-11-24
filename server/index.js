const { join } = require('path');
const { existsSync, writeFileSync } = require('fs');
const cmdexec = require('./utils/cmdexec');

const confFilePath = join(__dirname, 'json-server.json');
const dbFilePath = join(__dirname, './db.json');

module.exports = () => {
  if (!existsSync(dbFilePath)) {
    var initJSON = {
      db: {
        version: '1.0.0',
      },
      dbs: [],
      collections: [],
    };
    writeFileSync(dbFilePath, JSON.stringify(initJSON, null, 2));
  }

  const cmd = `cd server && npx json-server --config ${confFilePath} ${dbFilePath}`;
  cmdexec(cmd);
};
