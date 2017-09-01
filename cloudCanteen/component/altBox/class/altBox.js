//--------------------------------------------------------------------------------------
// 调用方法：
// class负责数据处理和渲染
// page负责界面交互(确认取消按钮在page操作)

// wxml：
// <import src ="../../../component/altBox/altBox.wxml" />导入
// <template is="altBox" wx: if="{{altBoxShow}}" > </template>调用
// wxss：
// @import "/component/tipToast/tipToast.wxss"; 
// js:
// import { altBox } from '../../../component/altBox/class/altBox.js'; 导入
//new altBox();onLoad函数中创建实例
// this.alterbox.show(item);调用 

//--------------------------------------------------------------------------------------

class altBox {

  constructor() {
    let pages = getCurrentPages(); // 用于获取当前页面栈的实例，以数组形式按栈的顺序给出，第一个元素为首页，最后一个元素为当前页面
    let curPage = pages[pages.length - 1];
    // console.log(curPage)
    curPage.alterbox = this;
    this.curPage = curPage
  }


  show(item) {
    let that = this;
    this.curPage.setData({
      showAltBox: true,
      showOpaBg:true,
      altBoxData: {
        title: item.title,//标题
        text: item.text,//String 内容
        showPwd: !item.showPwd ? false : item.showPwd,//Booleans 显示密码框
        showBtnCancel: !item.showBtnCancel ? true : item.showBtnCancel,//Booleans 显示取消按钮
        showBtnConfirm: !item.showBtnConfirm ? true : item.showBtnConfirm,//Booleans 显示确认按钮
      },
    });
  }
  
  hide(){
    this.curPage.setData({
      showAltBox:false,
    })
  }

}

export { altBox }