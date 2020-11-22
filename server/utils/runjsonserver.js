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
      if (filePaths.length) {
        middlewaresConfigs.push('--middlewares', ...filePaths);
      }
    }
    const isWin = process.platform === 'win32';
    try {
      const childProcess = spawn(
        isWin ? 'npx.cmd' : 'npx',
        ['json-server', '--port', port, ...middlewaresConfigs, '--watch', dbJsonFilePath],
        {
          detached: isWin ? false : true,
          // ...(isWin ? {} : { detached: true }),
          stdio: 'ignore',
          windowsHide: true,
        }
      );
      childProcess.unref();
      console.log(childProcess.pid, 'childProcess.pid');
      return childProcess;
    } catch (err) {
      throw new Error(`spawn run err.` + err.message);
    }
  });
};
