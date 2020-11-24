const { spawn } = require('child_process');
const isInUseOfPort = require('../utils/isInUseOfPort');
const { existsSync, readdirSync, writeFileSync } = require('fs');
const { dirname, join } = require('path');
// const getIPAddressOfLAN = require('../utils/getIPAddressOfLAN');

module.exports = ({ dbJsonFilePath, port }) => {
  return isInUseOfPort(port).then((isInUse) => {
    if (isInUse) {
      throw new Error(`This port:${port} is already occupied`);
    }

    const dbRootDirPath = dirname(dbJsonFilePath);
    const confFilePath = join(dbRootDirPath, 'json-server.json');
    const middlewaresDirPath = join(dbRootDirPath, 'middlewares');
    const routesMapFilePath = join(dbRootDirPath, 'routes-map.json');

    // const ipAddressOfLAN = getIPAddressOfLAN();
    const confJSON = {
      host: ['localhost'],
      port,
      routes: routesMapFilePath,
      watch: true,
    };

    const middlewareFilePathArr = null;

    if (existsSync(middlewaresDirPath)) {
      const filePathArr = readdirSync(middlewaresDirPath).map((v) => join(middlewaresDirPath, v));
      if (filePathArr && filePathArr.length > 0) {
        middlewareFilePathArr = filePathArr;
      }
    }

    if (middlewareFilePathArr && middlewareFilePathArr.length > 0) {
      confJSON.middlewares = middlewareFilePathArr;
    }

    writeFileSync(confFilePath, JSON.stringify(confJSON, null, 2));

    const isWin = process.platform === 'win32';

    try {
      const childProcess = spawn(isWin ? 'npx.cmd' : 'npx', ['json-server', '--config', confFilePath, dbJsonFilePath], {
        detached: isWin ? false : true,
        // ...(isWin ? {} : { detached: true }),
        stdio: 'ignore',
        windowsHide: true,
      });
      childProcess.unref();
      console.log(childProcess.pid, 'childProcess.pid');
      return childProcess;
    } catch (err) {
      throw new Error(`spawn run err.` + err.message);
    }
  });
};
