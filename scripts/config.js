const nodeResolve = require('rollup-plugin-node-resolve')
const babel = require('rollup-plugin-babel')
const commonjs = require('rollup-plugin-commonjs')
const cleanup = require('rollup-plugin-cleanup')
const { uglify } = require('rollup-plugin-uglify')

function getRollupConfigs (type) {
  return {
    input: 'src/index.js',
    output: {
      file: 'lib/index.js',
      format: 'cjs'
    },
    plugins: [
      ((type === 'production') && uglify()),
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
          '@babel/plugin-external-helpers' // using babel-upgrade to resolve conflict, issue: https://github.com/rollup/rollup-plugin-babel/issues/251
        ]
      }),
      nodeResolve({
        jsnext: true,
        main: true
      }),
      commonjs({

      }),
      ((type === 'production') && cleanup())
    ]
  }
}

module.exports = getRollupConfigs
