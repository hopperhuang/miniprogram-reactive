const rollup = require('rollup')
const getRollupConfigs = require('./config')

const configs = getRollupConfigs()
const inputOptions = {
  input: configs.input,
  plugins: configs.plugins
}

const outputOptions = {
  ...configs.output
}

async function build () {
  const bundle = await rollup.rollup(inputOptions)
  await bundle.write(outputOptions)
}

build()
