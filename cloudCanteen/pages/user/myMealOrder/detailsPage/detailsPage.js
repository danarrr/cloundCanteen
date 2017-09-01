// pages/user/myMealOrder/willSpend/willSpend.js
var app = getApp();
import { altBox } from '../../../../component/altBox/class/altBox.js';
import { tipToast } from '../../../../component/tipToast/class/tipToast.js'; // 【tipToast】引入tipToast类
var http = require('../../../../component/http/http.js');
Page({

  onLoad: function (options) {
    // console.log(options)
    new altBox();
    new tipToast();
    this.setData({
      item: options,
      address: options.address == 'null' ? '' : options.address,
      fine: options.fine == 'null' ? 0 : options.fine,
      remark: options.remark == null ? '' : options.remark,
      dishmoney: (parseFloat(options.total) - parseFloat(options.fine == 'null' ? 0 : options.fine)).toFixed(2)

    })
  },

  onShow: function () {
    let pageType = this.data.item.pageType
    let _this = this
    switch (pageType) {
      case "willPay":
        wx.setNavigationBarTitle({ title: '待支付详情' });//设置微信顶端标题栏
        this.setData({
          // showNotBookingBtn: true,
          showCancelBtn: "willPay",
        });
        http.request({
          url: 'swtapi/user/center/orders_list_detail',
          method: 'POST',
          param: {
            orgId: this.data.item.id
          },
          success: function (res) {
            if (res.data.success) {
              //倒计时
              let total_micro_second = res.data.data[0].remainingSecond;
              count_down(_this);
              function count_down(that) {// 渲染倒计时时钟
                _this.setData({
                  clock: date_format(total_micro_second)
                });
                if (total_micro_second <= 0) {
                  _this.setData({
                    clock: ""
                  });
                  // timeout则跳出递归
                  return;
                }
                setTimeout(function () {
                  total_micro_second--;
                  count_down(that);
                }, 1000)
              }
              function date_format(micro_second) {
                var min = Math.floor(micro_second / 60);
                if(min<0)min="0"+min
                var ss = Math.floor(micro_second % 60);
                if(ss<0)ss="0"+ss
                return min + ":" + ss + " ";
              }
              function fill_zero_prefix(num) {
                return num < 10 ? "0" + num : num
              }
            } else {
              _this.toast.show(res.data.message)
            }
          },
        })
        break;
      case "willSpend":
        wx.setNavigationBarTitle({ title: '待消费详情' });//设置微信顶端标题栏
        this.setData({
          // showNotBookingBtn: true,
          showCancelBtn: "willSpend",
        });
        break;
      case "spened":
        wx.setNavigationBarTitle({ title: '已消费详情' });//设置微信顶端标题栏
        this.setData({
          showCancelBtn: "cancel",
          // showNotBookingBtn: false,
        });
        break;
      default:
        wx.setNavigationBarTitle({ title: '已过期详情' });
        this.setData({
          showCancelBtn: "cancel",
          // showNotBookingBtn: false,
        });//设置微信顶端标题栏
        break;
    }
  },

  showCancelBtn: function () {
    wx.navigateBack()//返回失败
  },
  bindNotBooking: function () {
    let that = this;
    http.request({
      url: 'swtapi/user/center/cancelOrders',
      method: 'POST',
      param: {
        arrayList: JSON.stringify([{
          "orgId": this.data.item.id,
          "payType": Number(this.data.item.paytype),//0饭卡1微信2支付宝
          "money": parseFloat(this.data.item.total),
          "payId": this.data.item.batchId
        }])

      },
      success: function (res) {
        if (res.data.success) {
          that.toast.show("取消预订成功")
          setTimeout(function () { wx.navigateBack() }, 2000)
        } else if (!res.data.success && res.data.data.able) {//有罚款，可订
         
          wx.showModal({
            content: res.data.message,
            success: function (data) {
              if (data.confirm) {
                let data = res.data.data.data[0]//罚款信息
                that.cancelOrder(data)

              }
            }
          })

        } else if (!res.data.success && !res.data.data.able) {//不可订
          console.log("不可以订")
          that.toast.show(res.data.message)
        }
        else {
          // that.cancelOrder()
          that.toast.show(res.data.message)
        }
      },
    })
  },
  cancelOrder: function (data) {//取消预订失败发起cancelOrder请求
    console.log(data)
    let that = this;
    http.request({
      url: 'swtapi/user/center/cancelOrder',
      method: 'POST',
      param: {
        arrayList: JSON.stringify([{
          "orgId": this.data.item.id,
          "payType": Number(this.data.item.paytype),//0饭卡1微信2支付宝
          "money": parseFloat(this.data.item.total),
          "payId": this.data.item.batchId
        }]),
        arrayListTwo: JSON.stringify([{//如果有罚款数据，把罚款数据带回
          // "canteenId": this.data.item.canteenId,	//食堂id
          // "canteenName": this.data.item.canteen,		//食堂名称
          // "tradeId": this.data.item.tradeId,	//餐次Id
          // "tradeName": this.data.item.trade,		//餐次名称
          // "date": this.data.item.date,		//报餐或订餐日期

          // "fine": this.data.item.fine,	//罚款，若等于0表示不能操作
          // "status": "1",		//0为报订餐，1为取消
          // "OrderOriginalId": this.data.item.id,
          // "payType": this.data.item.paytype
          "canteenId": data.canteenId,	//食堂id
          "canteenName": data.canteenName,		//食堂名称
          "tradeId": data.tradeId,	//餐次Id
          "tradeName": data.tradeName,		//餐次名称
          "date": data.date,		//报餐或订餐日期
          "fine": data.fine,	//罚款，若等于0表示不能操作
          "status": data.status,		//0为报订餐，1为取消
          "OrderOriginalId": data.orderOriginalId,
          "type": data.type
        }
        ])
      },
      success: function (res) {

        if (res.data.success) {
          that.toast.show("取消预订成功")
          setTimeout(function () { wx.navigateBack() }, 2000)
        } else if (res.data.success == false && res.data.data == null) {
          that.toast.show(res.data.message)
        } else if (res.data.success == false && res.data.data.able == false) {
          // "able":	false:有不能报订餐或取消的，不能继续操作；
          that.toast.show(res.data.message)
        } else if (res.data.success == false && res.data.data.able == true) {
          // "able":	true:没有不能报订或取消的但有罚款
          wx.showModal({
            content: res.data.message,
            success: function (res) {
              if (res.confirm) {
                that.bindNotBooking()

              }
            }
          })

        }
      },
    })
  },
  cancel: function () {//返回按钮
    wx.navigateBack({})
  },
  bindPay: function () {//确认支付按钮
    if (!this.data.choicePayType) {
      this.toast.show("请选择支付方式")
    } else {
      if (this.data.choicePayType == "card") {
        let altBoxData = {
          title: '请输入饭卡密码',
          showPwd: true,
        }
        this.alterbox.show(altBoxData)
      }
    }
  },
  radioChange: function (e) {//选择支付方式
    this.setData({
      choicePayType: e.detail.value
    })

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
              idType: 1, payTypeId: 0, id: that.data.item.id
            },
            success: res => {
              if (res.data.success) {
               
                that.toast.show("饭卡支付成功")
                setTimeout(function () { that.alterbox.hide(); wx.navigateBack() }, 2000)
              }else{
                that.toast.show(res.data.message)
                that.alterbox.hide();
              }
            }
          })
        }
        else {
          console.log(res.data)
       
          that.toast.show(res.data.message)
        }
      },
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