
// 网站请求接口，统一为http
var app = getApp();
function request(req) {
  //发起网络请求
  wx.request({
    url: app.baseUrl+req.url,
    data: req.param,
    header: {
      "content-type": "application/x-www-form-urlencoded",
      "appid": "k5elcaha2v5o"
    },
    method: req.method,
    success: function (res) {
      req.success(res)
      // req.success(res.data)
    },
    fail: function (res) {
      wx.showToast({
        title: "服务器响应失败",
        icon: 'loading',
        duration: 2000
      })
    }
  })
}
// 导出模块
module.exports = {
  request: request
}