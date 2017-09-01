// pages/room/room/index.js
var app = getApp()
var http = require('../../../component/http/http.js');
Page({

  data: {
    detail: {},
    orderNotPayCount: 0,
    orderNotConsumeCount: 0,
    reportNotRepastCount: 0,
    roomNotUsedCount: 0,
    orderNotEvaluateCount: 0,
  },

  onLoad: function (options) {
    app.editTabBar();//添加tabBar数据


  },


  onShow: function () {
    let _this = this
    wx.showLoading({
      title: '加载中',
    })
    http.request({
      url:  'swtapi/user/center/user',
      param: {
        uId: app.appData.uid
      },
      method:'GET',
      success: res => {
          wx.hideLoading()
        if (res.data.success) {
          let data = res.data.data
          console.log(res.data.data.user.departmentName)
          _this.setData({
            userInfo: {
              departmentName: data.user.departmentName,
              name: data.user.name,
            },
            permission: data.user.permission.canteenPermission,//权限
            selfMoney: data.user.selfMoney,//充值余额
            subsidyMoney:data.user.subsidyMoney,//补贴余额
            overdraft: (data.user.overDraftBalance- data.user.overdraft).toFixed(2),//透支余额
            frozenMoney: parseFloat(data.user.selfFrozen +data.user.subsidyFrozen + data.user.overFrozen).toFixed(2),//冻结金额
            orderNotPayCount: data.userCenterNotDoneCount.orderNotPayCount,
            orderNotConsumeCount: data.userCenterNotDoneCount.orderNotConsumeCount,
            reportNotRepastCount: data.userCenterNotDoneCount.reportNotRepastCount,
            roomNotUsedCount: data.userCenterNotDoneCount.roomNotUsedCount,
            orderNotEvaluateCount: data.userCenterNotDoneCount.orderNotEvaluateCount,
          })
        }
      }
    })
  },
  toMyDinner: function () {
    wx.navigateTo({
      url: "/pages/user/myDinner/myDinner"
    })
  },
  toMealOrder: function () {
    wx.navigateTo({
      url: "/pages/user/myMealOrder/myMealOrder"
    })
  },
  toSetting: function () {
    wx.navigateTo({
      url: "/pages/user/setting/setting"
    })
  },
  toMyRoom: function () {
    wx.navigateTo({
      url: "/pages/user/myRoom/index"
    })
  },
  toMyComment: function () {
    wx.navigateTo({
      url: "/pages/user/myComment/myComment"
    })
  },

  toTransactionFlow: function () {
    wx.navigateTo({
      url: "/pages/user/myTransactionFlow/myTransactionFlow"
    })
  },

 

})