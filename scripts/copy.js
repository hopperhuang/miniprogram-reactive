const exec = require('child_process').exec
const path = require('path')

// copy file from src to example for running examples
const copy = () => {
  const filepath = __dirname
  const from = path.resolve(filepath, '../src')
  const to = path.resolve(filepath, '../examples/miniprogram/script')
  exec(`cp -rf ${from}/ ${to}`, (err, stdout, stderr) => {
    if (err) {
      console.error('error: ' + err)
      return
    }
    console.log('stdout: ' + stdout)
    console.log('stderr: ' + stderr)
  })
}

copy()
