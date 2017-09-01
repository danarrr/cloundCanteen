// pages/reportDinner/index/index.js
// 报餐页面
import { tipToast } from '../../../component/tipToast/class/tipToast.js'; // 【tipToast】引入tipToast类
let app = getApp()
const reg = "\\((.+?)\\)";//取括号里内容
let arrayList = []
let http = require('../../../component/http/http.js');
Page({
  unique: function (array) {//数组去重函数
    var n = [];
    for (var i = 0; i < array.length; i++) {
      if (n.indexOf(array[i]) == -1) n.push(array[i]);
    }
    return n;
  },
  showFilter: function (e) {//设置从“报餐”页进入filter页
    app.showFilter = e.target.dataset.type
    app.appData.showFilterType = 'dinner'
  },
  onLoad: function (options) {
    let isChangeReport = wx.getStorageSync('isChangeReport'); // 修改报餐
    this.setData({ isChangeReport: isChangeReport })

    app.editTabBar();//添加tabBar数据
    new tipToast(); // tipToast

    let that = this

    if (isChangeReport) { // 修改报餐
      console.log("修改报餐")
      this.custReportList()//调用接口，显示报餐数据
    } else {
      console.log("报餐")
      wx.showLoading({
        title: '加载中',
      })

      http.request({
        url: 'swtapi/user/cust/canteen_list',//首次进入页面默认选中第一个餐厅
        method: 'GET',
        param: { uId: app.appData.uid },
        success: function (data) {
          wx.hideLoading()
          if (data.data.success) {
            let res = data.data.data;
            wx.setStorageSync('sltDinnerCanteenName', res[0].name)
            wx.setStorageSync('sltDinnerCanteenId', res[0].id)

            that.custReportList()//调用接口，显示报餐数据
          }
        }
      })
    }

  },

  onUnload: function () { // 当redirectTo或navigateBack的时候调用
    wx.setStorageSync('isChangeReport', false) // 不是修改报餐
  },

  onShow: function () {
    // this.custReportList()//调用接口，显示报餐数据----------------------------------------------------【目测可删】

  },
  custReportList: function () {//报餐数据

    let sltDinnerCanteenName = wx.getStorageSync('sltDinnerCanteenName'),
      sltDinnerCanteenId = wx.getStorageSync('sltDinnerCanteenId')

    let that = this
    that.setData({
      sltDinnerCanteenName: sltDinnerCanteenName,//设置左上角食堂信息
      // sltDinnerCanteenId: sltDinnerCanteenId
    })
    http.request({
      url: 'swtapi/user/cust_report/report_trade_list',
      method: 'GET',
      param: {
        canteenId: sltDinnerCanteenId,
        workDayNumbs: 7
      },
      success: data => {
        let trade = [],
          newDataList = {},
          date = [],
          dateDate = []
        if (data.data.success) {
          let res = data.data.data
          for (let i in res.personalReportVoList) {
            let tradeName = res.personalReportVoList[i].tradeName,
              reportDateName = res.personalReportVoList[i].reportDateName

            trade.push(tradeName)
            date.push(reportDateName)
            newDataList[tradeName] = !newDataList[tradeName] ? [] : newDataList[tradeName]
            newDataList[tradeName].push(res.personalReportVoList[i])
          }
          let _trade = this.unique(trade),
            _date = this.unique(date)
          for (let x in _date) {
            dateDate.push({
              date: _date[x].split(/\(.*?\)/)[0],
              week: _date[x].match(reg)[1]
            })
          }

          this.setData({
            newDataList: newDataList,
            trade: _trade,
            date: dateDate,
            width: _trade.length < 4 ? parseFloat(100 / _trade.length) + "%" : '',//通过个数设置宽度
            totalWidth: _trade.length < 4 ? '100%' : parseFloat(139 * _trade.length) + 'rpx'
          })
        } else {
          that.toast.show(data.data.message)
          this.setData({
            newDataList: '',
            trade: '',
            date: '',
            totalWidth: '100%'
            // width: _trade.length*//通过个数设置宽度

          })
        }
      }
    })

  },
  arrayListPush: function (itemData) {//确认取消报餐或报餐的数组数据列表
    /*----------------先把整合全部为status为1和3的数据列表，再通过点击进行改动------------------- */
    // arrayList.push({
    //   "canteenId": wx.getStorageSync("sltDinnerCanteenId"), //食堂ID
    //   "reportDate": itemData.reportDateId, //报餐日期
    //   "tradeId": itemData.tradeId, //餐次日期
    //   "tradeName": itemData.tradeName, //餐次名称
    //   "startTime": itemData.beginTime.replace(/:/g, ''), //餐次开始时间hhmm
    //   "endTime": itemData.endTime.replace(/:/g, ''), //餐次结束时间hhmm
    //   "status": itemData.status == 0 ? 1 : 0//0报餐，1取消报餐
    //   // "status": itemData.status
    // })
    /*----------------先把整合全部为status为1和3的数据列表，再通过点击进行改动------------------- */
    console.log("--------------------------------arrayList----------------------------")
    console.log(arrayList)
    for (let i in arrayList) {
      if (itemData.tradeId == arrayList[i].tradeId && itemData.reportDateId == arrayList[i].reportDate) {
        arrayList[i].status = arrayList[i].status == 0 ? 1 : 0;
        return false
      }
    }
    console.log("---------------------------- itemData.status --------------------------------")
    console.log(itemData.status)
    arrayList.push({
      "canteenId": wx.getStorageSync("sltDinnerCanteenId"), //食堂ID
      "reportDate": itemData.reportDateId, //报餐日期
      "tradeId": itemData.tradeId, //餐次日期
      "tradeName": itemData.tradeName, //餐次名称
      "startTime": itemData.beginTime.replace(/:/g, ''), //餐次开始时间hhmm
      "endTime": itemData.endTime.replace(/:/g, ''), //餐次结束时间hhmm
      "status": itemData.status == 0 ? 0 : 1//0报餐，1取消报餐
    })

  },
  clickCurr: function (e) {//点击选中样式以及数据传输
    let itemData = e.currentTarget.dataset.itemdata,
      trade = e.currentTarget.dataset.parent

    this.arrayListPush(itemData)

    for (let j in this.data.newDataList[trade]) {
      let idx = this.data.newDataList[trade][j]
      //改变样式this.data.newDataList的status
      if (itemData.tradeId == idx.tradeId && itemData.reportDateId == idx.reportDateId) {
        idx.status = idx.status == 3 ? 0 : 3
      }
    }

    this.setData({ newDataList: this.data.newDataList })
    /*----------------先把整合全部为status为1和3的数据列表，再通过点击进行改动------------------- */

    // console.log(arrayList)
    // if (arrayList.length == 0) {//初始化数组arrayList，只显示可报餐和已报餐
    //   for (let j in this.data.newDataList) {
    //     for (let i in this.data.newDataList[j]) {
    //       let idx = this.data.newDataList[j][i]
    //       if (idx.status == 0 || idx.status == 3) {
    //         this.arrayListPush(idx)
    //       }
    //     }

    //   }
    // }
    // for (let j in this.data.newDataList[trade]) {
    //   let idx = this.data.newDataList[trade][j]
    //   //改变样式this.data.newDataList的status
    //   if (itemData.tradeId == idx.tradeId && itemData.reportDateId == idx.reportDateId) {
    //     idx.status = idx.status == 3 ? 0 : 3
    //   }
    // }


    // for (let j in arrayList) {
    //   // console.log("itemData.status:" + itemData.status)
    //   // console.log("arrayList[j].status:" + arrayList[j].status)
    //   //改变样式数组数据arrayList的status
    //   if (arrayList[j].tradeId == itemData.tradeId && arrayList[j].reportDate == itemData.reportDateId) {
    //     console.log(arrayList[j])
    //     console.log(itemData)

    //     arrayList[j].status = itemData.status == 0 ? 0: 1//0报餐，1取消报餐

    //   }
    // }

    // this.setData({ newDataList: this.data.newDataList })
    /*----------------先把整合全部为status为1和3的数据列表，再通过点击进行改动------------------- */
  },
  sltAll: function () {//全选按钮
    arrayList = []
    //初始化数组arrayList，只显示可报餐和已报餐
    for (let j in this.data.newDataList) {
      for (let i in this.data.newDataList[j]) {
        let idx = this.data.newDataList[j][i]
        if (idx.status == 0 || idx.status == 3) {
          idx.status = idx.status == 0 ? 3 : idx.status //改变样式this.data.newDataList的status
          // this.arrayListPush(idx)
          if (idx.status == 3) {
            arrayList.push({
              "canteenId": wx.getStorageSync("sltDinnerCanteenId"), //食堂ID
              "reportDate": idx.reportDateId, //报餐日期
              "tradeId": idx.tradeId, //餐次日期
              "tradeName": idx.tradeName, //餐次名称
              "startTime": idx.beginTime.replace(/:/g, ''), //餐次开始时间hhmm
              "endTime": idx.endTime.replace(/:/g, ''), //餐次结束时间hhmm
              "status": 0 //0报餐，1取消报餐
            })
          }
        }
      }
    }
    console.log("------------------------arrayList--------------------------------")
    console.log(arrayList)
    this.setData({ newDataList: this.data.newDataList })

    /*----------------先把整合全部为status为1和3的数据列表，再通过点击进行改动------------------- */
    // for (let j in this.data.newDataList) {
    //   for (let i in this.data.newDataList[j]) {
    //     let idx = this.data.newDataList[j][i]
    //     if (idx.status == 0) {
    //       // 0：未选中，可选
    //       // 1：已过期或未开启报餐，不可选
    //       // 2：已团体报餐，不可选  
    //       // 3：已选，可取消
    //       idx.status = 3
    //       this.arrayListPush(idx)
    //     }

    //   }

    // }
    // this.setData({ newDataList: this.data.newDataList })
    /*----------------先把整合全部为status为1和3的数据列表，再通过点击进行改动------------------- */
  },
  confirmCreatDinner: function () {//确认报餐按钮

    let _this = this;
    http.request({
      url: 'swtapi/user/cust_report/pre_create_report_order',
      method: "POST",
      param: {
        arrayList: JSON.stringify(arrayList)
      },
      success: data => {
        let isChangeReport = _this.data.isChangeReport; // 是否修改报餐
        if (data.data.success) {
          // wx.showModal({
          //   content: 报餐成功,
          //   showCancel: false,
          // })

          wx.showModal({
            content: (!isChangeReport ? '报餐成功' : '修改成功'),
            showCancel: false,
            success: function (res) {
              if (res.confirm && isChangeReport) {
                wx.navigateBack({})
              }
            }
          })

          arrayList = []//报餐成功则重置
        } else if (!data.data.success && data.data.code == "2022") {
          _this.toast.show(data.data.message) // 【tipToast】
        }
        else if (!data.data.success && data.data.code == "2024") {
          wx.showModal({
            content: data.data.message,
            success: function (res) {
              if (res.confirm) {
                _this.confirmCreatDinner()//有罚款时重新请求
              }
            }
          })

        }
        this.onShow()
      }
    })
  },

  clickCancelButton: function () {
    wx.navigateBack({})
  }

})