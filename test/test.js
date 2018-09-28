import Watch from '../src/watcher'
import Dep from '../src/Dep'
import { defineReactive, getDependency } from '../src/defineReactive'
import { init, initComputed, initWatch } from '../src/initState'
// import { decorateAttached } from '../src/initComponent'
// const jComponent = require('j-component')
console.log(Dep)
const assert = require('assert')

describe('unit test', function () {
  describe('test watch', () => {
    let number = 1
    const func = () => { number += 1 }
    const watcher = new Watch(func)
    it('test watch id', () => {
      assert.equal(watcher.id, 1)
    })
    it('test watch excute', () => {
      watcher.excute()
      assert.equal(number, 2)
    })
  })
  describe('test dep', () => {
    let number = 1
    const func = () => { number += 1 }
    let secondNumber = 2
    const anotherFunc = () => { secondNumber += 2 }
    // id = 2
    const watcher = new Watch(func)
    // id = 3
    const anotherWatcher = new Watch(anotherFunc)
    const dep = new Dep()
    it('test dep\'s id ', () => {
      assert.equal(dep.id, 1)
    })
    it('test add target', () => {
      dep.addTarget(watcher)
      assert.equal(Dep.target, watcher)
    })
    it('test pend', () => {
      dep.pend()
      assert.equal(dep.subs.length, 1)
      assert.equal(dep.subs[0], watcher)
    })
    it('test pend then same target twice twice', () => {
      dep.pend()
      assert.equal(dep.subs.length, 1)
    })
    it('test pend anohter watcher', () => {
      dep.removeTarget()
      dep.addTarget(anotherWatcher)
      dep.pend()
      assert.equal(dep.subs.length, 2)
    })
    it('test notify', () => {
      dep.notify()
      assert.equal(number, 2)
      assert.equal(secondNumber, 4)
    })
    it('test teardown', () => {
      dep.teardown(3)
      assert.equal(dep.subs.length, 1)
      assert.equal(dep.subs[0], watcher)
    })
    it('test remove target', () => {
      dep.removeTarget()
      assert.equal(dep.target, null)
    })
  })
  describe('test defineReactive', () => {
    let number = 1
    const data = {
      number: 1
    }
    const { res, dependencies } = defineReactive(data)
    const func = () => { number += res.number }
    const anotherFunc = () => { number += 2 }
    const watcher = new Watch(func)
    const anotherWatcher = new Watch(anotherFunc)
    const dep = new Dep()
    it('get dependencies by getter', () => {
      // define dependencies
      dep.addTarget(watcher)
      // get dependices by call getter
      watcher.excute()
      // remove dependecies
      dep.removeTarget()
      assert.equal(number, 2) // 1+1
      assert.equal(dependencies.number.subs.length, 1)
    })
    it('get dependencies by handy', () => {
      // 获取对应key的依赖
      const numberDep = dependencies.number
      dep.addTarget(anotherWatcher)
      numberDep.pend()
      dep.removeTarget()
      assert.equal(numberDep.subs.length, 2)
    })
    it('test setter', (done) => {
      res.number = 2
      setTimeout(() => {
        assert.equal(number, 6) // 2(原来的值) + 2(func) +2(anotherFunc)
        done()
      }, 100)
    })
    it('set the same value, watcher will not call', () => {
      res.number = 2
      assert.equal(number, 6)
    })
    it('test get dependency', () => {
      const deps = {
        'a.b.c': 1
      }
      const dep = getDependency(deps, 'a.b.c')
      assert.equal(dep, 1)
    })
    it('test deep dependency', () => {
      const data = {
        a: {
          b: {
            c: 1
          }
        }
      }
      const { dependencies } = defineReactive(data)
      assert.equal(!!dependencies['a.b.c'], true)
    })
    it('test array dependency', () => {
      const data = {
        numbs: [ 1, 2, 3 ]
      }
      const { dependencies } = defineReactive(data)
      assert.equal(!!dependencies['numbs.2'].id, true)
    })
  })
  describe('test init', () => {
    let numberA = 1
    let numberB = 2
    let numberC = 3
    const obj = {
      data: {
        a: 1,
        b: 2,
        c: 3
      },
      watch: {
        a () {
          numberA += this.data.a
        },
        b: {
          handler () {
            numberB += this.data.b
          },
          immediate: true
        },
        c: {
          handler () {
            numberC += this.data.c
          }
        }
      }
    }
    it('test immediate', (done) => {
      const o = init(obj)
      setTimeout(() => { // 异步测试immediate
        assert.equal(numberB, 4) // 2+2
        o.data.b = 3
        setTimeout(() => { // 异步测试watch方法是否被粗发
          assert.equal(numberB, 7) // 4+3
          done()
        }, 100)
      }, 100)
    })
    it('test watcher', (done) => {
      const o = init(obj)
      o.data.a = 2
      o.data.c = 4
      setTimeout(() => {
        assert.equal(numberA, 3) // 1+2
        assert.equal(numberC, 7) // 3+4
        done()
      }, 100)
    })
    it('test deep watch', (done) => {
      let number = 1
      const object = {
        data: {
          a: {
            b: {
              c: 1
            }
          }
        },
        watch: {
          'a.b.c': {
            handler () {
              number += 1
            }
          }
        }
      }
      const o = init(object)
      o.data.a.b.c = 2
      setTimeout(() => {
        assert.equal(number, 2)
        done()
      }, 100)
    })
    it('test watch array', (done) => {
      let number = 1
      const object = {
        data: {
          numbs: [ 1, 2, 3 ]
        },
        watch: {
          'numbs.1': {
            handler () {
              number += 1
            }
          }
        }
      }
      const o = init(object)
      o.data.numbs[1] = 3
      setTimeout(() => {
        assert.equal(number, 2)
        done()
      }, 100)
    })
    it('throw error if handler is not a function', () => {
      const iThrowError = () => {
        const obj = {
          data: {
            a: 1
          },
          watch: {
            a: {}
          }
        }
        init(obj)
      }
      assert.throws(iThrowError, Error, 'handler should be a function')
    })
    it('test computed define', () => {
      const obj = {
        data: {
          a: 1,
          b: 2,
          c: 3
        },
        computed: {
          numA () {
            return this.data.a + this.data.b
          },
          numB () {
            return this.data.b + this.data.c
          }
        }
      }
      const res = init(obj)
      assert.equal(res.data.numA, 3)
      assert.equal(res.data.numB, 5)
    })
    it('test computed change', (done) => {
      const obj = {
        data: {
          a: 1,
          b: 2,
          c: 3
        },
        computed: {
          numA () {
            return this.data.a + this.data.b
          },
          numB () {
            return this.data.b + this.data.c
          }
        }
      }
      const res = init(obj)
      res.data.a = 2
      setTimeout(() => {
        assert.equal(res.data.numA, 4)
        done()
      }, 100)
    })
    it('test deep computed', (done) => {
      const object = {
        data: {
          a: {
            b: {
              c: 1
            }
          }
        },
        computed: {
          num () {
            return this.data.a.b.c + 1
          }
        }
      }
      const o = init(object)
      o.data.a.b.c = 2
      setTimeout(() => {
        assert.equal(o.data.num, 3)
        done()
      }, 100)
    })
    it('throw error when set computed props', () => {
      const iThrowError = () => {
        const obj = {
          data: {
            a: 1,
            b: 2,
            c: 3
          },
          computed: {
            numA () {
              return this.data.a + this.data.b
            },
            numB () {
              return this.data.b + this.data.c
            }
          }
        }
        const res = init(obj)
        res.data.numA = 2
      }
      assert.throws(iThrowError, Error, 'can not set value in a computed props')
    })
  })
  describe('test initWatch', () => {
    it('throw error if data is not reactive', () => {
      const iThrowError = () => {
        const obj = {
          data: {
            a: 1
          },
          watch: {
            a: {}
          }
        }
        initWatch(obj.watch, obj.data, {}, obj)
      }
      assert.throws(iThrowError, Error, 'watched data should be reactive')
    })
  })
  describe('test initComputed', () => {
    it('throw error if data is not reactive', () => {
      const iThrowError = () => {
        const obj = {
          data: {
            a: 1,
            b: 2,
            c: 3
          },
          computed: {
            numA () {
              return this.data.a + this.data.b
            },
            numB () {
              return this.data.b + this.data.c
            }
          }
        }
        initComputed(obj.computed, obj.data, obj)
      }
      assert.throws(iThrowError, Error, 'computed props should be reactive')
    })
  })
  describe('test initComponent', () => {
    // let number = 1
    // const data = {
    //   number: 1
    // }
    // const watch = {
    //   number: {
    //     handler () {
    //       number += 1
    //     },
    //     immediate: true
    //   }
    // }
    // const computed = {
    //   anotherNumber () {
    //     return this.data.number + 1
    //   }
    // }
    // const attached = () => {}
    // const decoratedAttached = decorateAttached(attached, data, watch, computed)
    // const componentId = jComponent.register(
    //   'test',
    //   '<view id="a">xxx</view>',
    //   {
    //     id: 'test',
    //     tagName: 'tecomp',
    //     // template: '<view>test</view>',
    //     options: {
    //       data,
    //       attached: decoratedAttached
    //     }
    //   })
  })
})
