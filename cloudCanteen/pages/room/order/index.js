var app = getApp()
let http = require('../../../component/http/http.js');
Page({
  onLoad: function (options) {
    let roomlist={
      id: options.id,
      name: options.name,
      numMax: options.numMax,
      numMin: options.numMin,
      typeName: options.typeName
    }
    this.setData({
      roomlist: {
        id: options.id,
        name: options.name,
        numMax: options.numMax,
        numMin: options.numMin,
        typeName: options.typeName
      }

    })
    let sltCanteenName = wx.getStorageSync('sltCanteenName'),
      sltCanteenId = wx.getStorageSync('sltCanteenId'),
      sltMealName = wx.getStorageSync('sltRoomMealName'),
      sltMealID = wx.getStorageSync('sltRoomMealID'),
      sltDateId = wx.getStorageSync('sltDateId'),
      date = wx.getStorageSync('sltDateName')

    //console.log(date)
    this.setData({
      canteenListTit: sltCanteenName,
      mealListTit: sltMealName,
      mealListId:sltMealID,
      date: date,
      dateId:sltDateId,
    })
    this.setData({
      reserveName: app.appData.userInfo.name,
      phone:app.appData.userInfo.phone,
      userId: app.appData.userInfo.id,
    })
    
  },


  onShow: function () {
   
   
  },
  bindNameInput: function (e) {
    this.setData({
      reserveName: e.detail.value
    })
  },
  bindNumInput: function (e) {
    this.setData({
      numPeople: e.detail.value
    })
  },
  bindPhoneInput: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },
  goorder: function () {
    let that = this
    http.request({
      url:  'swtapi/backstage/insertRoomReserve.int',
      method: "POST",
      param: { "id": that.data.roomlist.id, "tradeId": that.data.mealListId, "userId": that.data.userId, 'phone': that.data.phone, 'reserveName': that.data.reserveName, 'ordersDate': that.data.dateId, 'canteenName': that.data.canteenListTit, 'numPeople': parseInt(that.data.numPeople) , 'status': 1 },
     
      success: data => {
        if(data.data.success){
          wx.showToast({
            title: '包房预定成功',
            icon: 'success',
            duration: 1000,
            success:function(){
              setTimeout(function () { wx.navigateBack() }, 1000);
            }
          })
        }
        else{
          wx.showModal({
            title: '提示',
            content: data.data.message,
            showCancel:false,
            success: function () {
                 
            }
          })
        }
      }
    })
  },
  submit:function(){
    if (this.data.roomlist.numMax < this.data.numPeople) {
      let that=this
      wx.showModal({
        title: '提示',
        content: '预定实际人数与包房人数范围不符，是否继续？',
        success: function (res) {
          if (res.confirm) {
            that.goorder();
          } else if (res.cancel) {
            
          }
        }
      })
    }
    else {
      this.goorder();
    }
  },
  
  showFilter: function (e) {
    app.showFilter = e.currentTarget.dataset.type
    app.appData.showFilterType = 'room'
  },


})