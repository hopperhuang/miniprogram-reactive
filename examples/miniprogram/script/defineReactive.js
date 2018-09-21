const Dep = require('./Dep')

// 用于收集依赖
function getDependency (deps, keyDescription) {
  const depsType = typeof deps
  if (depsType === 'object' && !!deps && !Array.isArray(deps)) { // 是一个对象
    const dep = deps[keyDescription]
    return dep
  }
}

const defineReactive = (obj, deps, superKey) => {
  // deps 的形式应该是 { mainkey, 'mainkey.subkey', 'mainkey.subkey.subkye' }的形式
  const dependencies = deps || {} // 可能存在祖先依赖，祖先依赖存在的情况下则使用祖先依赖
  const res = {}
  res.__isReactive__ = true
  const keys = Object.keys(obj)
  keys.forEach((key) => {
    let value = obj[key]
    const dep = new Dep()
    // 根据key的结构生成depkey
    const depKey = superKey ? `${superKey}.${key}` : key
    // 添加到依赖对象,外部根据key值去调用dep对象
    dependencies[depKey] = dep
    // 下面的递归方法需要改，有bug
    // 如果对应key的值是即value，则继续调用defineReactive，令其变成一个可观察对象
    if (typeof value === 'object' && !!value) {
      const { res } = defineReactive(value, dependencies, depKey)
      value = res
    }
    Object.defineProperty(res, key, {
      enumerable: true,
      configurable: true,
      get () {
        // 被使用时添加到依赖
        dep.pend()
        return value
      },
      set (newValue) {
        if (newValue !== value) {
          value = newValue
          // 值得更新时发出通知
          setTimeout(() => { // 异步调用notfiy
            dep.notify()
          })
          // dep.notify()
        }
      }
    })
  })
  return {
    res,
    dependencies
  }
}

// export function getDependencies () {
//   return dependencies
// }

module.exports = {
  getDependency,
  defineReactive
}
