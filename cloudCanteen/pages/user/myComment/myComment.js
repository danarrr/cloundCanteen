// pages/user/myComment/myComment.js
// 我的评价页面
import { tipToast } from '../../../component/tipToast/class/tipToast.js'; // 【tipToast】引入tipToast类
var app = getApp();
var http = require('../../../component/http/http.js');
Page({
  data: {
    titles: [ // 标题
      {
        "englishName": "willEvaluate",
        "chineseName": "未评价"
      },
      {
        "englishName": "evaluated",
        "chineseName": "已评价"
      },
    ],
    selectedTitle: 0, // 被选中的标题的索引

    willEvaluateData: {
      "nextPageNo": 1,
      "data": null // 集合
    },
    evaluatedData: {
      "nextPageNo": 1,
      "data": null
    },

    indicatorWidth: 0, // 导航指示器长度
    indicatorMarginLeft: 0
  },

  onLoad: function (options) {
    new tipToast(); // 【tipToast】创建实例

    let index = options.index;
    this.setData({ selectedTitle: index })
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

  // 点击查看评价详情（去评价也是这个页面）
  toMyCommentDetail: function (event) {
    let consumeId = event.currentTarget.dataset.consumeId; // 消费单号
    let dataType = event.currentTarget.dataset.dataType;
    console.log('consumeId->' + consumeId);

    // todo 跳转到评价详情页面确认或提交评价后就回来，并刷新数据
    wx.navigateTo({
      url: '/pages/user/myComment/commentDetail/commentDetail?consumeId=' + consumeId + '&dataType=' + dataType,
    })
  },

  /* *
   * 获取列表数据
   * @param type 页面索引
   * @param pullDownRefresh 是否下拉刷新数据，false表示加载更多
   */
  getListData: function (index, pullDownRefresh) {
    let that = this;
    let pageNo = -1;
    let dataType = null; // 0未使用,1已使用
    let totalData = [];
    if (index == 0) {         // 获取未评价数据
      pageNo = that.data.willEvaluateData.nextPageNo;
      dataType = 0;
    } else if (index == 1) {  // 获取已评价数据
      pageNo = that.data.evaluatedData.nextPageNo;
      dataType = 1
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
    // dataType = 1
    wx.showNavigationBarLoading(); // 加载中的提示
    // 请求数据
    http.request({
      url:'swtapi/user/canteen_comments/get_basic_info',
      method: "POST",
      param: {
        userId: app.appData.uid,    // 用户id
        // yearMonth: null,            // 为查询已评价记录用，年月组合 YYYYMM。小程序不需要
        evaStatus: dataType,        // 评价状态：0未评价 1已评价
        pageSize: 20,               // 分页大小
        pageNo: pageNo,             // 分页号，从1开始
      },
      success: function (res) {
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
            if (dataType == 0) {          // 未使用
              currentData = that.data.willEvaluateData.data;
            } else if (dataType == 1) {   // 已使用
              currentData = that.data.evaluatedData.data;
            }

            // 整合数据
            if (pullDownRefresh || currentData == null || currentData.length == 0) {  // 下拉刷新或者没有数据
              for (let i = 0; i < res.data.data.results.length; i++) {
                // createTime是"2017-05-05 00:00:00"，不符合显示要求，所以加个属性
                res.data.data.results[i].dateStr = res.data.data.results[i].createTime.slice(0, 10) + ' ' + res.data.data.results[i].weekName + " "
                  + res.data.data.results[i].tradeName
              }
              totalData = res.data.data.results;
            } else {                                                                  // 加载更多
              for (let i = 0; i < res.data.data.results.length; i++) {
                res.data.data.results[i].dateStr = res.data.data.results[i].createTime.slice(0, 10) + ' ' + res.data.data.results[i].weekName + " "
                  + res.data.data.results[i].tradeName
              }
              totalData = currentData.concat(res.data.data.results);
            }

            // 如果是下拉刷新，先把nextPageNo重置为1
            if (pullDownRefresh) {
              if (dataType == 0) {        // 未评价
                that.setData({
                  willEvaluateData: {
                    "nextPageNo": 1,
                    "data": that.data.willEvaluateData.data
                  }
                })
              } else if (dataType == 1) { // 已评价
                that.setData({
                  evaluatedData: {
                    "nextPageNo": 1,
                    "data": that.data.evaluatedData.data
                  }
                })
              }
            }

            // setData
            if (dataType == 0) {        // 未评价
              that.setData({
                willEvaluateData: {
                  "nextPageNo": (that.data.willEvaluateData.nextPageNo + 1 <= res.data.data.totalPage && totalData.length > 0 ? that.data.willEvaluateData.nextPageNo + 1 : -1/*超过总页数*/),
                  "data": totalData
                }
              })
            } else if (dataType == 1) { // 已评价
              that.setData({
                evaluatedData: {
                  "nextPageNo": (that.data.evaluatedData.nextPageNo + 1 <= res.data.data.totalPage && totalData.length > 0 ? that.data.evaluatedData.nextPageNo + 1 : -1),
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
  }


});

