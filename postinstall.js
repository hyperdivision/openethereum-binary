const get = require('simple-get')
const crypto = require('crypto')
const os = require('os')
const fs = require('fs')
const stream = require('stream')
const path = require('path')

const win32Sha256 = 'e91815a9caecee0ab3504ea92c0845348432501b166f7da03c7b41ff66b97072'
const darwinSha256 = '2d0de1bf66f5ae693e44c474065fc9a24957463ee33c075731b06ce930139a61'
const linuxSha256 = 'fe992f0c9b229a4406e82b9ff6d388f4acb4d6ce2782cb79b7bc379e7965ae34'

var url
var sha
var exeName = 'parity.exe'

switch (os.platform()) {
  case 'win32':
    url = 'https://releases.parity.io/ethereum/v2.7.2/x86_64-pc-windows-msvc/parity.exe'
    sha = win32Sha256
    break
  case 'darwin':
    url = 'https://releases.parity.io/ethereum/v2.7.2/x86_64-apple-darwin/parity'
    sha = darwinSha256
    break
  case 'linux':
    url = 'https://releases.parity.io/ethereum/v2.7.2/x86_64-unknown-linux-gnu/parity'
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

  const tmpFile = path.resolve(__dirname, './parity.tmp')
  const hash = crypto.createHash('sha256')
  const file = fs.createWriteStream(tmpFile, { flags: 'w', mode: 0o777 })

  stream.pipeline(res, file, function (err) {
    if (err) {
      console.error('Binary write failed')
      console.error(err)
      process.exit(1)
    }

    if (hash.digest('hex') !== sha) {
      console.error('SHA-256 checksum mismatch')
      process.exit(1)
    }

    fs.renameSync(tmpFile, path.resolve(__dirname, exeName))
  })

  res.on('data', chunk => hash.update(chunk))
})
