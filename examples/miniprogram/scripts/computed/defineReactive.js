const Dep = require('./Dep')

// 用于收集依赖
// export const dependencies = {}

const defineReactive = (obj) => {
  const dependencies = {}
  const res = {}
  res.__isReactive__ = true
  const keys = Object.keys(obj)
  keys.forEach((key) => {
    let value = obj[key]
    const dep = new Dep()
    // 添加到依赖对象,外部根据key值去调用dep对象
    dependencies[key] = dep
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

// export default defineReactive
module.exports = defineReactive
