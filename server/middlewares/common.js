const fs = require('fs');
const { existsSync, mkdirSync } = fs;
const { readFile, writeFile, copyFile } = fs.promises;
const { join } = require('path');
const getdb = require('../utils/getdb.js');
const db = getdb(join(__dirname, '../db.json'));
const isInUseOfPort = require('../utils/isInUseOfPort');

module.exports = (req, res, next) => {
  const { method, path, body, query } = req;

  // 初始化数据库
  if (method === 'GET' && path === '/initdb') {
    readFile(join(__dirname, '../initdb.json'))
      .then((data) => writeFile(join(__dirname, '../db.json'), data))
      .then(() => res.send('ok.'));
    return;
  }

  // 备份
  if (method === 'GET' && path === '/backup') {
    const version = db
      .read()
      .get('db.version')
      .value();
    if (version) {
      const dirPath = join(__dirname, '../backups');
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath);
      }
      copyFile(join(__dirname, '../db.json'), join(__dirname, '../backups', `db.v${version}.json`)).then(() => {
        res.send('ok');
      });
    } else {
      res.status(404).send('missing db.version at db.json file.');
    }
    return;
  }

  // 还原
  if (method === 'GET' && path === '/restore') {
    const version = query.v;
    const srcPath = join(__dirname, `../backups/db.v${version}.json`);
    if (version && existsSync(srcPath)) {
      copyFile(srcPath, join(__dirname, '../db.json')).then(() => {
        res.send('ok.');
      });
    } else {
      res.send('version err.');
    }
    return;
  }

  // 处理创建时间
  if (method === 'POST') {
    const now = Date.now();
    body.ctime = now;
    body.utime = now;
  }

  // 处理更新时间
  if (method === 'PUT' || method === 'PATCH') {
    const now = Date.now();
    body.utime = now;
    if (method === 'PATCH') {
      delete body.ctime;
    }
  }

  // 检查端口是否被占用
  if (method === 'GET' && path === '/checkPortIsInUse') {
    const { query } = req;
    const { port } = query;

    isInUseOfPort(port).then((isInUse) => {
      res.json({
        data: {
          isInUse,
        },
      });
    });

    return;
  }

  next();
};
