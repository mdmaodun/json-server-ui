const { exec } = require('child_process');

module.exports = (cmd) => {
  const childProcess = exec(cmd, (error, stdout, stderr) => {
    console.log('error:' + error);
    console.log('stdout:' + stdout);
    console.log('stderr:' + stderr);
  });
  console.log(childProcess.pid, 'childProcess.pid');
  return childProcess;
};
