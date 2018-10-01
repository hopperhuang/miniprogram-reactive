import { decorateAttached } from '../src/initComponent'

const assert = require('assert')
const _ = require('../tools/test/helper')

/* global describe it */
describe('test iniComponent', () => {
  it('test render', async (done) => {
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
    const beh = Behavior({
      lifetimes: {
        attached: decoratedAttached
      }
    })
    let componentId = await _.load({
      template: '<view>{{number}}-{{anotherNumber}}</view>',
      behaviors: [beh],
      data
    })
    let component = _.render(componentId)
    const parent = document.createElement('parent-wrapper')
    component.attach(parent)
    assert.equal(_.match(component.dom, '<wx-view>1-2</wx-view>'), true)
    component.setData({ number: 2 })
    setTimeout(() => {
      assert.equal(_.match(component.dom, '<wx-view>2-3</wx-view>'), true)
      done()
    }, 100)
  })
})
