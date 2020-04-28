const path = require('path')
const os = require('os')

module.exports = path.resolve(__dirname, './parity' + (os.platform() === 'win32' ? '.exe' : ''))
module.exports.version = 'v2.7.2-stable'
