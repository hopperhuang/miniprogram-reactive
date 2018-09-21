const { init, initComputed, initWatch } = require('../../scripts/computed/index')

const obj = {
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    v: 1,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    // 首层属性可以被watch
    // 首层属性被修改时可以触发computed
    number: {
      a: 1,
      b: 2
    },
  },
  watch: {
    number() {
      // console.log(this)
      console.log('number change')
    },
    // hasUserInfo: {
    //   handler() {
    //     console.log('hasUserInfo...')
    //   }
    // },
    v: {
      handler() {
        console.log('v')
      },
      immediate: true
    }
  },
  computed: {
    c() {
      return this.data.number.a + 1
    },
    d() {
      return this.data.number.b + 1
    }
  }
}

const o = init(obj)
const { data } = o
//index.js
//获取应用实例
const app = getApp()

// Page.prototype.sayhi = () => { console.log("sayhi") }

Page({
  data,
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    const d = Object.getOwnPropertyDescriptor(this, 'data')
    Object.defineProperty(this,'data', {
      ...d,
      value: data,
    })
    initComputed(obj.computed, this.data, this)
    initWatch(obj.watch, this.data, o.__dep__, this)
    // console.log(Object.getOwnPropertyDescriptor(this, 'data'))
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  addA() {
    this.setData({
      number: {
        ...this.data.number,
        a: this.data.number.a + 1
      }
    })
  },
  addB() {
    // this.setData({
    //   hasUserInfo: !this.data.hasUserInfo
    // })
    this.setData({
      number: {
        ...this.data.number,
        b: this.data.number.b + 1
      },
      // hasUserInfo: !this.data.hasUserInfo,
      v: this.data.v + 1
    })
  }
})
