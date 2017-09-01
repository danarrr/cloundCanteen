// pages/mealorder/search/search.js
var app = getApp()
const ComponentNum = require('./../../../component/num/num.js');//商品数量加减组件
let http = require('./../../../component/http/http.js');
const reg = "\\((.+?)\\)";//取括号里内容
Page({
  data: {
    showSrhContent: false,
    noResult: false,
    hasTextClass: 'has-text', // 输入框有内容的css
    history: [],
  },
  reduceTap: function (e) {
    let goodInfo = {
      goodid: e.target.dataset.id,
      goodPrice: e.target.dataset.price,
      goodParent: e.target.dataset.parent,
      goodName: e.target.dataset.name,
      goodNum: e.target.dataset.num,
      cartTitinfo: e.target.dataset.carttitinfo,
      discountPrice: e.target.dataset.discountprice,
      deliveryornot: e.target.dataset.deliveryornot
    }

    this.reduceBtn(goodInfo)//触发num组件，减少数量功能
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
      discountPrice: e.target.dataset.discountprice,
      deliveryornot: e.target.dataset.deliveryornot,
      unit: e.target.dataset.unit

    }

    this.addBtn(goodInfo)//触发num组件，添加数量功能

  },
  //搜索菜品功能
  bindSearch: function (e) {
    this.executeSearch(e.detail.value)
  },

  // 文本搜索框输入监听
  bindInput: function (e) { //  这里不要用bindBlur，因为在真机上回出现诡异的效果
    let hasTextClass = !e.detail.value ? 'has-text' : ''
    this.setData({
      setSrhVal: e.detail.value,
      hasTextClass: hasTextClass
    })

    if (!this.data.setSrhVal) {
      this.executeSearch(this.data.setSrhVal) // 谁叫你耦合了隐藏搜索结果的功能，就这么调用了吧哈哈^_^
    }

  },

  catchSearch: function (e) { // 点击放大镜搜索
    this.executeSearch(this.data.setSrhVal);
  },

  dltHistory: function () {//清空搜索历史
    this.setData({ history: [] })

    wx.setStorageSync('searchHistory', this.data.history)
  },

  setSrhVal: function (e) {//设置文本框搜索val
    this.setData({
      setSrhVal: e.target.dataset.val,
      hasTextClass: 'has-text'
    })

    this.executeSearch(this.data.setSrhVal)
  },

  clearInput: function () { // 清空输入
    this.setData({
      setSrhVal: '',
      hasTextClass: 'has-text'
    })

    this.executeSearch('')
  },

  executeSearch: function (keyText) { // 执行搜索命令
    if (!keyText) {
      this.setData({
        showSrhContent: false
      })
    } else {
      this.setData({
        showSrhContent: true
      })
      let srhListData = app.goodListData;
      let srhList = []
      for (let key in srhListData) {
        for (let i in srhListData[key]) {
          let goodListDataName = srhListData[key][i].name
          srhListData[key][i]['parentObj'] = key
          if (goodListDataName.indexOf(keyText) != -1) {
            srhList.push(srhListData[key][i])
          }
        }
      }

      // 更新搜索历史
      let history = [].concat(this.data.history);

      for (let i = 0; i < history.length; i++) {
        if (history[i] == keyText) {
          history.splice(i, 1)
          break;
        }
      }

      history.unshift(keyText) // 新搜索的要放在最前面
      this.setData({
        srhList: srhList,
        noResult: srhList.length == 0 ? true : false,
        history: history//搜索历史
      })
      wx.setStorageSync('searchHistory', history)
    }
  },

  onLoad: function (options) {
    ComponentNum(this)


  },

  onShow: function () {
    // console.log("===============SRhonShow==============")
    // console.log(app.cartList)
    let history = wx.getStorageSync('searchHistory');
    history = !history || history.length == 0 ? [] : [].concat(wx.getStorageSync('searchHistory')) // 获取搜索历史
    this.setData({ history: history })

    let sltCanteenName = wx.getStorageSync('sltCanteenName')//选中的餐厅名称
    let sltCanteenId = wx.getStorageSync('sltCanteenId')//选中的餐厅名称
    this.setData({
      canteenListTit: {
        canteenName: sltCanteenName,
        canteenId: sltCanteenId,
        canteenTit: sltCanteenName + "(" + sltCanteenId + ")"
      }
    })
    let sltDateName = wx.getStorageSync('sltDateName')//选中的日期名称
    this.setData({
      date: sltDateName
    })
    let sltMealName = wx.getStorageSync('sltMealName'),//选中的餐次名称
      sltMealID = wx.getStorageSync('sltMealID')//选中的餐次id
    let that = this

    http.request({//获得该餐次折扣，和是否配送
      url: 'swtapi/backstage/selectEnaByPrimaryKeys.int',
      param: { cardTypeId: sltMealID.substr(0, 8), tradeId: sltMealID },
      method: 'GET',
      success: data => {
        if (data.data.success) {
          // let discount = data.data.data.discount;
          let deliveryornot = data.data.data.delivery;
          let moneylimit = data.data.data.moneyLimit;
          // that.setData({ discount, deliveryornot, moneylimit })
          that.setData({ deliveryornot, moneylimit })
        }
      }
    })

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
  },

})