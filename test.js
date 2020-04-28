const { spawnSync } = require('child_process')
const parity = require('.')

var res = spawnSync(parity, ['--version'])
if (res.error) process.exit(1)
