const { join } = require('path');
const { existsSync, writeFileSync } = require('fs');
const cmdexec = require('./utils/cmdexec');

// const confFilePath = join(__dirname, 'json-server.json');
const dbFilePath = join(__dirname, './db.json');
const initdbFilePath = join(__dirname, './initdb.json');

module.exports = () => {
  const initJSON = {
    db: {
      version: '1.0.0',
    },
    dbs: [],
    collections: [],
  };
  if (!existsSync(dbFilePath)) {
    writeFileSync(dbFilePath, JSON.stringify(initJSON, null, 2));
  }

  if (!existsSync(initdbFilePath)) {
    writeFileSync(initdbFilePath, JSON.stringify(initJSON, null, 2));
  }

  // const cmd = `cd server && npx json-server --config ${confFilePath} ${dbFilePath}`;
  const cmd = `cd server && npx json-server ${dbFilePath}`;
  cmdexec(cmd);
};
