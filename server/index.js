// const fs = require('fs');
const path = require('path');
// const dirPath = path.join(__dirname, '../jsondb');
// const db = require('./utils/getdb')(path.join(__dirname, 'db.json'));

// if (!fs.existsSync(dirPath)) {
//   fs.mkdirSync(dirPath);
// }

module.exports = () => {
  const process = require('child_process');
  const cmd = `cd server && npx json-server --config ${path.join(__dirname, 'json-server.json')} ${path.join(__dirname, 'db.json')}`;
  process.exec(cmd, (error, stdout, stderr) => {
    console.log('error:' + error);
    console.log('stdout:' + stdout);
    console.log('stderr:' + stderr);
  });

  // app.get('/dbs', (req, res, next) => {
  //   res.json({
  //     code: 200,
  //     msg: 'ok',
  //     data: db.get('dbs').value(),
  //   });
  // });

  // app.post('/dbs', (req, res, next) => {
  //   const { body } = req;
  //   const { name } = body;

  //   const dbs = db.get('dbs');
  //   const id = dbs.maxBy('id');
  //   console.log(id, 'maxid');
  //   db.get('dbs').max.push({ name });

  //   // fs.writeFileSync(
  //   //   path.join(dirPath, `${name}.json`),
  //   //   JSON.stringify(
  //   //     {
  //   //       db: {
  //   //         version: '1.0.0',
  //   //       },
  //   //     },
  //   //     null,
  //   //     2
  //   //   )
  //   // );

  //   // const process = require('child_process');
  //   // const cmd = 'npx json-server ' + path.join(dirPath, query.name + '.json');
  //   // process.exec(cmd, (error, stdout, stderr) => {
  //   //   console.log('error:' + error);
  //   //   console.log('stdout:' + stdout);
  //   //   console.log('stderr:' + stderr);
  //   // });

  //   res.json({
  //     code: 200,
  //     msg: 'ok.',
  //   });
  // });
};
