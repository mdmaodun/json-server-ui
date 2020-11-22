const { spawn } = require('child_process');
const isInUseOfPort = require('../utils/isInUseOfPort');
const { existsSync, readdirSync } = require('fs');
const { dirname, join } = require('path');

module.exports = ({ dbJsonFilePath, port }) => {
  return isInUseOfPort(port).then((isInUse) => {
    if (isInUse) {
      throw new Error(`This port:${port} is already occupied`);
    }

    const middlewaresDirPath = join(dirname(dbJsonFilePath), 'middlewares');

    const middlewaresConfigs = [];
    if (existsSync(middlewaresDirPath)) {
      const filePaths = readdirSync(middlewaresDirPath).map((v) => join(middlewaresDirPath, v));
      middlewaresConfigs.push('--middlewares', ...filePaths);
    }

    const childProcess = spawn(
      'npx',
      ['json-server', '--port', port, ...middlewaresConfigs, '--watch', dbJsonFilePath],
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
