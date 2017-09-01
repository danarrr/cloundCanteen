
import { altBox } from '../../../component/altBox/class/altBox.js'; // 
import { tipToast } from '../../../component/tipToast/class/tipToast.js'; // 【tipToast】
var http = require('../../../component/http/http.js');
var app = getApp()

Page({
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    new altBox();
    new tipToast();
    this.setData({
      selfMoney: options.selfMoney
    })
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
            usrid: res.data.data.id,
           
          })
        } else {
          that.toast.show(res.data.message)
          that.setData({
            name:'',
            usrid:'',

          })
        }
      }
    })
  },
  bindTransferMoney: function (e) {//获取输入的充值金额
    this.setData({ transferMoney: e.detail.value })

  },
  bindConfirmTransfer: function () {
    if (!this.data.transferMoney ) {  // 没数据时禁止点击按钮
      this.toast.show("请完善转账信息")
    } else {
      let that = this;
      let altBoxData = {
        title: '请输入饭卡密码',
        showPwd: true,
      }
      this.alterbox.show(altBoxData)
    }

  },
  _altBoxBindSumbit: function (event) {
    let that = this
    let uId = app.appData.uid,//转出账号
      canteenId = app.appData.userInfo.canteenId,
      targetCardId = this.data.usrid,//转入账号
      transferPwd = this.data._altBoxPwdVal,
      money = this.data.transferMoney

    http.request({
      url: '/swtapi/user/center/transfer_accounts',
      method: 'POST',
      data: {
        uId, canteenId, targetCardId, transferPwd, money
      },
      success: res => {
        if (res.data.success) {
          that.toast.show(res.data.data.message)
          setTimeout(function () { that.alterbox.hide() }, 2000)
        } else {
          that.toast.show(res.data.message)
        }
      }
    })
  },
  _altBoxPwdVal: function (e) {
    this.setData({
      _altBoxPwdVal: e.detail.value
    })
  },
  _altBoxHide: function (e) {
    this.alterbox.hide()
  },
})