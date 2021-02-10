const get = require('simple-get')
const crypto = require('crypto')
const os = require('os')
const fs = require('fs')
const stream = require('stream')
const path = require('path')

const win32Sha256 = ''
const darwinSha256 = '78cbb9c6b6f8d1cb40d7e65d152062d2e259e73fa85b83d3b8e778d62ddf9ba2'
const linuxSha256 = '1bed234e83fa9196feffe1d5d3fdc23fb68b2cd4fbbfab579ff4ca058c3b3cb2'

var url
var sha
var exeName = 'openethereum.exe'
const win32 = os.platform() === 'win32'

switch (os.platform()) {
  //case 'win32':
  //  url = ''
  //  sha = win32Sha256
  //  break
  case 'darwin':
    url = 'https://github.com/openethereum/openethereum/releases/download/v3.1.1/openethereum-macos-v3.1.1.zip'
    sha = darwinSha256
    break
  case 'linux':
    url = 'https://github.com/openethereum/openethereum/releases/download/v3.1.1/openethereum-linux-v3.1.1.zip'
    sha = linuxSha256
    break
  default:
    console.error('No parity binary found for:', os.platform())
    process.exit(1)
}

get(url, function (err, res) {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  const tmpFile = path.resolve(__dirname, './openethereum.tmp')
  const hash = crypto.createHash('sha256')

  stream.pipeline(res, require('unzipper').Extract({ path: tmpFile }), function (err) {
    if (err) {
      console.error('Binary write failed')
      console.error(err)
      process.exit(1)
    }

    if (hash.digest('hex') !== sha) {
      console.error('SHA-256 checksum mismatch')
      process.exit(1)
    }

    fs.renameSync(path.join(tmpFile, 'openethereum' + (win32 ? '.exe' : '')), path.resolve(__dirname, exeName))
    fs.chmodSync(path.resolve(__dirname, exeName), 0o777)
  })

  res.on('data', chunk => hash.update(chunk))
})
