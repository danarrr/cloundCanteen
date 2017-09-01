// pages/mealorder/confirm/confirm.js
const app = getApp()
const reg = "\\((.+?)\\)";//取括号里内容
let http = require('../../../component/http/http.js');
const ComponentNum = require('./../../../component/num/num.js');//商品数量加减组件
import { tipToast } from './../../../component/tipToast/class/tipToast.js'; //
Page({
  data: {
    curLeftItem: '123456789（套餐）',
    radio: 'radio',//随意给值让在num组件里判断里可以渲染数据到购物车,
    showPicker: [],//是否显示配送地址样式
    discount: [],

  },



  /**
   * 生命周期函数--监听页面加载
   */
  onHide: function () {
    // this.setData({
    //   currPage: "-1"//从订单页返回
    // })

  },
  onLoad: function (options) {

    this.setData({
      goodListData: app.goodListData,
      // discount: app.discount, 
      cartNum: app.cartData.cartNum,
      // currPage: "+1"//从确认商品页跳转到当前页面
    })
    ComponentNum(this)
    new tipToast()


    function unique(array) {//数组去重方法
      var n = []; //
      for (var i = 0; i < array.length; i++) {
        if (n.indexOf(array[i]) == -1) n.push(array[i]);
      }
      return n;
    }
    if (app.cartList) {
      let deliveryArr = [];//经营分组（送餐地址接口需传此参数）
      let deliveryornot = [];// 是否配送
      for (let key in app.cartList) {
        deliveryornot.push(app.cartList[key][0].deliveryornot);//是否配送(0否，1是）默认为0\
        for (let i in app.cartList[key]) {
          deliveryArr.push(app.cartList[key][i].delivery)
        }
      }
      this.getDeliveryInfo(unique(deliveryArr))

      this.setData({
        cartList: app.cartList,
        cartListTit: app.cartListTit,
        // cartMoney: app.appData.cartMoney
        cartMoney: app.cartData.cartMoney.toFixed(2),
        deliveryornot: deliveryornot,
      })

    }
  },

  onShow: function () {

    // if (this.data.currPage == "-1") {
    //   this.toast.show("订单未支付！已进入支付页面！")
    // }

    let sltArr = [],
      rotate = {}//显示套餐具体菜品旋转样式
    for (let i in app.cartList) {//初始化套餐具体菜品旋转样式
      sltArr.push(0)
      let item = i.split(",")[4]
      rotate[item] = []
      for (let j in app.cartList[i]) {
        if (app.cartList[i][j].dish) {
          rotate[item].push(1)
        } else {
          rotate[item].push(0)
        }

      }

    }

    this.setData({ sltArr, rotate })


  },

  addTap: function (e) {
    let goodInfo = {
      goodid: e.target.dataset.id,
      goodPrice: e.target.dataset.price,
      goodParent: e.target.dataset.parent,
      goodDish: e.target.dataset.gooddish,
      goodName: e.target.dataset.name,
      goodNum: e.target.dataset.num,
      cartTitinfo: e.target.dataset.carttitinfo,
      discountPrice: e.target.dataset.discountprice,//折后价
      // discount: e.target.dataset.discount,

      deliveryornot: e.target.dataset.deliveryornot
    }
    this.addBtn(goodInfo)//触发num组件，添加数量功


  },
  reduceTap: function (e) {
    this.setData({
      showNum0: 'shownum'
    })
    let goodInfo = {
      goodid: e.target.dataset.id,
      goodPrice: e.target.dataset.price,
      goodParent: e.target.dataset.parent,
      goodName: e.target.dataset.name,
      goodNum: e.target.dataset.num,
      cartTitinfo: e.target.dataset.carttitinfo,
      discountPrice: e.target.dataset.discountprice,//折后价
      // discount: e.target.dataset.discount,
      deliveryornot: e.target.dataset.deliveryornot,
      showNum0: this.data.showNum0
    }

    this.reduceBtn(goodInfo)//触发num组件，减少数量功能

  },
  totalSplitOrderList: function () {//整理要传输到接口的数据
    function unique(array) {//数组去重方法
      var n = []; //
      for (var i = 0; i < array.length; i++) {
        if (n.indexOf(array[i]) == -1) n.push(array[i]);
      }
      return n;
    }

    if (app.cartList) {
      let totalSplitOrderList = []//订单信息



      for (let key in app.cartList) {

        let _key = key.split(",");
        let canteenId = _key[0].match(reg)[1],
          consumeTypeId = _key[3].substr(0, 10),
          tradeId = _key[3],
          cardTypeId = _key[3].substr(0, 8),
          startTime = _key[2].match(reg)[1].substr(0, 5).replace(':', ''),
          endTime = _key[2].match(reg)[1].substr(6, 5).replace(':', ''),
          tradeName = _key[2].split(/\(.*?\)/)[0]

        let info = {
          canteenId: canteenId,
          date: _key[1],
          tradeName: tradeName,
          tradeId: tradeId,
          startTime: startTime,
          endTime: endTime,
        }

        let orderListOriginal = {
          "id": info.canteenId,
          "userId": app.appData.uid,
          "canteenId": info.canteenId,
          "tradeId": info.tradeId,
          "orderDate": info.date,
          "consumeTypeId": consumeTypeId,
          "tradeName": info.tradeName,
          "moneyLimit": app.cartList[key][0].moneylimit,
          "startTime": info.startTime,
          "endTime": info.endTime,
          "paytype": 0,
          "paystatus": 0,
          "sended": 0,
          "sendAddress": app.cartList[key][0].sendAddress,
          "sendMoney": 0,
          "money": app.cartData.cartMoney,
          "remark": app.cartList[key][0].remark,
          "flag": 1,
          "delivery": 0,
          "consumeTypeName": "",
        }
        let orderListDetailListOriginal = [];//详细菜品信息集合


        //获取该餐次的订餐是否需要配送，以及折扣
        // let deliveryOrNot = [];
        // discount = [];
        // wx.request({//获得卡型和是否配送
        //   url: app.baseUrl + 'swtapi/backstage/selectEnaByPrimaryKeys.int',
        //   data: { cardTypeId: cardTypeId, tradeId: tradeId },
        //   header: {
        //     'content-type': 'application/json',
        //     'token': app.appData.token
        //   },
        //   success: data => {
        //     if (data.data.success) {
        // deliveryOrNot.push();//是否配送(0否，1是）默认为0\
        //       discount.push(data.data.data.discount);//折扣
        //     }
        //     this.setData({ deliveryOrNot, discount})
        //   }
        // })





        for (let i in app.cartList[key]) {
          orderListDetailListOriginal.push({
            "dishId": app.cartList[key][i].id,
            "dishNum": app.cartList[key][i].num,
            "dishseted": !app.cartList[key][i].dish ? 0 : 1,
          })

        }




        // this.setData({ deliveryArr: unique(deliveryArr) })//数组去重
        totalSplitOrderList.push({
          "orderListOriginal": orderListOriginal,
          "orderListDetailListOriginal": orderListDetailListOriginal
        })
      }


      this.setData({ totalSplitOrderList })
    }
  },

  toPay: function () {
    if (!this.data.cartNum) {
      this.toast.show("请先选择菜品")
    } else {
      wx.showLoading({
        title: '加载中',
      })
      this.totalSplitOrderList()
      let subInfo = {
        "totalSplitOrderList": this.data.totalSplitOrderList
      }
      let _this = this
      app.payInfo = subInfo.totalSplitOrderList
      http.request({
        url: 'swtapi/user/cust/createOrderOriginals',
        param: { 'key': JSON.stringify(subInfo) },
        method: 'GET',
        success: res => {
          wx.hideLoading()
          if (res.data.success == true && res.data.message == null) {
            app.batchId = res.data.data.batchId

            // app.timeOutForPay = res.data.data.balance_time
            let timeOutForPay = res.data.data.balance_time
            wx.navigateTo({
              url: '/pages/mealorder/pay/pay?time=' + timeOutForPay,
            })
            // wx.redirectTo({
            //   url: '/pages/mealorder/pay/pay?time=' + timeOutForPay,
            // })
          } else if (res.data.success == false && res.data.data != null) {
            if (res.data.data.able == true) {
              //能订,要罚款
              let content = []
              for (let i in res.data.data.data) {
                content.push(res.data.data.data[i].canteenName + "," + res.data.data.data[i].date + "," + res.data.data.data[i].tradeName)
              }

              wx.showModal({
                title: String(content),
                content: res.data.message ,
                success: function (data) {
                  if (data.confirm) {
                   let cartMoneyFineSum = app.cartData.cartMoney+res.data.data.data[0].fine//购物车总价加上罚款价格
                   _this.pay2(cartMoneyFineSum)
                  } else if (data.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })
            } else if (res.data.data.able == false) {//不能订

              _this.toast.show(res.data.message + "  请返回重新选择！")
              let datas = res.data.data.data
              let wxssErrorInfo = []

              let ErrorInfoCartNum = app.cartData.cartNum,
                ErrorInfoCartMoney = app.cartData.cartMoney,
                ErrorInfoCartList = app.cartList
              for (let key in app.cartList) {
                for (let i in datas) {
                  let itemdata = datas[i]
                  if (key.split(",")[0].match(reg)[1] == itemdata.canteenId && key.split(",")[1] == itemdata.date && key.split(",")[3] == itemdata.tradeId) {
                    //返回信息餐次过期

                    wxssErrorInfo.push(1)//添加红框样式
                    for (let j in ErrorInfoCartList[key]) {
                      ErrorInfoCartNum = ErrorInfoCartNum - ErrorInfoCartList[key][j].num//修改购物车商品的总数量
                      ErrorInfoCartMoney = ErrorInfoCartMoney - ErrorInfoCartList[key][j].num * ErrorInfoCartList[key][j].discountPrice//修改购物车商品的总价
                    }
                    delete ErrorInfoCartList[key]//去除购物车里该餐次信息

                  } else {
                    wxssErrorInfo.push(0)
                  }

                }
              }


              //返回信息餐次过期 去除购物车tit里该餐次信息

              let ErrorInfocartListTit = []
              for (let z in wxssErrorInfo) {
                if (wxssErrorInfo[z] != 1) {
                  ErrorInfocartListTit.push(app.cartListTit[z])
                }
              }
              _this.setData({
                wxssErrorInfo, ErrorInfoCartNum, ErrorInfoCartMoney, ErrorInfoCartList, ErrorInfocartListTit
              })
              // app.cartListTit=cartListTit
              return false
            }
          }
          else {
            _this.toast.show(res.data.message)
          }
        }
      })
    }
  },


  pay2: function (cartMoneyFineSum) {//调用不带s的接口
    this.totalSplitOrderList()
    let subInfo = {
      "totalSplitOrderList": this.data.totalSplitOrderList
    }
    let _this = this
    app.payInfo = subInfo.totalSplitOrderList

    http.request({
      url: 'swtapi/user/cust/createOrderOriginal',
      param: { 'key': JSON.stringify(subInfo) },
      method: 'GET',
      success: res => {
        if (res.data.success == true && res.data.message == null) {
          app.cartData.cartMoney = cartMoneyFineSum
          app.batchId = res.data.data.batchId
          // app.timeOutForPay = res.data.data.balance_time
          let timeOutForPay = res.data.data.balance_time
          
          wx.navigateTo({
            url: '/pages/mealorder/pay/pay?time=' + timeOutForPay,
          })
        } else if (res.data.success == false && res.data.data != null) {

          if (res.data.data.able == true) {

            //能订,要罚款
            let content = []
            for (let i in res.data.data.data) {
              content.push(res.data.data.data[i].canteenName + "," + res.data.data.data[i].date + "," + res.data.data.data[i].tradeName)
            }

            wx.showModal({
              title: res.data.message,
              content: String(content),
              success: function (data) {
                if (data.confirm) {
                  _this.toPay()
                } else if (data.cancel) {
                  console.log('用户点击取消')
                }
              },
              fail: function (res) {
                console.log(res)
              }
            })
          } else if (res.data.data.able == false) {//不能订
            _this.toast.show(res.data.message + "  请返回重新选择！")
            let datas = res.data.data.data
            let wxssErrorInfo = []

            let ErrorInfoCartNum = app.cartData.cartNum,
              ErrorInfoCartMoney = app.cartData.cartMoney,
              ErrorInfoCartList = app.cartList
            for (let key in app.cartList) {
              for (let i in datas) {
                let itemdata = datas[i]
                if (key.split(",")[0].match(reg)[1] == itemdata.canteenId && key.split(",")[1] == itemdata.date && key.split(",")[3] == itemdata.tradeId) {
                  //返回信息餐次过期

                  wxssErrorInfo.push(1)//添加红框样式
                  for (let j in ErrorInfoCartList[key]) {
                    ErrorInfoCartNum = ErrorInfoCartNum - ErrorInfoCartList[key][j].num//修改购物车商品的总数量
                    ErrorInfoCartMoney = ErrorInfoCartMoney - ErrorInfoCartList[key][j].num * ErrorInfoCartList[key][j].discountPrice//修改购物车商品的总价
                  }
                  delete ErrorInfoCartList[key]//去除购物车里该餐次信息

                } else {
                  wxssErrorInfo.push(0)
                }

              }
            }


            //返回信息餐次过期 去除购物车tit里该餐次信息

            let ErrorInfocartListTit = []
            for (let z in wxssErrorInfo) {
              if (wxssErrorInfo[z] != 1) {
                ErrorInfocartListTit.push(app.cartListTit[z])
              }
            }
            _this.setData({
              wxssErrorInfo, ErrorInfoCartNum, ErrorInfoCartMoney, ErrorInfoCartList, ErrorInfocartListTit
            })
            return false
          } else {
            _this.toast.show(res.data.message)
          }



        } else {
          _this.toast.show(res.data.message)
        }
      }


    })
  },
  bindPickerChange: function (e) {//选择配送地址
    let i = e.target.dataset.itemsidx,
      cartitinfo = e.target.dataset.cartitinfo;

    this.data.sltArr[i] = e.detail.value;
    this.setData({
      sltArr: this.data.sltArr
    })
    let pickerVal = this.data.cartListTit[i].deliveryDatalist[this.data.sltArr[i]].name
    app.cartList[cartitinfo][0].sendAddress = pickerVal;
  },
  getDeliveryInfo: function (arr) {//获取配送地址
    let _this = this
    http.request({
      url: 'swtapi/backstage/selectDeliveryByManageids.int',
      param: { 'key': JSON.stringify(arr) },
      method: 'POST',
      success: res => {
        let data = res.data.data
        let deliveryDatalist = {}
        //修改数组配送地址的数据列表
        // for (let i in data) {
        //   for (let j in data[i].deliveryPlaceList) {
        //     deliveryArrInfo.push({ name: data[i].deliveryPlaceList[j].name, id: data[i].deliveryPlaceList[j].id })
        //   }

        // }
        //修改数组配送地址的数据列表
        for (let i in data) {
          let deliveryArrInfo = []
          let itemCanteenID = data[i].canteenId
          for (let j in data[i].deliveryPlaceList) {
            deliveryArrInfo.push({ name: data[i].deliveryPlaceList[j].name, id: data[i].deliveryPlaceList[j].id })
          }
          deliveryDatalist[itemCanteenID] = deliveryArrInfo
        }

        // for (let z in app.cartList) {
        //   _this.data.deliveryDatalistArr.push(deliveryDatalist)
        // }
        // console.log(_this.data.deliveryDatalistArr)


        _this.setData({ deliveryDatalist: deliveryDatalist })
        let cartListTit = app.cartListTit
        for (let j in cartListTit) {
          let cartListTitCanteenID = cartListTit[j].canteenID
          cartListTit[j].deliveryDatalist = deliveryDatalist[cartListTitCanteenID]

        }
        _this.setData({ cartListTit: cartListTit })
        // _this.setData({ deliveryDatalistArr: _this.data.deliveryDatalistArr })
      }
    })
  },
  sltRadio: function (e) {
    let idx = e.target.dataset.index
    this.data.showPicker[idx] == undefined ? this.data.showPicker.push({ [idx]: true }) : this.data.showPicker[idx] = !this.data.showPicker[idx] ? true : false;
    this.setData({
      showPicker: this.data.showPicker,
      // idx: e.target.dataset.index
    })
  },
  inputRemark: function (e) {//获取输入的备注内容,并传到app.cartList
    let remarkVal = e.detail.value
    let cartitinfo = e.target.dataset.cartitinfo
    app.cartList[cartitinfo][0].remark = remarkVal
  },
  rotate: function (e) {//是否显示套餐具体菜品，图标旋转样式

    let rotate = this.data.rotate,
      items = e.target.dataset.items,
      itemidx = e.target.dataset.itemidx;

    rotate[items][itemidx] = rotate[items][itemidx] == 2 ? 1 : 2
    this.setData({
      rotate: this.data.rotate
    })
  },
  onUnload: function () {
    //退出页面时，如果有过期菜品则删除购物车中对应菜品
    let ErrorInfoCartMoney = this.data.ErrorInfoCartMoney,
      ErrorInfoCartNum = this.data.ErrorInfoCartNum,
      ErrorInfoCartList = this.data.ErrorInfoCartList,
      ErrorInfocartListTit = this.data.ErrorInfocartListTit;
    app.cartData.cartMoney = ErrorInfoCartMoney == undefined ? app.cartData.cartMoney : ErrorInfoCartMoney;
    app.cartData.cartNum = ErrorInfoCartNum == undefined ? app.cartData.cartNum : ErrorInfoCartNum;
    app.cartList = !ErrorInfoCartList ? app.cartList : ErrorInfoCartList;
    app.cartListTit = !ErrorInfocartListTit ? app.cartListTit : ErrorInfocartListTit
    // console.log(app.goodListData)
  },

})

