const { join } = require('path');
const cmdexec = require('./utils/cmdexec');

module.exports = () => {
  const cmd = `cd server && npx json-server --config ${join(__dirname, 'json-server.json')} ${join(
    __dirname,
    'db.json'
  )}`;
  cmdexec(cmd);
};
