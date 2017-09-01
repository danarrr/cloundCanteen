
// 网站请求接口，统一为http
var app = getApp();
function request(req) {
  //发起网络请求
  wx.request({
    url: app.baseUrl+req.url,
    data: req.param,
    header: {
      "content-type": "application/x-www-form-urlencoded",
      "appid": "k5elcaha2v5o",
      "token": app.appData.token
    },
    method: req.method,
    success: function (res) {
      
      req.success(res)
      if(res.data.code=='1004'){//token过期
        wx.showModal({
          title: '报错',
          content: res.data.message+',请重新登录!',
          showCancel:false,
          success: function (res) {
            if (res.confirm) {
              wx.reLaunch({ // 返回登录页
                url: '/pages/login/login',
              })
            }
          }
        })
       wx.hideLoading()
      }
    },
    fail: function (res) {
      wx.showModal({
        title:'报错',
        content: res.data.message,
        showCancel:false
      })
      wx.hideLoading()
    }
  })
}
// 导出模块
module.exports = {
  request: request
}