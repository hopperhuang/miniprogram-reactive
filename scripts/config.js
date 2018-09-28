const nodeResolve = require('rollup-plugin-node-resolve')
const babel = require('rollup-plugin-babel')
const commonjs = require('rollup-plugin-commonjs')

function getRollupConfigs () {
  return {
    input: 'src/index.js',
    output: {
      file: 'lib/index.js',
      format: 'cjs'
    },
    plugins: [
      babel({
        exclude: 'node_modules/**',
        babelrc: false, // must be false, or it will be confilct with mocha
        presets: [
          [
            '@babel/preset-env',
            {
              'modules': false
            }
          ]
        ],
        plugins: [
          '@babel/plugin-proposal-object-rest-spread',
          '@babel/plugin-transform-spread',
          '@babel/plugin-external-helpers'
        ]
      }),
      nodeResolve({
        jsnext: true,
        main: true
      }),
      commonjs({

      })
    ]
  }
}

module.exports = getRollupConfigs
