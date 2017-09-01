// pages/room/room/index.js
var app = getApp()
let http = require('../../../component/http/http.js');
Page({
  canteenListTit: "",
  mealListTit: "",
  detail: {},
  roomlist: {},
  data: {
    detail: {},
  },
  dateList: function () {

    let self = this;
    let sltRoomCanteenId = wx.getStorageSync('sltRoomCanteenId')

    http.request({
      url:  'swtapi/backstage/getWorkDayList.int',
      param: {
        canteenId: sltRoomCanteenId, listNum: 7
      },
      method: 'GET',
      success: function (data) {

        let res = data.data.data;

        wx.setStorageSync('sltRoomDateName', res[0].name)
        wx.setStorageSync('sltRoomDateId', res[0].id)
        let sltRoomDateName = wx.getStorageSync('sltRoomDateName')

        // console.log(sltDateName)
        self.setData({
          date: sltRoomDateName.replace('(', '\n(')
        })
        self.getRoomMealList()
      }
    })

  },
  canteenList: function () {

    let that = this,
      self = this

    http.request({
      url: 'swtapi/user/cust/canteen_list',
      data: { uId: app.appData.uid },
      method: 'GET',
      success: function (data) {
        let res = data.data.data;
        wx.setStorageSync('sltRoomCanteenName', res[0].name)
        wx.setStorageSync('sltRoomCanteenId', res[0].id)
        let sltRoomCanteenName = wx.getStorageSync('sltRoomCanteenName')
        self.setData({
          canteenListTit: sltRoomCanteenName
        })

        that.dateList()
      }
    })
  },
  getRoomMealList: function () {
    let that = this;
    let sltRoomCanteenId = wx.getStorageSync('sltRoomCanteenId'), // 获取餐次列表
      sltRoomDateId = wx.getStorageSync('sltRoomDateId') //获取时间

    http.request({
      url: 'swtapi/backstage/selectRoomTradesList.int',
      param: {
        id: sltRoomCanteenId,
        sDate: sltRoomDateId,
      },
      method: 'GET',
      success: function (data) {
        let res = data.data.data;
        if (res == '') {

          wx.setStorageSync('sltRoomMealName', '餐次为空')
          wx.setStorageSync('sltRoomMealID', null)
          that.setData({
            meallistDatas: null
          })
        } else {

          that.setData({
            mealListTit: res[0].name
          })
          wx.setStorageSync('sltRoomMealName', res[0].name)
          wx.setStorageSync('sltRoomMealID', res[0].id)
          that.getroomlist()
        }
      }
    })
  },
  getroomlist: function () {
    let that = this;
    let sltRoomCanteenName = wx.getStorageSync('sltRoomCanteenName'),
      sltRoomCanteenId = wx.getStorageSync('sltRoomCanteenId'),
      sltRoomMealID = wx.getStorageSync('sltRoomMealID'),
      sltRoomDateId = wx.getStorageSync('sltRoomDateId')
    http.request({
      url:  'swtapi/backstage/selectRoomList.int',
      param: { "canteenId": sltRoomCanteenId, "tradeId": sltRoomMealID, "ordersDate": sltRoomDateId },
      method: 'GET',
      success: data => {
        let roomlist = data.data.data
        that.setData({
          roomlist: roomlist
        })
      }
    })
  },
  onLoad: function (options) {
    app.editTabBar();//添加tabBar数据

    this.canteenList();
    // let sltCanteenName = wx.getStorageSync('sltCanteenName'),
    //   sltMealName = wx.getStorageSync('sltRoomMealName'),
    //   date = wx.getStorageSync('sltDateName')
    // this.setData({
    //   canteenListTit: sltCanteenName,
    //   mealListTit: sltMealName,
    //   date: date
    // })
  },


  onShow: function () {
    let sltRoomCanteenName = wx.getStorageSync('sltRoomCanteenName'),
      sltRoomCanteenId = wx.getStorageSync('sltRoomCanteenId'),
      sltRoomMealName = wx.getStorageSync('sltRoomMealName'),
      sltRoomMealID = wx.getStorageSync('sltRoomMealID'),
      sltRoomDateId = wx.getStorageSync('sltRoomDateId'),
      date = wx.getStorageSync('sltRoomDateName')

    this.setData({
      canteenListTit: sltRoomCanteenName,
      mealListTit: sltRoomMealName,
      date: date.replace('(', '\n(')
    })
    if (!sltRoomMealID) {

    } else {

      this.getroomlist()
    }
  },

  showFilter: function (e) {
    app.showFilter = e.currentTarget.dataset.type
    app.appData.showFilterType = 'room'
  },


})