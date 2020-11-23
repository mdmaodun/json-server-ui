const os = require('os');

function getIPAddressOfLAN() {
  for (const v of Object.values(os.networkInterfaces())) {
    for (const v2 of Object.values(v)) {
      if (v2.family === 'IPv4' && v2.address !== '127.0.0.1' && !v2.internal) {
        return v2.address;
      }
    }
  }
}

module.exports = getIPAddressOfLAN;
