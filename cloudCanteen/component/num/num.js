// pages/component/num.js
var app = getApp();

const __data__ = {
  goodnum: {},
  animationData: {},
  carts: [],
}

const __fn__ = {
  getFilterInfo() {//获取食堂  餐次  时间
    let canteenListTit = this.data.canteenListTit.canteenTit,
      mealListTit = this.data.mealListTit.mealName,
      mealId = this.data.mealListTit.mealId,
      dateTit = this.data.dateTit.date;
    let canteenName = canteenListTit.split(/\(.*?\)/)[0],
      date = dateTit,
      tradeName = mealListTit.split(/\(.*?\)/)[0]
    let allTit = canteenName + " " + date + " " + tradeName
    let cartListKey = [canteenListTit, dateTit, mealListTit, mealId, allTit].join(",");
    return cartListKey
  },


  /**addBtn时 将拿到的数据添加到购物车列表cartList*/
  // 
  sendToCartlist(goodid, goodPrice, goodParent, goodDish, num, goodName, q, cartTitinfo, discountPrice, deliveryornot, moneylimit, unit,showNum0) {

    let dishData = !this.data.goodListData ? app.goodListData : this.data.goodListData,//获取商品列表
      cartListKey = !cartTitinfo ? this.getFilterInfo() : cartTitinfo;
    let cartList = !app.cartList ? {} : app.cartList
    let curLeftItem = !this.data.curLeftItem ? this.data.srhList[q].parentObj : this.data.curLeftItem



    let cardTypeId = cartListKey.split(",")[3].substr(0, 8),
      tradeId = cartListKey.split(",")[3];




    let newCarList = () => {//如果不需要调用卡型接口  newCartlist函数里的参数可以去掉

      cartList[cartListKey].push({
        parent: curLeftItem,
        name: goodName,
        id: goodid,
        price: goodPrice,
        num: 1,
        dish: goodDish,
        delivery: goodid.substr(0, 10),//经营分组,
        deliveryornot: deliveryornot,//是否配送
        // discount: discount,//折扣
        discountPrice: discountPrice,//折后价
        moneylimit: moneylimit,//限额
        unit: unit,
        showNum0: showNum0
    

      })

      this.setData({ cartList: cartList })

    }


    if (!cartList[cartListKey]) {//当cartList无数据

      cartList[cartListKey] = []
      newCarList()
    } else {

      cartList[cartListKey] = cartList[cartListKey]
      let arr = [];
      for (let x in cartList[cartListKey]) {
        arr.push(cartList[cartListKey][x].id)
      }

      if (arr.indexOf(goodid) != -1) {//cartList已存在该商品
        for (let y in cartList[cartListKey]) {

          if (cartList[cartListKey][y].id == goodid) {
            cartList[cartListKey][y]['num'] += 1
            cartList[cartListKey][y]['showNum0'] = showNum0
            
            // cartList[cartListKey][y]['parent'] =  !goodParent ? this.data.curLeftItem : goodParent
            // cartList[cartListKey][y]['parent'] = !this.data.curLeftItem ? curLeftItem : this.data.curLeftItem
            // cartList[cartListKey][y]['parent'] = !this.data.curLeftItem ? goodParent : this.data.curLeftItem
            // console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
            // console.log(cartList[cartListKey][y].parent)
          }
        }
        this.setData({ cartList })
      } else {
        newCarList()
      }
    }
    app.cartList = cartList

    const reg = "\\((.+?)\\)";
    let cartListTit = []
    for (let index in app.cartList) {
      let _index = index.split(",");
      let _cartListTit = {
        canteenID: _index[0].match(reg)[1],
        tit: _index[4],
        info: index
      }
      cartListTit.push(_cartListTit)
    }
    this.setData({ cartListTit })
    app.cartListTit = cartListTit
  },
  addBtn(goodInfo) {

    let goodid = goodInfo.goodid,
      goodPrice = goodInfo.goodPrice,
      goodParent = goodInfo.goodParent,
      goodDish = goodInfo.goodDish,
      num = goodInfo.goodNum,
      goodName = goodInfo.goodName,
      cartTitinfo = goodInfo.cartTitinfo,
      discountPrice = parseFloat(goodInfo.discountPrice),
      deliveryornot = goodInfo.deliveryornot,
      moneylimit = goodInfo.moneylimit,
      unit = goodInfo.unit,
      showNum0 = goodInfo.showNum0;
    let dishData = !this.data.goodListData ? app.goodListData : this.data.goodListData;//获取商品列表
    let cartListKey = !cartTitinfo ? this.getFilterInfo() : cartTitinfo;


    if (this.data.curLeftItem) {
      // this.sendToCartlist(goodid, goodPrice, goodParent, goodDish, num, goodName, false, cartTitinfo, discount, deliveryornot, moneylimit,unit)//将dishData渲染到购物车
      this.sendToCartlist(goodid, goodPrice, goodParent, goodDish, num, goodName, false, cartTitinfo, discountPrice, deliveryornot, moneylimit, unit,showNum0)//将dishData渲染到购物车

      let cartList = app.cartList
      /**购买商品数量渲染到dishData--直接拿num的数量 */
      for (let j in dishData[this.data.curLeftItem]) {
        if (dishData[this.data.curLeftItem][j].id == goodid) {
          for (let y in cartList[cartListKey]) {
            if (cartList[cartListKey][y].id == goodid) {

              dishData[this.data.curLeftItem][j]['num'] = cartList[cartListKey][y].num
              // console.log(dishData[this.data.curLeftItem][j]['num'])
              this.setData({ navRightItems: dishData[this.data.curLeftItem] })
              // console.log(this.data.navRightItems)
            }
          }
        }
      }
    } else {

      /**购买商品数量渲染到srhList 搜索页面*/
      for (let q in this.data.srhList) {
        if (this.data.srhList[q].id == goodid) {
          let _num = !num ? 0 : num
          this.data.srhList[q]['num'] = _num + 1
          // this.sendToCartlist(goodid, goodPrice, goodParent, goodDish, num, goodName, q, cartTitinfo, discount, deliveryornot, moneylimit,unit)//将srhList渲染到购物车 
          this.sendToCartlist(goodid, goodPrice, goodParent, goodDish, num, goodName, q, cartTitinfo, discountPrice, deliveryornot, moneylimit, unit)//将srhList渲染到购物车 
        }
      }
      this.setData({ srhList: this.data.srhList })

    }

    // app.appData.cartMoney += goodPrice / app.discount//总价
    app.cartData.cartNum = app.cartData.cartNum + 1
    // app.cartData.cartMoney += goodPrice / discount//总价

    app.cartData.cartMoney += discountPrice//总价

    this.setData({ cartListKey, })
    // this.setData({ cartMoney: (app.appData.cartMoney).toFixed(2) })
    this.setData({ cartMoney: (app.cartData.cartMoney).toFixed(2), cartNum: app.cartData.cartNum })

  },
  /**reduceBtn时 将拿到的数据添加到购物车列表cartList*/
  _sendToCartlist(goodid, cartTitinfo, showNum0) {
    let cartList = app.cartList,
      cartListKey = !cartTitinfo ? this.getFilterInfo() : cartTitinfo;
    let cartListCartListKeyLenth = 0;

    for (let y in cartList[cartListKey]) {
      if (cartList[cartListKey][y].id == goodid) {
        cartList[cartListKey][y]['num'] -= 1
        cartList[cartListKey][y]['showNum0'] = showNum0
      }
      cartListCartListKeyLenth += cartList[cartListKey][y].num
    }


    if (cartListCartListKeyLenth == 0 && showNum0=='hidenum') {//該該訂餐所有菜品num為0去除cartListTit相關的標題
      let cartListTit = [];
      for (let z in app.cartListTit) {
        if (app.cartListTit[z].tit != cartListKey.split(",")[4]) {
          cartListTit.push(app.cartListTit[z])
        }
      }
      app.cartListTit = cartListTit
      this.setData({ cartListTit: cartListTit })
    }


    this.setData({ cartList: cartList })
    app.cartList = cartList

    // let cartListTit = []//!!!!暂时不删
    // for (let index in app.cartList) {

    //   let _index = index.split(",");
    //   let _cartListTit = {
    //     tit: _index[4],
    //     info: index
    //   }
    //   cartListTit.push(_cartListTit)
    // }
    // this.setData({ cartListTit })
  },
  reduceBtn(goodInfo) {
    let goodid = goodInfo.goodid,
      goodPrice = goodInfo.goodPrice,
      goodParent = goodInfo.goodParent,
      num = goodInfo.goodNum,
      goodName = goodInfo.goodName,
      cartTitinfo = goodInfo.cartTitinfo,
      discountPrice = goodInfo.discountPrice,
      showNum0 = goodInfo.showNum0;
    let dishData = !this.data.goodListData || this.data.goodListData == 'undefined' ? app.goodListData : this.data.goodListData,
      cartListKey = !cartTitinfo ? this.getFilterInfo() : cartTitinfo;
    // console.log(app.goodListData)
    /**购买商品数量渲染到dishData */
    if (this.data.curLeftItem) {

      this._sendToCartlist(goodid, cartTitinfo,showNum0)
      for (let key in dishData) {
        if (this.data.curLeftItem == key) {
          for (let j in dishData[key]) {
            if (dishData[key][j].id == goodid) {
              let num = dishData[key][j].num
              // if (num <= 0) { return false }
              // else {
                // console.log(this.data.goodListData)
                this.data.goodListData[key][j]['num'] = num - 1
                this.setData({ navRightItems: this.data.goodListData[this.data.curLeftItem] })
              // }
            }
          }
        }
      }

    } else {
      //购买商品数量渲染到srhList 搜索页面 
      for (let q in this.data.srhList) {
        if (this.data.srhList[q].id == goodid) {
          this.data.srhList[q]['num'] = num - 1
        }
      }
      app.srhlist = this.data.srhList
      this._sendToCartlist(goodid, cartTitinfo)
    }
    app.cartData.cartNum = app.cartData.cartNum - 1
    // app.cartData.cartMoney = app.cartData.cartMoney - goodPrice / discount//discount为购物车里的discount参数，即当前商品的折扣
    app.cartData.cartMoney = app.cartData.cartMoney - discountPrice
    this.setData({ cartMoney: parseFloat(app.cartData.cartMoney).toFixed(2) })//购物车总价
    this.setData({ srhList: this.data.srhList, cartNum: app.cartData.cartNum })

    
  }
}


module.exports = function ComponentNum(context) {
  const carts = Object.assign({}, __fn__);
  context.setData({
    // 在组件data里的名字
    carts
  });
  // 注入
  Object.assign(context, __fn__)
}

