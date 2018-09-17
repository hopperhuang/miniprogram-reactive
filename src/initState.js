import defineReactive from './defineReactive'
import Watch from './watcher'
import Dep from './Dep'

export function initState (data) {
  const { res: reactiveData, dependencies } = defineReactive(data)
  return {
    reactiveData,
    dependencies
  }
}

export function initWatch (watchers, reactiveData, dependencies, binder) {
  // 获取watchers的key值
  const keys = Object.keys(watchers)
  const dep = new Dep()
  // 生成dep实例，用于将Dep添加target和删除target
  keys.forEach(key => {
    // 判断key，在reactiveData中是否存在对应的属性, 存在则添加watcher
    if (reactiveData.hasOwnProperty(key)) {
      const _watch = watchers[key]
      const _type = typeof _watch
      if (_type === 'function') { // type是一个function， 延迟执行，data对应的key变动时才促发watcher
        const deps = dependencies
        const dep = deps[key]
        const watchFunc = _watch.bind(binder || null)
        const watcher = new Watch(watchFunc)
        // define dep
        dep.addTarget(watcher)
        // get dep
        dep.pend()
        // remove dep
        dep.removeTarget()
      } else if (_type === 'object' && !Array.isArray(_watch)) { // watcher时object的时候执行此逻辑
        // 已对象 { handler, immediate } 形式传入时执行此断逻辑
        const { handler } = _watch
        const { immediate } = _watch
        if (typeof handler !== 'function') {
          throw new Error('handler should be a function')
        }

        // 绑定this
        const watchFunc = handler.bind(binder || null)
        if (immediate) { // 立即执行
          const watcher = new Watch(watchFunc)
          // define dependency
          setTimeout(() => { // 异步执行，
            // define dep
            dep.addTarget(watcher)
            // get dependency
            watcher.excute()
            // remove dependency
            dep.removeTarget()
          })
        } else { // 延迟执行
          // 获取依赖对象库
          const deps = dependencies
          // 根据key找回对应的依赖
          const dep = deps[key]
          const watcher = new Watch(watchFunc)
          // define dependency
          dep.addTarget(watcher)
          // get dependency
          dep.pend()
          // remove dependency
          dep.removeTarget()
        }
      }
    }
  })
}

function init (obj) {
  const { data, watch } = obj
  const { reactiveData, dependencies } = initState(data)
  const binder = {
    data: reactiveData
  }
  initWatch(watch, reactiveData, dependencies, binder)
  return binder
}

export default init
