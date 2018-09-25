const { init, initComputed, initWatch } = require('./index')

function decorateAttached (oldAttached, data, watch, computed) {
  return function decoratedAttached (opts) {
    // const self = this
    const reactiveData = init({ data, watch, computed }, true)
    // generate reactive data
    const { data: _reactiveData } = reactiveData
    // get descriptions
    const dataDescriptions = Object.getOwnPropertyDescriptor('this', 'data')
    // map props to reactive data
    const mapPropsToReactiveData = (rData, oldData) => {
      const keys = Object.keys(oldData)
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index]
        if (!_reactiveData.hasOwnProperty(key)) { // key is not in reactiveData, that means it's a property
          rData[key] = oldData[key]
        }
      }
    }
    const reactiveDataWithProps = mapPropsToReactiveData(_reactiveData, this.data)
    // difine data
    Object.defineProperty(this, 'data', {
      ...dataDescriptions,
      value: reactiveDataWithProps
    })
    // init computed value, just computed data
    initComputed(computed, _reactiveData, this, true)
    // init watcher, just watch data
    initWatch(watch, _reactiveData, reactiveData.__dep__, this)
    // call old attched
    oldAttached.apply(this, opts)
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
