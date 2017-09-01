// pages/user/myComment/commentDetail/commentDetail.js
// 评价详情页面（提交评价也是这个页面）
import { tipToast } from '../../../../component/tipToast/class/tipToast.js'; // 【tipToast】引入tipToast类
import { evaluateData } from 'class/evaluateData.js';

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    consumeId: null,
    dataType: null, // 数据类型（未评价/已评价）
    // data: {
    //   canteen: {}
    // },     // 页面数据
    emptyStar: '/image/mine/icon-scoreEmptyStar.png',
    fullStar: '/image/mine/icon-scoreFullStar.png',
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    let data = wx.getStorageSync('commentDetailData')
    this.setData({ data: data })

    let navigationBarTitle = this.data.dataType == 1 ? '已评价详情' : '未评价详情'
    wx.setNavigationBarTitle({ title: navigationBarTitle }) // 设置导航条标题
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    new tipToast(); // 【tipToast】创建实例

    let consumeId = options.consumeId; // 消费单号
    let dataType = options.dataType; // 数据类型（未评价/已评价）
    this.setData({ consumeId: consumeId, dataType: dataType })

    new evaluateData(app, consumeId); // 页面显示的评价数据

    if (dataType == 0) {
      wx.showNavigationBarLoading(); // 加载中的提示
      this.evaluateData.getWillEvaluateData(this.getPageData); // 获取未评价数据（异步）
    }
    if (dataType == 1) {
      wx.showNavigationBarLoading();
      this.evaluateData.getEvaluatedData(this.getPageData); // 获取已评价数据（异步）
    }

  },

  onUnload: function () {
    wx.setStorageSync('commentDetailData', null)
  },

  // 请求未评价/已评价接口之后整合获得的数据
  getPageData: function (data, message) {
    wx.hideNavigationBarLoading(); // 隐藏加载中提示

    if (data) {
      /*
        千万不能这么写，否则会出现一个非常诡异的问题，点击星星会出现数据混串。不明白的话可以打开注释并关闭下两行试一下。
        this.setData({ data: data })
        wx.setStorageSync('commentDetailData', data)
        下面两行的写法才是正确的↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
      */
      wx.setStorageSync('commentDetailData', data)
      this.setData({ data: wx.getStorageSync('commentDetailData') })


    } else {
      this.toast.show(message)
      wx.setStorageSync('commentDetailData', data)
      this.setData({ data: wx.getStorageSync('commentDetailData') })
    }
  },

  clickStar: function (event) {
    if (this.data.dataType == 0) { // 未评价详情
      let _data = this.data.data;
      let starIndex = event.currentTarget.dataset.index;
      let optionIndex = event.currentTarget.dataset.optionIndex;
      let belong = event.currentTarget.dataset.belong;

      // 改变评分（其实这种方式并不好，改变一个值就整页刷新。如果wxml能获取page的data中动态属性名的属性的值就能实现局部刷新了）
      if (belong == 'canteen') { // 食堂
        _data.canteen.evalOptions[optionIndex].score = starIndex + 1
      }
      if (belong == 'pos') {     // pos
        let posIndex = event.currentTarget.dataset.posIndex;
        _data.poses[posIndex].evalOptions[optionIndex].score = starIndex + 1
      }
      if (belong == 'dish') {    // 菜品
        let dishIndex = event.currentTarget.dataset.dishIndex;
        if (_data.dishes[dishIndex].dishseted == 0) { // 普通菜品
          _data.dishes[dishIndex].evalOptions[optionIndex].score = starIndex + 1
        }
        if (_data.dishes[dishIndex].dishseted == 1) { // 套餐
          let childDishIndex = event.currentTarget.dataset.childDishIndex;
          _data.dishes[dishIndex].dishsetlist[childDishIndex].evalOptions[optionIndex].score = starIndex + 1
        }


      }

      wx.setStorageSync('commentDetailData', _data)
      this.setData({ data: wx.getStorageSync('commentDetailData') })
    }

  },

  // 查看已评价信息返回按钮
  comeback: function () {
    wx.navigateBack({})
  },

  // 提交评价
  submitEvaluate: function () {
    this.evaluateData.submitEvaluate(this.data.consumeId, this.submitEvaluateResult)
  },

  // 提交评价执行结果
  submitEvaluateResult: function (data, message) {
    if (data) {

      if (data.success) {
        this.toast.show(data.data.errorMsg)
        // wx.navigateBack({})
        this.setData({ dataType: 1 })
        let navigationBarTitle = this.data.dataType == 1 ? '已评价详情' : '未评价详情'
        wx.setNavigationBarTitle({ title: navigationBarTitle }) // 设置导航条标题
      } else {
        this.toast.show(data.message)
      }
    } else {
      this.toast.show(message)
    }


  },

  changeAnonymous: function () {
    let _data = this.data.data
    if (_data.anonymous == 1) {
      _data.anonymous = 0
    } else {
      _data.anonymous = 1
    }

    wx.setStorageSync('commentDetailData', _data)
    this.setData({ data: wx.getStorageSync('commentDetailData') })

  }
})