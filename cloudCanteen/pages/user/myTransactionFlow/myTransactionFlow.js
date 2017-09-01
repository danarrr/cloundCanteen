// myTransactionFlow.js
//上拉加载中提示
import { tipToast } from '../../../component/tipToast/class/tipToast.js'; // 【tipToast】
var http = require('../../../component/http/http.js');
var app = getApp();
Page({
  data: {
    show_arr: [],//展示所有假数据
    show_arr2: [],
    picker_arr: [],//picker中range属性值
    picker_index: 0,//picker中value属性值
    id_arr: [],//存储id数组
    result: '全部',//form提交最终结果,
    result2: '全部',
    pageNo: 1,

  },

  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    new tipToast(); // 【tipToast】
    let that = this
    http.request({// 获取交易类型数据
      url: 'swtapi/user/center/card_flow_transType',
      method: 'GET',
      success: function (res) {
        wx.hideLoading()
        if (res.data.success) {
          var picker_arr = [],
            id_arr = [],
            show_arr2 = ["全部", "补贴账户", "充值账户", "透支账户"],//账户类型
            show_arr = res.data.data//交易类型
          show_arr.push({ transTypeName:"全部"})
          for (var i in show_arr) {
            picker_arr.push(show_arr[i].transTypeName);
            id_arr.push(show_arr[i].transTypeId);
          }
          that.setData({ show_arr: show_arr, picker_arr: picker_arr, id_arr: id_arr, show_arr2: show_arr2 });
        } else {
          that.toast.show(res.data.message)
        }
      },

    })
    this.cardFlowDataList(this.data.pageNo, true)
  },



  bindPickerChange: function (e) {//选项改变触发事件
    this.setData({
      picker_index: e.detail.value,
      transtypeIdx: this.data.id_arr[parseInt(e.detail.value)]
    })
    var result = this.data.picker_arr[parseInt(e.detail.value)];
    this.setData({ result: result });

    this.cardFlowDataList(1, true, this.data.accounttypeIdx, this.data.transtypeIdx)
  },
  bindPickerChange2: function (e) {//选项改变触发事件
    this.setData({
      picker_index: e.detail.value,
      accounttypeIdx: e.detail.value == 0 ? '' : e.detail.value,
    })
    var result2 = this.data.show_arr2[parseInt(e.detail.value)];
    console.log(result2)
    this.setData({ result2: result2 });

    this.cardFlowDataList(1, true, this.data.accounttypeIdx, this.data.transtypeIdx)
  },
  /* *
 * 获取列表数据
 * @param pageNo 页码
 * @param isInit 初始化 清空原始数据列表
 */

  cardFlowDataList: function (pageNo, isInit, accountType, transType) {//用户饭卡流水查询
    let that = this
    http.request({
      url: 'swtapi/user/center/card_flow',
      method: 'GET',
      param: {
        uId: app.appData.uid,
        accountType: !accountType ? '' : accountType,//账户类型
        transType: !transType ? '' : transType,//交易类型
        pageNo: pageNo,
        pageSize: 20,
      },
      success: function (res) {
        if (res.data.success) {
          let newCardFlowDatas
          if (!isInit) {
            let oleCardFlowDatas = that.data.cardFlowDatas
            newCardFlowDatas = oleCardFlowDatas.concat(res.data.data.results)
          }

          that.setData({
            cardFlowDatas: !isInit ? newCardFlowDatas : res.data.data.results,
            totalPage: res.data.data.totalPage
          })
          wx.hideNavigationBarLoading(); // 加载中的提示
        }
      },

    })

  },
  //触底监听
  onReachBottom: function () {
    if (this.data.pageNo == this.data.totalPage) return
    this.setData({
      pageNo: this.data.pageNo + 1
    })
    this.cardFlowDataList(this.data.pageNo, false, this.data.accounttypeIdx, this.data.transtypeIdx)
    wx.showNavigationBarLoading(); // 加载中的提示
  }
})