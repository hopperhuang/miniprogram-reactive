const { init, initComputed, initWatch } = require('./index')

function decorateAttached (oldAttached, data, watch, computed) {
  return function decoratedAttached (opts) {
    const self = this
    const reactiveData = init({ data, watch, computed }, true)
    const { data: _reactiveData } = reactiveData
    const dataDescriptions = Object.getOwnPropertyDescriptor('this', 'data')
    // define data
    Object.defineProperty(this, 'data', {
      ...dataDescriptions,
      value: {
        ...self.data,
        ..._reactiveData // 覆盖原来的属性
      }
    })
    // init computed value
    initComputed(computed, this.data, this, true)
    // init watcher
    initWatch(watch, this.data, reactiveData.__dep__, this)
  }
}

function initComponent (Constructor, options) {
  const { data, attached } = options
  const decoratedAttached = decorateAttached(attached, data)
  const result = Constructor({
    ...options,
    attached: decoratedAttached
  })
  return result
}

module.exports = {
  decorateAttached,
  initComponent
}
