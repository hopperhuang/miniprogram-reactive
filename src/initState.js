import { defineReactive } from './defineReactive'
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
  if (!reactiveData.__isReactive__) {
    throw new Error('watched data should be reactive')
  }
  const watchersType = typeof watchers
  if (!!watchersType && watchersType === 'object' && !Array.isArray(watchers)) { //  watch存在且是对象时才执行
    // 获取watchers的key值
    const keys = Object.keys(watchers)
    // const dep = new Dep()
    // 生成dep实例，用于将Dep添加target和删除target
    keys.forEach(key => {
      // 判断key，在reactiveData中是否存在对应的属性, 存在则添加watcher, 支持deep watch，判断对应的依赖是否存在
      if (reactiveData.hasOwnProperty(key) || dependencies[key]) {
        const _watch = watchers[key]
        const _type = typeof _watch
        if (_type === 'function') { // type是一个function， 延迟执行，data对应的key变动时才促发watcher
          const deps = dependencies
          const dep = deps[key]
          if (dep && dep.pend) { // 确定依赖存在
            const watchFunc = _watch.bind(binder || null)
            const watcher = new Watch(watchFunc)
            // define dep
            dep.addTarget(watcher)
            // get dep
            dep.pend()
            // remove dep
            dep.removeTarget()
          }
        } else if (_type === 'object' && !Array.isArray(_watch)) { // watcher时object的时候执行此逻辑
          // 已对象 { handler, immediate } 形式传入时执行此断逻辑
          const { handler } = _watch
          const { immediate } = _watch
          if (typeof handler !== 'function') { // handler应该是一个function
            throw new Error('handler should be a function')
          }

          // 绑定this
          const watchFunc = handler.bind(binder || null)
          if (immediate) { // 立即执行
            const watcher = new Watch(watchFunc)
            // define dependency
            setTimeout(() => { // 异步执行，
              // define dep
              const deps = dependencies
              const dep = deps[key]
              dep.addTarget(watcher)
              // get dependency
              dep.pend()
              // remove dependency
              dep.removeTarget()
              // excute
              watcher.excute()
            })
          } else { // 延迟执行
            // 获取依赖对象库
            const deps = dependencies
            // 根据key找回对应的依赖
            const dep = deps[key]
            if (dep && dep.pend) { // 确定依赖存在
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
      }
    })
  }
}

export function initComputed (computed, attachedData, binder, isMiniprogram) {
  if (!attachedData.__isReactive__) {
    throw new Error('computed props should be reactive')
  }
  // 生成用于定义和添加依赖的dep对象
  const dep = new Dep()
  const _type = typeof computed
  if (_type === 'object' && !!_type && !Array.isArray(_type)) { // computed需要是一个对象
    // const dataKeys = Object.keys(attachedData)
    const computedKeys = Object.keys(computed)
    computedKeys.forEach(key => {
      const dataAndComputedHasTheSameKey = attachedData.hasOwnProperty(key)
      if (!dataAndComputedHasTheSameKey) { // data和computed的key值不能重复
        const computedGetter = computed[key]
        const getterType = typeof computedGetter
        if (getterType === 'function') { // getter需要是一个function
          let value
          const computedFunc = computedGetter.bind(binder)
          // 通过此方法去设置值
          const computedMethod = () => {
            value = computedFunc()
            if (isMiniprogram) { // 小程序的情况下 通过setdata去改变值
              binder.setData({
                [key]: value
              })
            }
          }
          // 生成watcher
          const watcher = new Watch(computedMethod)
          // 定义依赖
          dep.addTarget(watcher)
          // 通过excute执行computedMethod,生成初始值，通过reactivedata的getter获取依赖
          watcher.excute()
          // 移除依赖
          dep.removeTarget()
          // 将对应的key和value定义到
          if (!isMiniprogram) { // 非小程序的情况下更改getter和setter
            Object.defineProperty(attachedData, key, {
              enumerable: true,
              configurable: true,
              get () {
                return value
              },
              set () {
                throw new Error('can not set value in a computed props')
              }
            })
          }
        }
      }
    })
  }
}

function normalInit (obj) {
  const { data, watch, computed } = obj
  const { reactiveData, dependencies } = initState(data)
  const binder = {
    data: reactiveData
  }
  initComputed(computed, reactiveData, binder)
  initWatch(watch, reactiveData, dependencies, binder)
  return binder
}

function minprogramInit (obj) {
  // const { data, watch, computed } = obj
  const { data } = obj
  const { reactiveData, dependencies } = initState(data)
  const binder = {
    data: reactiveData,
    __dep__: dependencies
  }
  // initComputed(computed, reactiveData, binder)
  // initWatch(watch, reactiveData, dependencies, binder)
  return binder
}

export function init (obj, isMiniprogram) {
  if (isMiniprogram) {
    return minprogramInit(obj)
  } else {
    return normalInit(obj)
  }
}

// module.exports = {s
//   init,
//   initState,
//   initWatch,
//   initComputed
// }
