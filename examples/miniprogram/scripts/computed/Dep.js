let id = 0

class Dep {
  constructor () {
    this.subs = []
    id += 1
    this.id = id
  }
  // 增加依赖
  pend () {
    const { target } = Dep
    if (target) {
      // 判断依赖是否已经被加上
      const hasDepend = this.subs.findIndex((sub) => { return sub.id === target.id })
      // 不再重复添加依赖,尚未被加上，则加上依赖
      if (hasDepend === -1) {
        this.subs.push(target)
      }
    }
  }
  // 解除依赖
  teardown (id) {
    const index = this.subs.findIndex((sub) => { return sub.id === id })
    this.subs.splice(index, 1)
  }
  // 移除将要被依赖的对象
  removeTarget () {
    Dep.target = null
  }
  // 增加将要被依赖的对象
  addTarget (target) {
    Dep.target = target
  }
  notify () {
    this.subs.forEach((sub) => {
      sub.excute()
    })
  }
}

Dep.target = null

// export default Dep
module.exports = Dep
