//我的包房
import { tipToast } from '../../../component/tipToast/class/tipToast.js'; // 【tipToast】引入tipToast类
var app = getApp();
Page({
  data: {
    titles: [ // 标题
      {
        "englishName": "will",
        "chineseName": "未使用"
      },  
      {
        "englishName": "over",
        "chineseName": "已使用"
      }],
    selectedTitle: 0, // 被选中的标题的索引

    willData: {
      "nextPageNo": 1,
      "data": null // 集合
    },
    overData: {
      "nextPageNo": 1,
      "data": null
    },
  //  indicatorWidth: 0, // 导航指示器长度
  //  indicatorMarginLeft: 0
  },

  onLoad: function (options) {
    new tipToast(); // 【tipToast】创建实例

    let myRoomPageIndex = options.index;
    this.setData({ selectedTitle: myRoomPageIndex })
  },
  onUnload:function (){
    wx.navigateTo({
      url:'../index/index'
    })  
  },

  // 标题点击监听
  bindSelectedTitle: function (e) {
    console.log(e);
    let that = this;
    this.setData({
      selectedTitle: e.currentTarget.id,
    });
  },

  // 页面切换监听
  bindPageChange: function (e) {
    let that = this;
    this.setData({
      selectedTitle: e.detail.current,
    })
  },

  // 页面渲染完成
  onReady: function () {
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          swiperHeight: (res.windowHeight),
        //  indicatorWidth: (res.screenWidth / that.data.titles.length)
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

  // 点击修改报餐
  toReportDinner: function (event) {
    let canteenId = event.currentTarget.dataset.canteenId;
    let canteenName = event.currentTarget.dataset.canteenName;
 //   console.log('canteenId->' + canteenId);
 //   console.log('canteenName->' + canteenName)

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
    let dataType = null; // 0未使用,1已使用
    let totalData = [];
    let url="";
    if (index == 0) {         // 获取未使用数据
      pageNo = that.data.willData.nextPageNo;
      dataType = 0;
      url = "swtapi/backstage/selectmycompartmentPage.int"
    } else if (index == 1) {  // 获取已使用数据
      pageNo = that.data.overData.nextPageNo;
      dataType = 1;
      url = "swtapi/backstage/selectuseredroomPage.int"
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

    wx.showNavigationBarLoading(); // 加载中的提示
    // 请求数据
    wx.request({
      url: app.baseUrl + url + '?userId=' + app.appData.uid + '&curpage=' + pageNo + '&pagesize=20',
      header: {
        'token': app.appData.token,
        "appid": app.appid
      },
      success: function (res) {
        console.log(res.data.data);

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
              currentData = that.data.willData.data;
            }else if (dataType == 1) {   // 已使用
              currentData = that.data.overData.data;
            }

            // 整合数据
            if (pullDownRefresh || currentData == null || currentData.length == 0) {  // 下拉刷新或者没有数据
              totalData = res.data.data.results;
            } else {                                                                  // 加载更多
              totalData = currentData.concat(res.data.data.results);
            }

            // 如果是下拉刷新，先把nextPageNo重置为1
            if (pullDownRefresh) {
              if (dataType == 0) {        // 未使用
                that.setData({
                  willData: {
                    "nextPageNo": 1,
                    "data": that.data.willData.data
                  }
                })
              } else if (dataType == 1) { // 已使用
                that.setData({
                  overData: {
                    "nextPageNo": 1,
                    "data": that.data.overData.data
                  }
                })
              }
            }

            // setData
            if (dataType == 0) {        // 未使用
              that.setData({
                willData: {
                  "nextPageNo": (that.data.willData.nextPageNo + 1 <= res.data.data.totalPage && totalData.length > 0 ? that.data.willData.nextPageNo + 1 : -1/*超过总页数*/),
                  "data": totalData
                }
              })
            } else if (dataType == 1) { // 已使用
              that.setData({
                overData: {
                  "nextPageNo": (that.data.overData.nextPageNo + 1 <= res.data.data.totalPage && totalData.length > 0 ? that.data.overData.nextPageNo + 1 : -1),
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

