const initPage = require('../../scripts/initPage')

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
    }
  },
  watch: {
    'number.a': { // deep watch
      handler () {
        console.log('number.a change')
      }
    },
    // shallow watch
    v: {
      handler () {
        console.log('shallow watch immdeiate v: ' + this.data.v)
      },
      immediate: true
    }
  },
  computed: {
    c () { // deep computed
      return this.data.number.a + 1
    },
    d () {
      return this.data.number.b + 1
    }
  }
}
const app = getApp()

initPage({
  ...obj,
  // 事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    console.log(this)
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
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
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  addA () {
    this.setData({
      'number.a': this.data.number.a + 1
    })
  },
  addB () {
    this.setData({
      'number.b': this.data.number.b + 1,
      v: this.data.v + 1
    })
  }
})
