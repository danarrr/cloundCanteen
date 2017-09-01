// roomDetail.js
var app = getApp()
Page({
  onLoad: function (options) {
    let roomlist = {
      canteenName: options.canteenName,
      id: options.id,
      numPeople: options.numPeople,
      numRange: options.numRange,
      ordersDate: options.ordersDate,
      ordersDateDesc: options.ordersDateDesc,
      phone: options.phone,
      reserveName: options.reserveName,
      roomName: options.roomName,
      roomType: options.roomType,
      tradeId: options.tradeId,
      tradeName: options.tradeName,
      pagetype:options.type
    }
    this.setData({
      roomlist: {
        canteenName: options.canteenName,
        id: options.id,
        numPeople: options.numPeople,
        numRange: options.numRange,
        ordersDate: options.ordersDate,
        ordersDateDesc: options.ordersDateDesc,
        phone: options.phone,
        reserveName: options.reserveName,
        roomName: options.roomName,
        roomType: options.roomType,
        tradeId: options.tradeId,
        tradeName: options.tradeName,
        pagetype: options.type
      }

    })
    
    this.setData({
      reserveName: app.appData.userInfo.name,
      phone: app.appData.userInfo.phone,
      userId: app.appData.userInfo.id,
    })

  },

  cancelorder: function () {
    let that = this
    wx.request({
      url: app.baseUrl + 'swtapi/backstage/cancelRoom.int',
      method: "POST",
      data: { Id: that.data.roomlist.id, tradeId:that.data.roomlist.tradeId, ordersDate:that.data.roomlist.ordersDate, userId: app.appData.uid },
      header: {
        'content-type': "application/x-www-form-urlencoded",
        'token': app.appData.token
      },
      success: data => {
        if (data.data.success) {
          wx.showToast({
            title: '取消包房成功',
            icon: 'success',
            duration: 1000,
            success: function () {
              setTimeout(function () {
                wx.navigateTo({
                  url: '../index?index='+that.data.roomlist.pagetype
                }) }, 1000);
            }
          })
        }
        else {
          wx.showModal({
            title: '提示',
            content: data.data.message,
            showCancel: false,
            success: function () {

            }
          })
        }
      }
    })
  },
  submit: function () {
      let that = this
      wx.showModal({
        title: '提示',
        content: '是否确定取消预订？',
        success: function (res) {
          if (res.confirm) {
            that.cancelorder();
          } else if (res.cancel) {

          }
        }
      })
    
   
  },

  showFilter: function (e) {
    app.showFilter = e.currentTarget.dataset.type
    app.appData.showFilterType = 'room'
  },


})