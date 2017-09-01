// pages/mealorder/pay/pay.js
const app = getApp();
const CryptoJS = require('../../../utils/crypto-js.js');
let http = require('../../../component/http/http.js');
import { altBox } from '../../../component/altBox/class/altBox.js';
import { tipToast } from '../../../component/tipToast/class/tipToast.js';

Page({
  data: {
    items: [
      { name: 'card', value: '饭卡支付', pic: 'card' },
      // { name: 'wechat', value: '微信支付', pic: 'wechat' }
    ],
    showClock:false,
    showAltBox: false,
    btnToPayDisable:false,
    payok:false,
    overdue: false,
  },


  radioChange: function (e) {
    this.setData({
      payType:e.detail.value
    })
    let that = this
    let subInfo = {//订单信息
      "totalSplitOrderList": app.payInfo
    }
    function encryptByDESModeCBC(message) {//加密函数
      var key = "swtwxweb";
      var keyHex = CryptoJS.enc.Utf8.parse(key);
      var ivHex = CryptoJS.enc.Utf8.parse(key);
      var encrypted = CryptoJS.DES.encrypt(message, keyHex, {
        iv: ivHex,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
      );
      return encrypted.ciphertext.toString();
    }
    // console.log(encryptByDESModeCBC('8737bc654290da1569c5fd8f1147e78e'))

    let _this = this;
    /**————————————————————————————————微信支付——————————————————————————————————————————*/
    // if (e.detail.value == 'wechat') {

    //   wx.login({//获取openid和session_key
    //     //!！！！！！！-----------未检测用户过期
    //     success: function (res) {
    //       if (res.code) {
    //         //发起网络请求
    //         wx.request({
    //           url: 'https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=JSCODE&grant_type=authorization_code',//code 换取 session_key
    //           data: {
    //             appid: 'wxb84ca6e257f0a520',
    //             secret: '9b5be69dcf014db5f85c593bdd936b9d',
    //             js_code: res.code,
    //             grant_type: 'authorization_code'

    //           },
    //           success: data => {
    //             _this.setData({
    //               openid: data.data.openid,
    //               session_key: data.data.session_key
    //             })
    //             let wxKeyval = encryptByDESModeCBC('e3ac3a36ddb1b5fb7c620dab9f787b27'),
    //               wxAppi = encryptByDESModeCBC('wxb84ca6e257f0a520'),
    //               wxMchid = encryptByDESModeCBC('1236689102');
    //             wx.request({
    //               url: app.baseUrl + 'swtapi/user/pay/wx_trade_creatOrderPay2',
    //               method: 'POST',
    //               header: {
    //                 'content-type': 'application/x-www-form-urlencoded',
    //                 'token': app.appData.token
    //               },
    //               data: {
    //                 "eid": String(app.appData.eid),
    //                 "wxKeyval": wxKeyval,//API支付秘钥
    //                 "wxAppid": wxAppi,
    //                 "wxMchid": wxMchid,
    //                 "deviceInfo": 'web',
    //                 "body": '食膳云小程序',
    //                 "attach": "",
    //                 "outTradeNo": String(app.batchId),
    //                 // "totalFee": String(app.appData.cartMoney),
    //                 "totalFee": String(app.cartData.cartMoney),
    //                 "notifyUrl": "http://tech.swt1993.com/weixinCloud/wxPayh/PayNotice.aspx",
    //                 "tradeType": 'JSAPI',
    //                 "openid": String(_this.data.openid),
    //                 "payModel": "wxMini"//小程序调用加多这个参数


    //               },
    //               success: res => {
    //                 if (res.data.success) {
    //                   let jDate = JSON.parse(res.data.data)

    //                   var timestamp = Math.round(new Date().getTime()).toString();
    //                   var nonceStr = jDate.nonce_str
    //                   var packagess = "prepay_id=" + jDate.prepay_id
    //                   var md5Json = "appId=" + jDate.appid + "&nonceStr=" + nonceStr + "&package=" + packagess + "&signType=MD5" + "&timeStamp=" + timestamp + "&key=e3ac3a36ddb1b5fb7c620dab9f787b27";
    //                   var jSign = CryptoJS.MD5(md5Json).toString()//MD5加密

    //                   wx.requestPayment(//微信支付
    //                     {
    //                       'timeStamp': String(timestamp),
    //                       'nonceStr': String(nonceStr),
    //                       'package': String(packagess),
    //                       'signType': 'MD5',
    //                       'paySign': jSign,
    //                       'success': function (res) { console.log(res) },
    //                       'fail': function (res) { console.log(res) },
    //                       'complete': function (res) { }
    //                     })
    //                 }
    //               }
    //             })
    //           }
    //         })
    //       }
    //     }
    //   })
    //   /**————————————————————————————————微信支付结束——————————————————————————————————————————*/
    // } else {
    // this.setData({ showAltBox: true })
    // let altBoxData = {
    //   title: '请输入饭卡密码',
    //   showPwd: true,
    // }
    // this.alterbox.show(altBoxData)
    // }
  },
pay:function(){
  if (this.data.payType=='card'){
    let altBoxData = {
      title: '请输入饭卡密码',
      showPwd: true,
    }
    this.alterbox.show(altBoxData)
  }else{
    this.toast.show("请先选择支付方式")
  }
 
},

  _altBoxBindSumbit: function (event) {
    let that = this;
    // let data = e.detail.value;
    /**————————————————————————————————饭卡支付——————————————————————————————————————————*/
    //校验用户密码
    http.request({
      url: 'swtapi/user/sys/check_pwd',
      method: 'POST',
      param: {
        pwd: that.data._altBoxPwdVal//输入密码的值
      },
      success: res => {
        if (res.data.success) {//密码正确
          http.request({
            url: 'swtapi/user/pay/payOrder.do',//饭卡支付
            method: 'POST',
            param: {
              idType: 2, payTypeId: 0, id: app.batchId
            },
            success: res => {
              if (res.data.success) {
                //console.log("饭卡支付成功")
                // setTimeout(function () { that.alterbox.hide() }, 2000)
                wx.reLaunch({
                  url: '../pay/payok/payok',
                })
                this.setData({
                  payok:true
                })
                that.alterbox.hide()
              }else{
                that.toast.show(res.data.message)
                that.alterbox.hide()
              }
            }
          })
        }
        else {
          that.toast.show(res.data.message)
        }
      },
    })
     /**————————————————————————————————饭卡支付结束——————————————————————————————————————————*/
  },
  _altBoxPwdVal: function (e) {
    this.setData({
      _altBoxPwdVal: e.detail.value
    })
  },
  _altBoxHide: function (e) {
    this.alterbox.hide()
  },


  onLoad: function (options) {
    // this.setData({ time: options.time })
    new altBox();
    new tipToast()
    this.setData({ cartMoney: (app.cartData.cartMoney).toFixed(2) })

    let total_micro_second = options.time;//倒计时
    // let total_micro_second =10;
    count_down(this);

    function count_down(that) {// 渲染倒计时时钟
     
      that.setData({
        clock: date_format(total_micro_second)
      });
      if (total_micro_second <= 0) {
        that.setData({
          clock: "",
          showClock:true,
          btnToPayDisable: true
        });
       
        that.toast.show("订单已过期")
        that.setData({
          overdue:true
        })
        // timeout则跳出递归
        // return;
      }
      setTimeout(function () {
        total_micro_second--;
        count_down(that);
      }, 1000)
    }
    function date_format(micro_second) {
      var min = Math.floor(micro_second / 60);
      if(min<10)min="0"+min
      var ss = Math.floor(micro_second % 60);
      if (ss<10)ss="0"+ss
      return min + ":" + ss + " ";
    }
    function fill_zero_prefix(num) {
      return num < 10 ? "0" + num : num
    }
  },


  cancel: function () {
    this.setData({ showAltBox: false })
  },
  onUnload:function(){
    if (!this.data.payok){
      wx.reLaunch({
        url: '/pages/mealorder/index/index?upperPage=payPage&overdue=' + this.data.overdue,//upperPage上一页
      })
    }
   
  }

  
})