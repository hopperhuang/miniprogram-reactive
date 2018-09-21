// init miniprogram page
const { init, initComputed, initWatch } = require('./index')

const initPage = (options) => {
  const object = {
    data: options.data,
    watch: options.watch,
    computed: options.computed
  }
  // generate reactiveDate
  const reactiveData = init(object, true)
  // get data
  const { data } = reactiveData
  const oldOnLoad = options.onLoad
  // re-write onload
  function onLoad (opts) {
    const dataDescriptions = Object.getOwnPropertyDescriptor(this, 'data')
    // set data to page
    Object.defineProperty(this, 'data', {
      ...dataDescriptions,
      value: data
    })
    // init computed value
    initComputed(object.computed, this.data, this, true)
    // init watcher
    initWatch(object.watch, this.data, reactiveData.__dep__, this)
    // run old onload method
    oldOnLoad.apply(this, opts)
  }
  // init page
  const page = Page({
    ...options,
    data,
    onLoad
  })
  return page
}

module.exports = initPage
