// pages/login/login.js

import { tipToast } from '../../component/tipToast/class/tipToast.js'; // 【tipToast】引入tipToast类
var app = getApp();
Page({
  data: {
    username: null,  //usrname
    password: null,
    verifyCode: '',
    needVerifyCode: false // 需要验证码
  },
  onLoad: function (options) {
    new tipToast(); // 【tipToast】创建实例
  },

  onReady: function () {
    wx.hideLoading({
    })
  },

  loginBtn: function (e) {
    let data = e.detail.value;

    this.setData({
      username: data.username,
      password: data.password,
      verifyCode: data.verifyCode
    })
    // 校验输入
    if (this.data.username == '' || this.data.password == '') {
      this.toast.show('账号或密码不能为空') // 【tipToast】使用
      return;
    }
    if (this.data.needVerifyCode && this.data.verifyCode == '') {
      this.toast.show('请输入验证码')
      return;
    }
    this.login();
  },

  login: function () {
    let that = this
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.baseUrl + 'swtapi/user/sys/login',
      method: 'POST',
      header: that.data.needVerifyCode ?
        {
          'content-type': 'application/x-www-form-urlencoded',
          'token': that.data.verifyToken
        } :
        {
          'content-type': 'application/x-www-form-urlencoded',
        },
      data: that.data.needVerifyCode ?
        {  // 需要验证码
          account: that.data.username,
          pwd: that.data.password,
          verifyCode: that.data.verifyCode,
        }
        : {
          account: that.data.username,
          pwd: that.data.password
        },
      success: function (res) {
        wx.hideLoading()
        if (res.statusCode == '200') {
          if (res.data.success == true && res.data.code == null) {
            app.appData = {
              uid: res.data.data.user.id,
              eid: res.data.data.user.eid,
              cardTypeId: res.data.data.user.cardTypeId,
              token: res.data.data.token,
              userInfo: {
                name: res.data.data.user.name,
                id: res.data.data.user.id,
                phone: res.data.data.user.phone,
                canteenId: res.data.data.user.canteenId,//用户食堂编码
                cardId: res.data.data.user.cardId,//饭卡编码
                // departmentName: res.data.data.user.departmentName
              }
            };
            // app.cartData = {//改到index/index页重置，这里先不删
            //   cartMoney:0,
            //   cartNum:0
            // }
            // app.cartList={}
            // app.cartListTit=[]

            // TODO 模拟开启所有模块权限，正式版注释掉
            // res.data.data.user.permission.canteenPermission = { isApply: 1, isGroupOrder: 1, isEval: 1, isRoomBook: 1, isGroupApply: 1, isOrder:1}
            
            app.permission = res.data.data.user.permission;
            wx.redirectTo({ // 不允许从主页回到登录页
              url: '/pages/mealorder/index/index',
            })
            /*清除条件筛选的storage*/
            try {
              wx.clearStorageSync()
            } catch (e) {
              // Do something when catch error
            }
          } else {
            that.getVerify()
            that.toast.show(res.data.message)
            that.setData({
              needVerifyCode: true
            })
          }

        } else {
          that.toast.show('接口错误')
        }
      }
    });

    // TODO 看一下是不是可以删除
    // app.appData.userInfo = { username: this.data.username, password: this.data.password, phone: this.data.phone }//赋值app.js



  },

  getVerify: function () { // 获取验证码
    let that = this;
    wx.request({
      url: app.baseUrl + 'swtapi/user/tool/verifyCode',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded",
        "appid": "k5elcaha2v5o"
      },
      success: function (res) {
        let verifyImg = 'data:image/png;base64,' + res.data.data.img
        that.setData({
          verifyImg: verifyImg,
          verifyToken: res.data.data.token
        })
      }
    })
  },

  forgetPwd: function () {//忘记密码
    wx.showModal({
      title: '提示',
      content: '请联系管理员',
      showCancel: false,
      confirmText: '知道了'
    })
  }
})