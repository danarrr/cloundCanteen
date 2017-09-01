// pages/user/setting/setting.js
import { altBox } from '../../../component/altBox/class/altBox.js'; // 
import { tipToast } from '../../../component/tipToast/class/tipToast.js'; // 【tipToast】引入tipToast类
var http = require('../../../component/http/http.js');
var app = getApp()
Page({
  data: {
    showType: 'Index',
    BGopacity: false,
    altBoxShow: false,
    oldpwdError: false,
    newpwdError: false
  },
  onLoad: function (options) {
    new altBox();
    new tipToast(); // 【tipToast】创建实例
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  toShow: function (e) {
    this.setData({
      showType: e.target.dataset.type,
    })
    if (e.target.dataset.type == 'Etc') {
      this.setData({
        BGopacity: true
      })
    }
  },
  loss: function () {
    this.setData({ altBoxShow: true })
    let altBoxData = {
      title: '请输入饭卡密码',
      showPwd:true,
    }
    
    this.alterbox.show(altBoxData)
  
  },
  cancel: function () {
    this.setData({
      showType: 'Index',
      BGopacity: false,
    })
  },
  oldPwd: function (e) {//旧密码取值
    this.setData({
      oldPwd: e.detail.value
    })
  },
  newPwd: function (e) {//新密码取值
    this.setData({
      newPwd: e.detail.value
    })
  },
  againNewPwd: function (e) {//重复新密码取值
    this.setData({
      againNewPwd: e.detail.value
    })
    if (this.data.newPwd != e.detail.value) {
      this.setData({
        newpwdError: true
      })
    } else {
      this.setData({
        newpwdError: false
      })

    }
  },
  confirmPwd: function (e) {
    let that = this
    if (!this.data.oldPwd || !this.data.newPwd || !this.data.againNewPwd) {
      that.toast.show('请先完善信息')
    } else {
      //判断就密码正确与否
      http.request({
        url: 'swtapi/user/center/change_pwd',
        method: 'POST',
        param: {
          uId: app.appData.uid,
          oldPwd: this.data.oldPwd,
          newPwd: this.data.newPwd
        },
        success: function (res) {
          if (res.data.success) {
            that.toast.show('修改密码成功')
          } else {//调用接口失败
            that.toast.show(res.data.message)
          }
        }
      })
    }

  },
  signOut:function(){
    console.log("退出登录")
    wx.reLaunch({ // 返回登录页
      url: '/pages/login/login',
    })
  },
  //---------------------------------------------------------------------------------------
  // 这样的封装思维就是，page负责界面交互，数据的处理交给class。
  // ---------------------------------------------------------------------------------------这就是所谓的高内聚低耦合，这是面向对象的一种运用，单一职责原则。
  _altBoxBindSumbit: function (event) {
    let that = this
    http.request({
      url:  'swtapi/user/center/card_loss',
      method: 'POST',
      param: {
        'uId': app.appData.uid,
        'password': this.data._altBoxPwdVal
      },
      success: function (res) {
        if (res.data.success) {
          that.toast.show("挂失成功")
          that.cancel()
          that.alterbox.hide()
          
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