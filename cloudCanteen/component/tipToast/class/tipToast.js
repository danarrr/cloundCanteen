class tipToast {

  constructor() {
    this.timeout = {};
    this.animation = {};
    let pages = getCurrentPages(); // 用于获取当前页面栈的实例，以数组形式按栈的顺序给出，第一个元素为首页，最后一个元素为当前页面
    let curPage = pages[pages.length - 1];
    curPage.toast = this;
    this.curPage = curPage

  }

/**
 * 显示toast。例如 this.toast.show('账号或密码不能为空')
 */
  show(text) {
    let that = this;

    this.curPage.setData({ tipToastText: text });

    // 动画
    this.animation = wx.createAnimation({
      duration: 500 
    });
    this.animation.opacity(1).step();
    this.curPage.setData({
      tipToastAnimationData: that.animation.export()
    });

    clearTimeout(this.timeout);

    this.timeout = setTimeout(function () {
      that.animation.opacity(0).step();
      that.curPage.setData({
        tipToastAnimationData: that.animation.export()
      })
    }, 1500);

  }

}

export { tipToast }