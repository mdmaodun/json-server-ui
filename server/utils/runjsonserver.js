const { spawn } = require('child_process');
const isInUseOfPort = require('../utils/isInUseOfPort');
const { readdirSync } = require('fs');
const { dirname, join } = require('path');

module.exports = ({ dbJsonFilePath, port }) => {
  return isInUseOfPort(port).then((isInUse) => {
    if (isInUse) {
      throw new Error(`This port:${port} is already occupied`);
    }

    const middlewaresDirPath = join(dirname(dbJsonFilePath), 'middlewares');
    const filePaths = readdirSync(middlewaresDirPath).map((v) => join(middlewaresDirPath, v));

    const childProcess = spawn(
      'npx',
      ['json-server', '--port', port, '--middlewares', ...filePaths, '--watch', dbJsonFilePath],
      {
        detached: true,
        stdio: 'ignore',
        windowsHide: true,
      }
    );
    childProcess.unref();
    console.log(childProcess.pid, 'childProcess.pid');
    return childProcess;
  });
};
