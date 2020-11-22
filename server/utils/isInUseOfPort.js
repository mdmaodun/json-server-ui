const net = require('net');

// 检查端口号是否被占用
module.exports = (port) => {
  port = parseInt(port);
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: 'localhost' });

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('error', (err) => {
      resolve(false);
    });
  });
};
