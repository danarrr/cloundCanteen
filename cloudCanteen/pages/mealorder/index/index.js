//index.js
// 订餐前设置页面
var app = getApp()
var http = require('../../../component/http/http.js');
import { tipToast } from '../../../component/tipToast/class/tipToast.js'; // 【tipToast】引入tipToast类

Page({
  data: {
    canteenListTit: "",
    mealListTit: "",
    detail: {},
    showLoading: true

  },
  toGoods: function () {//跳转页面
    if (wx.getStorageSync('sltMealName') == "餐次为空" || wx.getStorageSync('sltMealName') == "没有可预订餐次"
      || !this.data.canteenListTit || !this.data.date || !this.data.mealListTit) {
      // this.toast.show('未完成设置')
      this.toast.show(!wx.getStorageSync('sltMealID') ? '没有可预订餐次':'未完成设置')
      return false
    } else {
      wx.navigateTo({
        url: "../goods/index"
      })
    }
  },
  dateList: function () {
    let self = this;
    let sltCanteenId = wx.getStorageSync('sltCanteenId')

    http.request({
      url: 'swtapi/backstage/getWorkDayList.int',
      method: 'GET',
      param: {
        canteenId: sltCanteenId, listNum: 7
      },
      success: function (data) {
        if (data.data.success) {
          let res = data.data.data;
          if (!res.length) {
            return;
          }

          wx.setStorageSync('sltDateName', res[0].name)
          wx.setStorageSync('sltDateId', res[0].id)
          let sltDateName = wx.getStorageSync('sltDateName')


          self.setData({
            date: sltDateName
          })
          self.mealList(1)
          wx.hideLoading()
        } else {
          self.toast.show(data.data.message)
          wx.hideLoading()
        }
      }
    })

  },
  mealList: function (type) {
    let self = this;
    let sltCanteenId = wx.getStorageSync('sltCanteenId')
    let sltDateId = wx.getStorageSync('sltDateId')

    http.request({
      url: 'swtapi/backstage/selectTradesList.int',
      method: 'GET',
      param: {
        id: sltCanteenId,
        sDate: sltDateId,
        type: type,
      },

      success: function (data) {
        if (data.data.success) {
          let res = data.data.data;
          // if (!res.length) {
          //   return;
          // }

          wx.setStorageSync('sltMealName', res.length?res[0].name:'没有可预订餐次')
          wx.setStorageSync('sltMealID', res.length ? res[0].id:'')
          let sltMealName = wx.getStorageSync('sltMealName')
          self.setData({
            mealListTit: sltMealName
          })

        } else {
          self.toast.show(data.data.message)
        }
      }
    })

  },

  canteenList: function () {

    let that = this,
      self = this

    http.request({
      url: 'swtapi/user/cust/canteen_list',
      param: { uId: app.appData.uid },
      success: function (data) {
        if (data.data.success) {
          let res = data.data.data;
          if (!res.length) {
            return;
          }

          wx.setStorageSync('sltCanteenName', res[0].name)
          wx.setStorageSync('sltCanteenId', res[0].id)
          let sltCanteenName = wx.getStorageSync('sltCanteenName')
          self.setData({
            canteenListTit: sltCanteenName
          })

          that.dateList()
        } else {
          that.toast.show(data.data.message)
        }
      }
    })
  },

  onLoad: function (options) {
    this.setData({ showLoading: false })
    app.editTabBar();//添加tabBar数据  
    new tipToast(); // 【tipToast】创建实例
    wx.showLoading({
      title: '加载中',
    })
   
    if (options.upperPage == 'payPage' ) {
      
      if (options.overdue == 'true') {
        this.toast.show("该订单未支付！已进入已过期页面！")
      }else{
        this.toast.show("该订单未支付！已进入待支付页面！")
      }
    }

    this.canteenList(); // 获取食堂
    let sltCanteenName = wx.getStorageSync('sltCanteenName'),
      sltMealName = wx.getStorageSync('sltMealName'),
      date = wx.getStorageSync('sltDateName')

    this.setData({
      canteenListTit: sltCanteenName,
      mealListTit: sltMealName,
      date: date
    })


  },
  onShow: function () {

    let sltCanteenName = wx.getStorageSync('sltCanteenName'),
      sltMealName = wx.getStorageSync('sltMealName'),
      date = wx.getStorageSync('sltDateName')

    this.setData({
      canteenListTit: sltCanteenName,
      mealListTit: sltMealName,
      date: date
    })
    
    app.cartData = {//重置购物车
      cartMoney: 0,
      cartNum: 0
    }
    app.cartList = {}
    app.cartListTit = []
    const population = {
      tokyo: 37833000,
      delhi: 24953000,
      shanghai: 22991000
    }
    
  },
  /**
   * app.showFilter：决定filter页面显示canteen还是meal的数据
   * app.appData.showFilterType：从"订餐页"或"报餐页"进入filter页面
  */
  showFilter: function (e) {
    app.showFilter = e.target.dataset.type // 在模拟器上e.target.dataset.type有可能会undefined，拿不到值
    app.appData.showFilterType = 'mealorder'
  }
})
