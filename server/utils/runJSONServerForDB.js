const { spawn } = require('child_process');
const isInUseOfPort = require('../utils/isInUseOfPort');
const { existsSync, readdirSync, writeFileSync } = require('fs');
const { dirname, join, basename } = require('path');
// const getIPAddressOfLAN = require('../utils/getIPAddressOfLAN');

module.exports = ({ dbJsonFilePath, port }) => {
  return isInUseOfPort(port).then((isInUse) => {
    if (isInUse) {
      throw new Error(`This port:${port} is already occupied`);
    }

    const dbRootDirPath = dirname(dbJsonFilePath);
    const confFilePath = join(dbRootDirPath, 'json-server.json');
    const middlewaresDirPath = join(dbRootDirPath, 'middlewares');
    // const staticDirPath = join(dbRootDirPath, 'public');
    const routesMapFilePath = join(dbRootDirPath, 'routes-map.json');

    // const ipAddressOfLAN = getIPAddressOfLAN();
    const confJSON = {
      host: ['localhost'],
      port,
      // static 这里 json-server 源码是根据 cwd() 来拼接的路径，不支持绝对路径
      // static: staticDirPath, // 绝对路径，不支持
      static: join('../dbs', basename(dbRootDirPath), 'public'), // 相对路径，支持
      routes: routesMapFilePath,
      watch: true,
    };

    let middlewareFilePathArr = null;

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
      const childProcess = spawn(
        isWin ? 'npx.cmd' : 'npx',
        [
          'json-server',
          '--config',
          confFilePath,
          // '--static',
          // join('../dbs', basename(dbRootDirPath), 'public'),
          dbJsonFilePath,
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
