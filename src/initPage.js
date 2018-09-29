// init miniprogram page
import { init, initComputed, initWatch } from './initState'

const initPage = (constructor, options) => {
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
    // re-write __data__ and __viewData__, otherwise it's buggy when using component in page
    Object.defineProperty(this, '__data__', {
      ...dataDescriptions,
      value: data
    })
    Object.defineProperty(this, '__viewData__', {
      ...dataDescriptions,
      value: data
    })
    // init computed value
    initComputed(object.computed, this.data, this, true)
    // init watcher
    initWatch(object.watch, this.data, reactiveData.__dep__, this)
    // run old onload method
    if (typeof oldOnLoad === 'function') {
      oldOnLoad.apply(this, opts)
    }
  }
  // init page
  const page = constructor({
    ...options,
    data,
    onLoad
  })
  return page
}

// module.exports = initPage
export default initPage
