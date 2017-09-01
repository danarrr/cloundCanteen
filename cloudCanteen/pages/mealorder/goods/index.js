let http = require('../../../component/http/http.js');
const ComponentNum = require('./../../../component/num/num.js');//商品数量加减组件
import { tipToast } from '../../../component/tipToast/class/tipToast.js'; // 【tipToast】引入tipToast类
let app= getApp()
const reg = "\\((.+?)\\)";//取括号里内容
Page({
  data: {
    navLeftItems: [],
    navRightItems: {},
    selectDatas: {},
    goodListData: {},
    curNav: -1,
    cartMoney: 0,
    BGopacity: false,
    showCart: false,
    cartList: {},
    needAnimation: false,
  

   
  },

  showFilter: function (e) {
    /**
    *@param app.showFilter：决定filter页面显示canteen还是meal的数据
    *@param app.appData.showFilterType：从"订餐页"或"报餐页"进入filter页面
    */
    app.showFilter = e.target.dataset.type
    app.appData.showFilterType = 'mealorder'

  },
  switchRightTab: function (e) {  //navLeft左侧栏
    let target = e.target.dataset.name,
      idx = parseInt(e.target.dataset.index),
      dishDataId = this.data.dishDataId
    for (let j in dishDataId) {
      let item = dishDataId[j].replace(/[^\u4e00-\u9fa5]/gi, "");
      if (target == item) {
        this.setData({
          curLeftItem: dishDataId[idx],//根据左侧导航点击
          navRightItems: this.data.goodListData[dishDataId[j]], //navRight显示对应内容 
          curNav: idx,//样式
        })
      }
    }

  },

  onLoad: function (options) {


    ComponentNum(this)//num组件
    new tipToast(); // 【tipToast】创建实例
  },

  onShow: function () {
    // console.log("===============goods onShow================")

    wx.showLoading({ title: '加载中' })
    let that = this,
      self = this,
      my = this;
    this.setData({
      cartMoney: app.cartData.cartMoney.toFixed(2),
      cartNum: app.cartData.cartNum,
      baseUrl: app.baseUrl
    })


    let sltCanteenName = wx.getStorageSync('sltCanteenName')//选中的餐厅名称
    let sltCanteenId = wx.getStorageSync('sltCanteenId')//选中的餐厅名称
    this.setData({
      canteenListTit: {
        canteenName: sltCanteenName,
        canteenId: sltCanteenId,
        canteenTit: sltCanteenName + "(" + sltCanteenId + ")"
      }
    })
    // console.log(this.data.canteenListTit)
    let sltDateName = wx.getStorageSync('sltDateName')//选中的日期名称
    let sltDateId = wx.getStorageSync('sltDateId')//选中的日期名称
    this.setData({
      date: sltDateName
    })

    let sltMealName = wx.getStorageSync('sltMealName')//选中的餐次名称
    let sltMealID = wx.getStorageSync('sltMealID')//选中的餐次id
    // console.log(sltMealName)
    if (!sltMealID) {
      wx.showModal({
        content: "暂无可选餐次",
        showCancel: false
      })
      this.setData({
        mealListTit: {
          mealName: '',
          mealTit: '',
          mealTime: '',
          mealId: ''
        },
        dateTit: {
          date: sltDateName.split(/\(.*?\)/)[0],
          week: sltDateName.match(reg)[1]
        },
        //餐次为空，初始化页面
        navLeftItems: [],
        navRightItems: {},
      })
      wx.hideLoading()
    } else {
      this.setData({
        mealListTit: {
          mealName: sltMealName,
          mealTit: sltMealName.split(/\(.*?\)/)[0],
          mealTime: sltMealName.match(reg)[1],
          mealId: sltMealID
        },
        dateTit: {
          date: sltDateName.split(/\(.*?\)/)[0],
          week: sltDateName.match(reg)[1],
        }
      })


      http.request({
        url: 'swtapi/backstage/selectTeamDishAndSetCyc.int',
        param: { id: sltMealID, orderDate: sltDateId, allowGroup: false },
        method: 'GET',
        success: res => {
          let cardTypeId = sltMealID.substr(0, 8)
          http.request({
            url: 'swtapi/backstage/selectEnaByPrimaryKeys.int',
            param: { cardTypeId: cardTypeId, tradeId: sltMealID },
            method: 'GET',
            success: data => {
              if (data.data.success) {
                let dishData = res.data.data.dish;
                let dishsetData = res.data.data.dishset;//套餐
                if (dishData == null && dishsetData.length == 0) {
                  that.toast.show("该餐次菜品为空")
                  wx.hideLoading()
                  this.setData({
                    navLeftItems: [],
                    navRightItems: []
                  })
                  return false
                }
                //把接口数据(套餐diset)传到dishsetData， 整合到goodListData的数据列表
                let dishsetToGoodListData = () => {
                  // let dishsetData = res.data.data.dishset;//套餐
                  let dishsetlist = []
                  dishsetData.forEach((item, index) => {
                    dishsetlist.push({

                      name: item.dishset.name,
                      className: '套餐',
                      id: item.dishset.id,
                      price: item.dishset.price,
                      picUrl: item.dishset.picPath,
                      dish: [], //套餐里具体菜品
                      unit: "套",
                      discountPrice: data.data.data ? data.data.data.discount ? (item.dishset.price * (data.data.data.discount / 100)).toFixed(2) : item.dishset.price : item.dishset.price //折后价
                    })
                    for (let i in item.dishsetDish) {
                      if (item.dishsetDish[i].dishsetId == dishsetlist[index].id) {
                        dishsetlist[index]['dish'] += item.dishsetDish[i].name + "*" + item.dishsetDish[i].num + ","
                      }
                    }
                  })
                  return dishsetlist
                }
                if (dishsetData.length) {
                  this.data.goodListData['123456789（套餐）'] = dishsetToGoodListData()
                }

                //navLeftItems左栏导航增加套餐

                let dishDataArr = dishsetData.length ? [{
                  id: '123456789（套餐）',
                  value: '套餐',
                  key: '123456789（套餐）'

                }] : [],

                  dishDataId = dishsetData.length ? ['123456789（套餐）'] : [];
                for (let key in dishData) {
                  dishDataId.push(key)
                  const a = key.split('(')
                  const b = key.replace(/[^\u4e00-\u9fa5]/gi, "")
                  dishDataArr.push({
                    id: a[0],
                    value: b,
                    key: key,
                  })
                  //  把接口数据(dish)传到dishData， 整合到goodListData的数据列表，
                  //  和套餐数据合并，goodListData渲染完成
                  this.data.goodListData[key] = dishData[key]

                  // 获取当前折扣计算折后价，dishData增加属性discountPrice
                  for (let i in dishData[key]) {
                    dishData[key][i].discountPrice = data.data.data ? data.data.data.discount ? (dishData[key][i].price * (data.data.data.discount / 100)).toFixed(2) : dishData[key][i].price : dishData[key][i].price
                  }

                  // app.moneylimit = data.data.data.moneyLimit//预定限额 .............TODO不用可删
                }

                this.setData({
                  navLeftItems: dishDataArr,
                  dishDataId: dishDataId,

                })

                // let discount = data.data.data.discount,//折扣幅度
                let deliveryornot = data.data.data? data.data.data.delivery:0,//是否配送
                  moneylimit = data.data.data?data.data.data.moneyLimit:0//菜品限额
                this.setData({ deliveryornot, moneylimit })
                // this.setData({ discount, deliveryornot, moneylimit })

                /*———————— 监听页面显示onShow，把购物车的内容cartList重新渲染到goodListData———————— */
                /*获取食堂  餐次  时间*/

                let canteenListTit = this.data.canteenListTit.canteenTit,
                  mealListTit = this.data.mealListTit.mealName,
                  mealId = this.data.mealListTit.mealId,
                  dateTit = this.data.dateTit.date;
                let canteenName = canteenListTit.split(/\(.*?\)/)[0],
                  date = dateTit,
                  tradeName = mealListTit.split(/\(.*?\)/)[0]
                let allTit = canteenName + " " + date + " " + tradeName
                let cartListKey = [canteenListTit, dateTit, mealListTit, mealId, allTit].join(",");


                let count = 0;
                let navLeftItems = self.data.navLeftItems
                let goodListData = this.data.goodListData

                if (app.cartList) {
                  this.setData({ cartList: app.cartList })
                  this.setData({ cartListTit: app.cartListTit })
                  let cartList = app.cartList[cartListKey]


                  //每个商品的num
                  for (let y in cartList) {

                    for (let j in goodListData[cartList[y].parent]) {


                      if (goodListData[cartList[y].parent][j].name == cartList[y].name) {
                        goodListData[cartList[y].parent][j]['num'] = cartList[y].num

                      }
                    }
                    //每个类别的totalnum
                    for (let z in navLeftItems) {
                      let num
                      if (cartList[y].parent == navLeftItems[z].key) {
                        if (!navLeftItems[z].total) {
                          navLeftItems[z].total = 0
                        } else {
                          navLeftItems[z].total = navLeftItems[z].total
                        }
                        navLeftItems[z]['total'] = cartList[y].num + navLeftItems[z].total
                      }
                    }
                    that.setData({
                      navLeftItems
                    })
                  }


                }
                //!--

                /*———————— 监听页面显示onShow，自动点击nav-leftm第一个———————— */
                let leftItemOneData = {
                  target: {
                    dataset: {
                      name: navLeftItems[0].value,
                      index: 0,
                      dishDataId: navLeftItems[0].id
                    }
                  }
                }
                that.switchRightTab(leftItemOneData)
                wx.hideLoading()
              }
            }
          })
        }
      })
    }
  },

  onHide: function () {
    app.goodListData = this.data.goodListData
   for(let j in app.cartList){
     for(let i in app.cartList[j]){
       app.cartList[j][i].showNum0 = 'hidenum'
     }
   }
  },

  reduceTap: function (e) {
    this.setData({
      showNum0: this.data.showCart ? 'shownum' :'hidenum'
    })
    let goodInfo = {
      goodid: e.target.dataset.id,
      goodPrice: e.target.dataset.price,
      goodParent: e.target.dataset.parent,
      goodName: e.target.dataset.name,
      goodNum: e.target.dataset.num,
      cartTitinfo: e.target.dataset.carttitinfo,
      // discount: e.target.dataset.discount,
      discountPrice: e.target.dataset.discountprice,//折后价
      // showNum0: !e.target.dataset.shownum  ? this.data.showNum0 : e.target.dataset.shownum 
      showNum0: this.data.showNum0
    }

    this.reduceBtn(goodInfo)//触发num组件，减少数量功能
    this.totalNum(this.data.curLeftItem)
   
  },

  addTap: function (e) {
    this.setData({
      showNum0: this.data.showCart ? 'shownum' : 'hidenum'
    })
    let goodInfo = {
      goodid: e.target.dataset.id,
      goodPrice: e.target.dataset.price,
      goodParent: e.target.dataset.parent,
      goodDish: e.target.dataset.gooddish,
      goodName: e.target.dataset.name,
      goodNum: e.target.dataset.num,
      cartTitinfo: e.target.dataset.carttitinfo,
      // discount: e.target.dataset.discount,//菜品折扣
      discountPrice: e.target.dataset.discountprice,//折后价
      deliveryornot: e.target.dataset.deliveryornot,//菜品是否配送
      moneylimit: e.target.dataset.moneylimit,//菜品限额
      unit: e.target.dataset.unit,
      showNum0: this.data.showNum0

    }



    this.addBtn(goodInfo)//触发num组件，添加数量功能
    this.totalNum(this.data.curLeftItem)

  },
  //每个商品类别总数目
  totalNum: function (leftItemKey) {
    let goodListData = this.data.goodListData,
      count = 0,
      leftItemId
    for (let i in goodListData[leftItemKey]) {
      let num
      if (goodListData[leftItemKey][i].num == undefined) {
        num = 0
      } else {
        num = parseInt(goodListData[leftItemKey][i].num)
      }
      count += num
    }

    for (let j in this.data.navLeftItems) {
      if (this.data.navLeftItems[j].key == leftItemKey) {
        this.data.navLeftItems[j]['total'] = count
        let newLeftItems = this.data.navLeftItems
        this.setData({
          navLeftItems: newLeftItems
        })
      }
    }
  },

  showCartList: function () {//显示购物车列表
    // if (!app.cartList && JSON.stringify(app.cartList) == "{}") {
    if (!this.data.cartNum &&!this.data.showCart){
      this.toast.show('请先选择菜品')
      return false
    } else {
      let goodListData = this.data.goodListData;
      this.setData({
        goodListData: goodListData,
        openPicker: !this.data.openPicker,//cartList动画
        needAnimation: true//cartList动画
      })
      if (this.data.BGopacity == true && this.data.showCart == true) {
        this.setData({ BGopacity: false, showCart: false })
        this.onHide()
        this.onShow()
      } else {
        this.setData({ BGopacity: true, showCart: true })
       
      }
    }

  },

  empty: function () {//清空购物车

    app.cartList = {}
    app.cartData.cartMoney = 0
    app.cartData.cartNum = 0
    app.cartListTit = [];

    this.onShow()//清空完刷新页面
  },
  toConfirm: function () {//跳转到确认订餐页

    // if (!app.cartList || JSON.stringify(app.cartList) == "{}") {
    if (!this.data.cartNum){
      this.toast.show('请先选择菜品')
      return false
    } else {

      wx.navigateTo({
        url: '/pages/mealorder/confirm/confirm',
      })
    }
  },
  // toPageSrh: function () {
  //   if (!this.data.mealListTit.mealId) {
  //     this.toast.show("餐次为空，没有菜品可搜索！")
  //   } else {
  //     wx.navigateTo({
  //       url: "/pages/mealorder/search/search"
  //     })
  //   }


  // }
})
