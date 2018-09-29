import { decorateAttached } from '../src/initComponent'

const assert = require('assert')
const jComponent = require('j-component')

/* global describe it */
describe('test iniComponent', () => {
  it('test decorateAttached', (done) => {
    let number = 1
    const data = {
      number: 1
    }
    const watch = {
      number: {
        handler () {
          number += 1
        }
      }
    }

    const computed = {
      anotherNumber () {
        return this.data.number + 1
      }
    }

    const attached = () => {}
    const decoratedAttached = decorateAttached(attached, data, watch, computed)
    jComponent.register({
      id: 'view',
      tagName: `wx-view`,
      template: '<slot/>'
    })
    const componentId = jComponent.register({
      id: 'testComponent',
      tagName: 'test-component',
      template: '<view><view>{{anotherNumber}}</view><view>{{number}}</view></view>',
      usingComponents: { // 使用到的自定义组件
        'view': 'view' // xxx 为组件 id，调 register 方法时会返回
      },
      options: {
        data,
        attached: decoratedAttached
      }
    })
    setTimeout(() => {
      let comp = jComponent.create(componentId)
      console.log(comp.data, 'data')
      done()
    }, 100)
    assert.equal(componentId, 'testComponent')
  })
})
