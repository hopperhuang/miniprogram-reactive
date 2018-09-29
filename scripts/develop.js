const rollup = require('rollup')
const getRollupConfigs = require('./config')
const exec = require('child_process').exec

const configs = getRollupConfigs('development')
const inputOptions = {
  input: configs.input,
  plugins: configs.plugins
}

const outputOptions = {
  ...configs.output
}

const watchOptions = {
  ...inputOptions,
  output: [outputOptions],
  watch: {
    include: 'src/**',
    excluede: ['node_modules/**', 'examples/**', 'lib/**']
  }
}

const eventHandler = {
  'START': function start () {

  },
  'BUNDLE_START': function bundleStart () {

  },
  'BUNDLE_END': function bundleEnd () {

  },
  'END': function end () {
    // copy to example's folder
    exec('npm run copy', (err, stdout, stderr) => {
      if (err) {
        console.error('copy-error: ' + err)
        return
      }
      console.log('copy to the example\'s folder')
      console.log('copy-stdout: ' + stdout)
      if (stderr) {
        console.log('copy-stderr: ' + stderr)
      }
    })
  },
  'ERROR': function err (err) {
    console.error(err)
  },
  'FATAL': function fatal (err) {
    console.error(err)
  }
}

const watcher = rollup.watch(watchOptions)
watcher.on('event', (event, err) => {
  eventHandler[event.code](err)
})
