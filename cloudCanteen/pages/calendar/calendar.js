var app = getApp();
import { tipToast } from '../../component/tipToast/class/tipToast.js'; // 【tipToast】
let http = require('../../component/http/http.js');
Page({
  toViewIndex: 0, //记录 所选中的区域位置 出现在可视区
  data: {
    previousCount: 0, // 向前n个月
    laterCount: 12, // 向后n个月
    months: [], // 日期标题
    dates: [], // 日期数据，每个元素为一个月的数据
    selectableDate: [],// 可选日期。例如[{"pNo":null,"name":"2017-06-23(星期五)","id":"2017-06-23"},{"pNo":null,"name":"2017-06-24(星期六)", "id": "2017-06-24"}]
    selectedDate: null, // 被选择了的日期
    minUrl: null,
  },
  getMealData: function (type) {//获取餐次函数
    let that = this;
    let sltCanteenId = wx.getStorageSync('sltCanteenId'), // 获取餐次列表
      sltDateId = wx.getStorageSync('sltDateId') //获取时间
    let sltRoomCanteenId = wx.getStorageSync('sltRoomCanteenId'), //包房预定  获取餐次列表
      sltRoomDateId = wx.getStorageSync('sltRoomDateId') //包房预定 获取时间
    http.request({
      url: 'swtapi/backstage/selectTradesList.int',
      param: {
        id: that.data.optionsType == 'mealorder' ? sltCanteenId : sltRoomCanteenId,
        sDate: that.data.optionsType == 'mealorder' ? sltDateId : sltRoomDateId,
        type: type,

      },
      method: 'GET',
      success: function (data) {
        if (data.data.success) {
          // console.log("————————————————————————————————————进来了")
          let res = data.data.data;
          if (res == '' || !res) {
            // console.log("_______________数据为空")
            that.toast.show('该餐厅餐次为空') // 【tipToast】使用
            wx.setStorageSync(that.data.optionsType == 'mealorder' ? 'sltMealName' : 'sltRoomMealName', '餐次为空')
            wx.setStorageSync(that.data.optionsType == 'mealorder' ? 'sltMealID' : 'sltRoomMealID', null)
            that.setData({
              meallistDatas: null
            })
          } else {
            // console.log("————————————————————————————————————有数据")
            that.setData({
              meallistDatas: res
            })
            wx.setStorageSync(that.data.optionsType == 'mealorder' ? 'sltMealName' : 'sltRoomMealName', res[0].name)
            wx.setStorageSync(that.data.optionsType == 'mealorder' ? 'sltMealID' : 'sltRoomMealID', res[0].id)
          }
          wx.navigateBack({})//调用函数成功再跳转
        } else {
          that.toast.show(data.data.message)
        }
      }
    })
  },
  onLoad: function (options) {
    new tipToast(); // 【tipToast】
    let sltCanteenId = wx.getStorageSync('sltCanteenId')//选中的餐厅名称
    let sltRoomCanteenId = wx.getStorageSync('sltRoomCanteenId')//包房预定 选中的餐厅名称
    let that = this
    if (options.type == 'mealorder') {
      this.setData({ minUrl: 'swtapi/backstage/getWorkDayList.int' })
    } else if (options.type == 'room') {
      this.setData({ minUrl: 'swtapi/user/room/canteen_work_list' })
    } else {
      // console.log('去日历页的地址加个type，值为mealorder或者room，表示从订餐或者包房进入')
      return;
    }

    // 请求接口获取可选日期
    http.request({
      url: that.data.minUrl,
      param: {
        canteenId: options.type == 'mealorder' ? sltCanteenId : sltRoomCanteenId,
        listNum: 7
      },
      method: 'GET',
      success: function (res) {
        let selectableDate = []
        let data = res.data.data
        for (let item of data) {
          selectableDate.push(item)
        }

        // 例如获取到这样的数据并设置
        that.setData({ selectableDate })
        that.transtaleDate()
        // 设置完数据后创建日历
        that.createCalendar();

      }
    })
    this.setData({ optionsType: options.type })

  },

  /**
   * 创建日历
   */
  createCalendar: function () {
    this.transtaleDate();
    let _this = this,
      _today = new Date(),
      _dates = [],
      _months = []

    // 创建count个月的数据
    for (let i = 0; i < _this.data.previousCount + _this.data.laterCount; i++ , _this.toViewIndex++) {
      let _newDate = new Date(_today.getFullYear(), _today.getMonth() + i - _this.data.previousCount, 1)
      _months.push(_newDate.getFullYear() + '年' + (_newDate.getMonth() + 1) + '月') // 标题
      _dates.push(_this.createDate(_newDate))
    }
    _this.setData({
      dates: _dates,
      months: _months
    })
  },

  /**
   * 可选日期转换
   */
  transtaleDate: function () {
    let _selectableDate = [];
    for (let i = 0; i < this.data.selectableDate.length; i++) {
      // 例如2017-06-22 转为 2017/6/22
      let date = new Date(Date.parse(this.data.selectableDate[i].id.replace(/-/g, "/")));
      let _id = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join("/");

      _selectableDate.push({
        pNo: this.data.selectableDate[i].pNo,
        name: this.data.selectableDate[i].name,
        id: this.data.selectableDate[i].id,
        _id: _id
      });

    }
    this.setData({ selectableDate: _selectableDate })
  },

  // 某一天被点击选择
  selectDay: function (e) {
    let value = e.target.dataset.day; // 被选择的那天的实际日期。例如 2017/6/27
    let selectable = e.target.dataset.selectable;
    let monthPos = e.target.dataset.monthpos;
    let dayPos = e.target.dataset.daypos;


    if (!value) {  // 那个位置没有日期（1号前面的位置）
      return
    }
    if (!selectable) {
      this.toast.show('该日期不可选') // ========================================================================不可选，这里应该加提示
      return
    }

    //设置点击样式
    this.setData({
      curNav: value
    })

    // 缓存
    let info = e.target.dataset.info;
    let _selectedDate = {
      pNo: info.pNo,
      name: info.name,
      id: info.id,
      _id: info.id
    }
    this.setData({
      selectedDate: _selectedDate
    })


  },

  // 确认日期
  confirmDate: function (e) {

    if (this.data.selectedDate == null) {
      // console.log('未选择日期，这里应该加提示')  // ========================================================================未选择日期，这里应该加提示
      this.toast.show('未选择日期')

      return
    }

    // 永久存
    let that = this;
    if (this.data.optionsType == 'mealorder') {
      wx.setStorageSync('sltDateName', that.data.selectedDate.name)
      wx.setStorageSync('sltDateId', that.data.selectedDate.id)
    } else if (this.data.optionsType == 'room') {
      wx.setStorageSync('sltRoomDateName', that.data.selectedDate.name)
      wx.setStorageSync('sltRoomDateId', that.data.selectedDate.id)
    }

    // wx.setStorageSync('selectedDate', {
    //   pNo: that.data.selectedDate.pNo,
    //   name: that.data.selectedDate.name,
    //   id: that.data.selectedDate.id,
    // })

    that.getMealData(1)//调用餐次列表函数


  },

  /**
   * 通过提供的Date创建日历的日期数据
   */
  createDate: function (date) {
    let returnValue = [];
    let beginDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay(); // 1号前有多少空格
    let nDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(); // 某个月的天数

    let today = new Date();
    let todayStr = [today.getFullYear(), today.getMonth() + 1, today.getDate()].join("/")

    let pushObj = {
      day: "", // 完整日期
      showDay: "", // 显示在界面上的文字
      isToday: false, // 是否今天
      status: 'default', // 状态，有：default默认、selectable可选、today今天、selected已选
      selectable: false,// 是否可选
      info: {}, // 日期其他信息，主要是记录接口获取到的日期的信息
    };
    let len = nDays + beginDay; // 1号之前的空格+本月天数
    for (let i = 1; i <= len; i++) {
      var tempDate = new Date(date.getFullYear(), date.getMonth(), (i - beginDay));
      var tempDateStr = [tempDate.getFullYear(), tempDate.getMonth() + 1, tempDate.getDate()].join("/"); // 会有1号前空格的虚日期。例如 2017年2月前的3个格为1月29、30、31
      let _info = {}; // 某一天的信息

      if (i > beginDay) { // 过滤掉虚日期
        let _isToday = (todayStr == tempDateStr);
        let showDay = _isToday ? '今天' : new Date(tempDateStr).getDate();
        let _selectable = false;

        // 日期状态
        let _status = 'default';
        for (let i = 0; i < this.data.selectableDate.length; i++) {
          if (this.data.selectableDate[i]._id == tempDateStr) {
            _status = 'selectable';
            _selectable = true;
            _info = {
              pNo: this.data.selectableDate[i].pNo,
              name: this.data.selectableDate[i].name,
              id: this.data.selectableDate[i].id,
              _id: this.data.selectableDate[i]._id
            }
          }
        }
        if (_isToday) {
          _status = 'today'
        }

        pushObj = {
          day: tempDateStr,
          showDay: showDay,
          isToday: _isToday,
          status: _status,
          selectable: _selectable,
          info: _info,
        };

      }
      returnValue.push(pushObj);
    }
    return returnValue;
  },

});