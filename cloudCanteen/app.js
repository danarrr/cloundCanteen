//app.js

var a_l, a_d = {}, a_cbSucc, a_cbSuccFail, a_cbFail, a_cbCom, a_h, a_m;

App({
  // baseUrl: 'http://swtsrv01.swt1993.com/api_web247/',
  // baseUrl: 'http://swtsrvs01.swt1993.com/cloud_canteen_api_web/',
  baseUrl: 'http://192.168.4.246:9090/cloud_canteen_api_web/',
  // baseUrl: 'http://192.168.4.247:9090/cloud_canteen_api_web/',
  // baseUrl: 'https://swtsrv01.swt1993.com:10443/cloud_canteen_api_web/',
  //  baseUrl: 'http://192.168.4.25:8080/cloud_canteen_api_web/',
  // baseUrl: 'http://192.168.4.88:9090/cloud_canteen_api_web/',
  // baseUrl: 'http://192.168.4.61:8088/cloud_canteen_api_web/',
  // baseUrl:'http://192.168.4.247:9090/cloud_canteen_api_web',
  // baseUrl: 'http://tech.swt1993.com/SWTSRV11/cloud_canteen_api_web/',
  // baseUrl: 'https://user.swt1993.com/cloud_canteen_api_web/',

  getIP: function () {
    let x = this.baseUrl.indexOf('/');
    for (let i = 0; i < 2; i++) {
      x = this.baseUrl.indexOf('/', x + 1);
    }
    return this.baseUrl.slice(0, x + 1)
  },

  appid: "k5elcaha2v5o",
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

  },
  //修改tabBar的active值
  editTabBar: function () {

    var _curPageArr = getCurrentPages();
    var _curPage = _curPageArr[_curPageArr.length - 1];
    var _pagePath = _curPage.__route__;
    if (_pagePath.indexOf('/') != 0) {
      _pagePath = '/' + _pagePath;
    }
    var tabBar = this.globalData.tabBar;

    // console.log("-----------------app--------------------------")
    // console.log(this.permission.canteenPermission.isApply)//是否报餐.0否 1启用 
    // console.log(this.permission.canteenPermission.isOrder)//是否订餐
    // console.log(this.permission.canteenPermission.isRoomBook)//是否包房

    //-----------------通过权限控制显示哪些模块-------------------------
    let permission = this.permission.canteenPermission
    tabBar.list[0].permission = permission.isOrder//是否显示订餐模块
    tabBar.list[1].permission = permission.isApply//是否显示报餐模块
    tabBar.list[2].permission = permission.isRoomBook//是否显示包房模块



    for (var i = 0; i < tabBar.list.length; i++) {
      tabBar.list[i].active = false;
      // if (tabBar.list[i].pagePath =="../.."+ _pagePath) {
      if (tabBar.list[i].pagePath == _pagePath) {
        tabBar.list[i].active = true;//根据页面地址设置当前页面状态
      }
    }

    _curPage.setData({
      tabBar: tabBar
    });
  },





  getUserInfo: function (cb) {
    var that = this

    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)

            }
          })
        }
      })
    }
  },
  cartData: {
    cartNum: 0,
    cartMoney: 0,
  },
  appData: {
    // cartMoney: 0,
    userInfo: null,
    uid: null,
    token: null,
  },
  // textareaData:{},
  globalData: {
    userInfo: null,
    //配置tabBar
    tabBar: {
      "color": "#9E9E9E",
      "selectedColor": "#15c35a",
      "backgroundColor": "#fff",
      "borderStyle": "#ccc",
      "list": [
        {
          "pagePath": "/pages/mealorder/index/index",
          "text": "订餐",
          "iconPath": "/image/index/icon-order.png",
          "selectedIconPath": "/image/index/icon-orderslt.png",
          "selectedColor": "#15c35a",
          active: false,
          permission: 0
        },
        {
          "pagePath": "/pages/reportDinner/index/index",
          "text": "报餐",
          "iconPath": "/image/index/icon-meal.png",
          "selectedIconPath": "/image/index/icon-mealslt.png",
          "selectedColor": "#15c35a",
          active: false,
          permission: 0
        },
        {
          "pagePath": "/pages/room/room/index",
          "text": "包房",
          "iconPath": "/image/index/icon-room.png",
          "selectedIconPath": "/image/index/icon-roomslt.png",
          "selectedColor": "#15c35a",
          active: false,
          permission: 0
        },
        {
          "pagePath": "/pages/user/index/index",
          "text": "我的",
          "iconPath": "/image/index/icon-mine.png",
          "selectedIconPath": "/image/index/icon-mineslt.png",
          "selectedColor": "#15c35a",
          active: false,
          permission: 1
        }
      ],
      "position": "bottom"
    }

  }
})