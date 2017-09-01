// pages/user/myComment/commentTextarea/commentTextarea.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curWordNum: 0,
    words: ''
  },
  onLoad: function (options) {

    let belong = options.belong;
    let posIndex = options.posIdx
    let dishIndex = options.dishIdx
    this.setData({
      belong, posIndex, dishIndex
    })




  },

  onShow: function () {
    let that = this;
    // 进入页面设置显示值（必须在onShow里啊，即要等节目渲染啊，不然textarea的value在真机上设置不了）
    let data = wx.getStorageSync('commentDetailData')
    if (this.data.belong == 'canteen') { // 食堂
      this.setData({ curWordNum: data.canteen.curWordNum, words: data.canteen.words })
    }
    if (this.data.belong == 'pos') {     // pos
      this.setData({ curWordNum: data.poses[that.data.posIndex].curWordNum, words: data.poses[that.data.posIndex].words })
    }
    if (this.data.belong == 'dish') {    // 菜品
      this.setData({ curWordNum: data.dishes[that.data.dishIndex].curWordNum, words: data.dishes[that.data.dishIndex].words })
    }
  },

  // 留言框输入监听
  wordBindInput: function (event) {
    let words = event.detail.value

    // 输入文本框数据渲染到页面
    this.setData({ curWordNum: words.length, words: words })
  },

  confirm: function () {
    let data = wx.getStorageSync('commentDetailData')
    let belong = this.data.belong;

    if (belong == 'canteen') { // 食堂
      data.canteen.curWordNum = this.data.curWordNum
      data.canteen.words = this.data.words
    }
    if (belong == 'pos') {     // pos
      let posIndex = this.data.posIndex;
      data.poses[posIndex].curWordNum = this.data.curWordNum
      data.poses[posIndex].words = this.data.words
    }
    if (belong == 'dish') {    // 菜品
      let dishIndex = this.data.dishIndex;
      data.dishes[dishIndex].curWordNum = this.data.curWordNum
      data.dishes[dishIndex].words = this.data.words
    }

    wx.setStorageSync('commentDetailData', data)
    wx.navigateBack({})
  }
})