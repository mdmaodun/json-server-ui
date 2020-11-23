const { spawn } = require('child_process');
const isInUseOfPort = require('../utils/isInUseOfPort');
const { existsSync, readdirSync } = require('fs');
const { dirname, join } = require('path');
const getIPAddressOfLAN = require('../utils/getIPAddressOfLAN');

module.exports = ({ dbJsonFilePath, port }) => {
  return isInUseOfPort(port).then((isInUse) => {
    if (isInUse) {
      throw new Error(`This port:${port} is already occupied`);
    }

    const dbRootDirPath = dirname(dbJsonFilePath);
    const middlewaresDirPath = join(dbRootDirPath, 'middlewares');
    const routesMapFilePath = join(dbRootDirPath, 'routes-map.json');

    const middlewaresConfigs = [];
    if (existsSync(middlewaresDirPath)) {
      const filePaths = readdirSync(middlewaresDirPath).map((v) => join(middlewaresDirPath, v));
      if (filePaths.length) {
        middlewaresConfigs.push('--middlewares', ...filePaths);
      }
    }
    const isWin = process.platform === 'win32';

    const ipAddressOfLAN = getIPAddressOfLAN();

    try {
      const childProcess = spawn(
        isWin ? 'npx.cmd' : 'npx',
        [
          'json-server',
          '--host',
          'localhost',
          ...(ipAddressOfLAN ? ['--host', ipAddressOfLAN] : []),
          '--port',
          port,
          ...middlewaresConfigs,
          '--watch',
          dbJsonFilePath,
          '--routes',
          routesMapFilePath,
        ],
        {
          detached: isWin ? false : true,
          // ...(isWin ? {} : { detached: true }),
          stdio: 'ignore',
          windowsHide: true,
        }
      );
      childProcess.unref();
      // console.log(childProcess.pid, 'childProcess.pid');
      return childProcess;
    } catch (err) {
      throw new Error(`spawn run err.` + err.message);
    }
  });
};
