// pages/filter/filter.js
// 选择食堂或选择餐次的页面
import { tipToast } from '../../component/tipToast/class/tipToast.js'; // 【tipToast】引入tipToast类
let http = require('../../component/http/http.js');
var app = getApp();
Page({
  getCanteenlist: function (pagetype) {
    let that = this
    wx.setNavigationBarTitle({ title: '选择食堂' })//设置微信顶端标题栏
    // 获取食堂列表
    http.request({
      url: 'swtapi/user/cust/canteen_list',
      param: {
        uId: app.appData.uid
      },
      method: 'GET',
      success: function (data) {
        if (data.data.success) {
          let res = data.data.data;
          that.setData({
            canteenlistDatas: res
          })
          //设置进入页面被选中的样式  
          let sltId
          switch (pagetype) {
            case 'mealorder':
              sltId = 'sltCanteenId'
              break;
            case 'room'://TODO包房暂未测试
              sltId = 'sltRoomIdCanteenId'
              break;
          }
          for (let j in res) {
            if (res[j].id == wx.getStorageSync(sltId)) {
              that.setData({ currentItem: j, currItemBg: j })
            }
          }

        } else {
          that.toast.show(data.data.message)
        }
      }
    })

  },
  getDateList: function (dateType) {

    let self = this;
    let sltCanteenId = dateType == 'mealorder' ? wx.getStorageSync('sltCanteenId') : wx.getStorageSync('sltRoomCanteenId')

    http.request({
      url: 'swtapi/backstage/getWorkDayList.int',
      param: {
        canteenId: sltCanteenId, listNum: 7
      },
      method: 'GET',
      success: function (data) {
        if (data.data.success) {
          let res = data.data.data;
          if (!res.length) {
            return;
          }

          if (dateType == 'mealorder') {
            wx.setStorageSync('sltDateName', res[0].name)
            wx.setStorageSync('sltDateId', res[0].id)
            let sltDateName = wx.getStorageSync('sltDateName')
            self.setData({
              date: sltDateName
            })
            self.getMealData(1, dateType)
          } else if (dateType == 'room') {
            wx.setStorageSync('sltRoomDateName', res[0].name)
            wx.setStorageSync('sltRoomDateId', res[0].id)
            let sltRoomDateName = wx.getStorageSync('sltRoomDateName')
            // self.setData({
            //   date: sltRoomDateName
            // })

            self.getMealData(1, dateType)
          }
        } else {
          self.toast.show(data.data.message)
        }
      }
    })
  },
  getMealData: function (type, pageType) {//type=1订餐；type=2报餐
    let that = this;
    let sltCanteenId = pageType == 'room' ? wx.getStorageSync('sltRoomCanteenId') : wx.getStorageSync('sltCanteenId'), // 获取餐次列表
      sltDateId = pageType == 'room' ? wx.getStorageSync('sltRoomDateId') : wx.getStorageSync('sltDateId') //获取时间
    let url = pageType == 'room' ? 'swtapi/backstage/selectRoomTradesList.int' : 'swtapi/backstage/selectTradesList.int';
    http.request({
      url: url,
      param: {
        id: sltCanteenId,
        sDate: sltDateId,
        type: type,
      },
      method: 'GET',
      success: function (data) {
        if (data.data.success) {
          let res = data.data.data;
          if (res == '' || !res) {
            that.toast.show('该餐厅餐次为空') // 【tipToast】使用
            pageType == 'room' ? wx.setStorageSync('sltRoomMealName', '此包房餐次为空') : wx.setStorageSync('sltMealName', '餐次为空')
            pageType == 'room' ? wx.setStorageSync('sltRoomMealID', null) : wx.setStorageSync('sltMealID', null)
            that.setData({
              meallistDatas: null
            })
          } else {
            //设置进入页面被选中的样式  
            let sltId1
            switch (pageType) {
              case 'mealorder':
                sltId1 = 'sltMealID'
                break;
              case 'room'://TODO包房暂未测试
                sltId1 = 'sltRoomMealID'
                break;
            }
            for (let j in res) {
              if (res[j].id == wx.getStorageSync(sltId1)) {
                that.setData({ currentItem: j, currItemBg: j })
              }
            }

            that.setData({
              meallistDatas: res
            })
            pageType == 'room' ? wx.setStorageSync('sltRoomMealName', res[0].name) : wx.setStorageSync('sltMealName', res[0].name)
            pageType == 'room' ? wx.setStorageSync('sltRoomMealID', res[0].id) : wx.setStorageSync('sltMealID', res[0].id)
          }
        } else {
          that.toast.show(data.data.message)
        }
      }
    })
  },
  /**
    *@param type：“type=1”为订餐;“type=2”为报餐（报餐好像没用到）
    *@param pageType：为app.appData.showFilterType的值，表示从哪一页跳转到当前页
   */
  getMeallist: function (type, pageType) {
    wx.setNavigationBarTitle({ title: '选择餐次' })
    this.getMealData(type, pageType)
  },

  onLoad: function (options) {
    new tipToast(); // 【tipToast】创建实例
    /**
     *@param app.showFilter：决定filter页面显示canteen还是meal的数据
     *@param app.appData.showFilterType：从"订餐页"或"报餐页"或"包房页"进入filter页面
    */
    this.setData({
      fromPageType: app.appData.showFilterType//订餐/报餐/包房
    })

    console.log('app.showFilter')
    console.log(app.showFilter)
    if (app.showFilter == "canteen") {
      this.getCanteenlist(this.data.fromPageType);
      this.setData({
        slttype: true
      })

    }
    else { // else并不保险，因为app.showFilter可能是undefined（主要是在模拟器上出现，Android真机尚未发现，模拟器上在“订餐前设置页面”e.target.dataset.type有可能会undefined）

      this.getMeallist(1, this.data.fromPageType)
      this.setData({
        slttype: false
      })
    }
  },
  changeBindMeal: function (e) {//点选餐次
    let idx = e.target.dataset.index,
      mealName = e.target.dataset.name,
      mealID = e.target.dataset.id;
    this.setData({
      currentItem: idx,
      currItemBg: idx
    })

    // if (app.showFilter == "room") {
    if (this.data.fromPageType == "room") {
      wx.setStorageSync('sltRoomMealName', mealName)
      wx.setStorageSync('sltRoomMealID', mealID)
    }
    else {
      wx.setStorageSync('sltMealName', mealName)
      wx.setStorageSync('sltMealID', mealID)
    }

  },
  changeBindCanteen: function (e) {//还没判断是订餐还是报餐 餐厅点选餐次
    let idx = e.target.dataset.index,
      canteenName = e.target.dataset.name,
      canteenId = e.target.dataset.id,
      _type = e.target.dataset.type;

    this.setData({//curr样式
      currentItem: idx,
      currItemBg: idx
    })

    if (_type == 'dinner') {//报餐
      wx.setStorageSync('sltDinnerCanteenName', canteenName)
      wx.setStorageSync('sltDinnerCanteenId', canteenId)
    }
    else if (_type == 'room') {//包房！！包房是否需要处理
      wx.setStorageSync('sltRoomCanteenName', canteenName)
      wx.setStorageSync('sltRoomCanteenId', canteenId)
      this.getDateList('room')

    } else {
      wx.setStorageSync('sltCanteenName', canteenName)
      wx.setStorageSync('sltCanteenId', canteenId)
      this.getDateList('mealorder')
    }

  },

})