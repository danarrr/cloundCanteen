
// 我的订餐页面
import { tipToast } from '../../../component/tipToast/class/tipToast.js'; // 【tipToast】引入tipToast类
var http = require('../../../component/http/http.js');
var app = getApp();
Page({
  data: {
    titles: [ // 标题
      {
        "englishName": "willPay",
        "chineseName": "待支付"
      },
      {
        "englishName": "willSpend",
        "chineseName": "待消费"
      },
      {
        "englishName": "spened",
        "chineseName": "已消费"
      },
      {
        "englishName": "overdue",
        "chineseName": "已过期"
      }],
    selectedTitle: 0, // 被选中的标题的索引

    willPayData: {
      "nextPageNo": 1,
      "data": null // 集合
    },
    willSpendData: {
      "nextPageNo": 1,
      "data": null
    },
    spenedData: {
      "nextPageNo": 1,
      "data": null
    },
    overdueData: {
      "nextPageNo": 1,
      "data": null
    },
    indicatorWidth: 0, // 导航指示器长度
    indicatorMarginLeft: 0
  },

  onLoad: function (options) {

    new tipToast(); // 【tipToast】创建实例

    let myMealOrderPageIndex = options.index;
    this.setData({ selectedTitle: myMealOrderPageIndex })
  },

  // 标题点击监听
  bindSelectedTitle: function (e) {
    let that = this;
    this.setData({
      selectedTitle: e.currentTarget.id,
      indicatorMarginLeft: (that.data.indicatorWidth * e.currentTarget.id)
    });
  },

  // 页面切换监听
  bindPageChange: function (e) {
    let that = this;
    this.setData({
      selectedTitle: e.detail.current,
      indicatorMarginLeft: (that.data.indicatorWidth * e.detail.current)
    })
  },

  // 页面渲染完成
  onReady: function () {
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          swiperHeight: (res.windowHeight),
          indicatorWidth: (res.screenWidth / that.data.titles.length)
        });
      }
    });


  },

  onShow: function () {
    this.getListData(0, true); // 进入页面初次加载
    this.getListData(1, true);
    this.getListData(2, true)
    this.getListData(3, true)
  },

  // 下拉刷新（要在json文件中设置 "enablePullDownRefresh": true）
  // 坑1：scroll-view不支持下拉刷新，所以用view代替
  // 坑2：json的window必须设置"backgroundTextStyle": "dark",否则下拉刷新时3个点点不显示
  onPullDownRefresh: function (event) {
    console.log('下拉刷新');
    this.getListData(this.data.selectedTitle, true)
  },

  //页面触底监听
  onReachBottom: function (event) {
    console.log('加载更多');
    this.getListData(this.data.selectedTitle, false)
  },

  // 点击修改报餐
  toReportDinner: function (event) {
    let canteenId = event.currentTarget.dataset.canteenId;
    let canteenName = event.currentTarget.dataset.canteenName;
    console.log('canteenId->' + canteenId);
    console.log('canteenName->' + canteenName)

    // todo 跳转到报餐页面修改报餐，修改完回到这个页面，并刷新此页数据
  },

  /* *
   * 获取列表数据
   * @param type 页面索引
   * @param pullDownRefresh 是否下拉刷新数据，false表示加载更多
   */
  getListData: function (index, pullDownRefresh) {
    let that = this;
    let pageNo = -1;
    let dataType = null; // 0未就餐,1已就餐,2已过期
    let totalData = [];
    if (index == 0) {         // 获取待支付数据
      pageNo = that.data.willPayData.nextPageNo;
      dataType = 0;
    } else if (index == 1) {  // 获取待消费数据
      pageNo = that.data.willSpendData.nextPageNo;
      dataType = 1
    } else if (index == 2) {  // 获取已消费数据
      pageNo = that.data.spenedData.nextPageNo;
      dataType = 2
    } else if (index == 3) {  // 获取已过期数据
      pageNo = that.data.overdueData.nextPageNo;
      dataType = 3
    }

    if (pullDownRefresh) {    // 下拉刷新相当于又从第一页开始获取数据
      pageNo = 1
    }

    if (dataType == null || pageNo == -1/*超过总页数*/) {
      if (pullDownRefresh) {
        wx.stopPullDownRefresh();
        wx.hideNavigationBarLoading(); // 隐藏加载中提示
      }
      return;
    }

    console.log('地址->' + 'swtapi/user/center/orders_list' + '?uId=' + app.appData.uid + '&orderType=' + dataType + '&pageNo=' + pageNo + '&pageSize=20')
    wx.showNavigationBarLoading(); // 加载中的提示
    // 请求数据
    http.request({
      url: 'swtapi/user/center/orders_list' + '?uId=' + app.appData.uid + '&orderType=' + dataType + '&pageNo=' + pageNo + '&pageSize=20',
      method:'GET',
      success: function (res) {
        // console.log(res.data.data);
        wx.hideNavigationBarLoading(); // 隐藏加载中提示
        if (pullDownRefresh) {
          wx.stopPullDownRefresh();
        }

        if (res.statusCode == '200') {
          if (!res.data.success) {
            that.toast.show(res.data.message)
          } else {

            // 已经有的数据
            let currentData = [];

            if (dataType == 0) {          // 待支付
              currentData = that.data.willPayData.data;
            } else if (dataType == 1) {   // 待消费
              currentData = that.data.willSpendData.data;
            } else if (dataType == 2) {   // 已消费
              currentData = that.data.spenedData.data;
            } else if (dataType == 3) {   // 已过期
              currentData = that.data.overdueData.data;
            }

            // 整合数据
            if (pullDownRefresh || currentData == null || currentData.length == 0) {  // 下拉刷新或者没有数据
              for (let i = 0; i < res.data.data.results.length; i++) {
                // sDate是"2017-07-13(星期四)"，不符合显示要求，所以加个属性
                res.data.data.results[i].dateStr = res.data.data.results[i].week.slice(0, 10) + " "
                  + res.data.data.results[i].week.slice(11, 14) + " " + (res.data.data.results[i].tradeName)
                res.data.data.results[i].count = res.data.data.results[i].money.toFixed
              }
              totalData = res.data.data.results;
              // console.log(res.data.data)
            } else {                                                                  // 加载更多
              for (let i = 0; i < res.data.data.results.length; i++) {

                res.data.data.results[i].dateStr = res.data.data.results[i].week.slice(0, 10) + " "
                  + res.data.data.results[i].week.slice(11, 14) + " " + (res.data.data.results[i].tradeName)
              }

              totalData = currentData.concat(res.data.data.results);
            }

            // 如果是下拉刷新，先把nextPageNo重置为1
            if (pullDownRefresh) {
              if (dataType == 0) {        // 待支付
                that.setData({
                  willPayData: {
                    "nextPageNo": 1,
                    "data": that.data.willPayData.data
                  }
                })
              } else if (dataType == 1) { // 待消费
                that.setData({
                  willSpendData: {
                    "nextPageNo": 1,
                    "data": that.data.willSpendData.data
                  }
                })
              } else if (dataType == 1) { // 已消费
                that.setData({
                  spenedData: {
                    "nextPageNo": 1,
                    "data": that.data.spenedData.data
                  }
                })
              } else if (dataType == 1) { // 已过期
                that.setData({
                  overdueData: {
                    "nextPageNo": 1,
                    "data": that.data.overdueData.data
                  }
                })
              }
            }

            // setData
            if (dataType == 0) {        // 待支付

              that.setData({
                willPayData: {
                  "nextPageNo": (that.data.willPayData.nextPageNo + 1 <= res.data.data.totalPage && totalData.length > 0 ? that.data.willPayData.nextPageNo + 1 : -1/*超过总页数*/),
                  "data": totalData
                }
              })
            } else if (dataType == 1) { // 待消费
              that.setData({
                willSpendData: {
                  "nextPageNo": (that.data.willSpendData.nextPageNo + 1 <= res.data.data.totalPage && totalData.length > 0 ? that.data.willSpendData.nextPageNo + 1 : -1),
                  "data": totalData
                }
              })
            } else if (dataType == 2) { // 已消费
              that.setData({
                spenedData: {
                  "nextPageNo": (that.data.spenedData.nextPageNo + 1 <= res.data.data.totalPage && totalData.length > 0 ? that.data.spenedData.nextPageNo + 1 : -1),
                  "data": totalData
                }
              })
            }
            else if (dataType == 3) {   // 已过期
              that.setData({
                overdueData: {
                  "nextPageNo": (that.data.overdueData.nextPageNo + 1 <= res.data.data.totalPage && totalData.length > 0 ? that.data.overdueData.nextPageNo + 1 : -1),
                  "data": totalData
                }
              })
            }
          }
        } else {
          that.toast.show('接口错误')
        }

      },
      fail: function (res) {
        wx.hideNavigationBarLoading(); // 隐藏加载中提示
        that.toast.show('服务器连接不成功')
      }
    })
  },
  upper:function(){
    console.log("触发到顶部")
  }


});

