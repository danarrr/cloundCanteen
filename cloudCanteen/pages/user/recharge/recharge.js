// pages/user/recharge/recharge.js
var app = getApp()
var http = require('../../../component/http/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  bindCardId: function (e) {//获取输入的用户编码
    let that = this;
    let cartIdVal = e.detail.value;
    http.request({
      url: 'swtapi/user/center/transfer_user',
      method: 'GET',
      param: {
        uId: cartIdVal
      },
      success: res => {
        if (res.data.success) {

          that.setData({
            name: res.data.data.name,
            usrid: res.data.data.id

          })
        }
      }
    })
  },
  bindRechargeMoney: function (e) {//获取输入的充值金额
    this.setData({ rechargeMoney: e.detail.value })

  },
  wechatToRecharge: function () {
    //TODO 没数据时禁止点击微信支付按钮
    let that = this, _this = this

    let uId = this.data.usrid,
      canteenId = app.appData.userInfo.canteenId,
      selfIn = this.data.rechargeMoney,
      transSubType = 2;//2微信支付，3支付宝支付

    http.request({
      url:  'swtapi/user/center/card_Recharge_Prepaid',
      method: 'POST',
      param: {
        uId, canteenId, selfIn, t0ransSubType
      },
      success: res => {
        if (res.data.success) {
          //—————————————————————————————充值页面 微信支付未调通 需求暂未需要——————————————————————————————————
        }
      }
    })
  }
})