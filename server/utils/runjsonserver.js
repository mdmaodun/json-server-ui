const { spawn } = require('child_process');
const isInUseOfPort = require('../utils/isInUseOfPort');

module.exports = ({ dbJsonFilePath, port }) => {
  return isInUseOfPort(port).then((isInUse) => {
    if (isInUse) {
      throw new Error(`This port:${port} is already occupied`);
    }
    const childProcess = spawn('npx', ['json-server', '--port', port, '--watch', dbJsonFilePath], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    });
    childProcess.unref();
    console.log(childProcess.pid, 'childProcess.pid');
    return childProcess;
  });
};
