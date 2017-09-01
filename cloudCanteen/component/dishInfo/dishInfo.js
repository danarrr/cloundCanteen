// 在页面引入，例如 import {dishInfo, dishSetDish} from '路径....../dishInfo.js';

// 一个菜品或套餐的信息
class dishInfo {
  /**
   * @param id 菜品或套餐id
   * @param name 菜品或套餐名
   * @param sUnit 单位
   * @param nUnitPrice 价格
   * @param typeID 所属类型id   就是 data下那个键非中文部分 例如  000201010201(西中餐) 的 000201010201 。用这个也可以，只是用来分组显示
   * @param typeName 所属类型名
   * @param tradeID 餐次id
   * @param tradeName 餐次名
   * @param dateID 日期id
   * @param dateName 日期名
   * @param canteenID 食堂id
   * @param canteenName 食堂名
   * @param discount 折扣
   * @param moneyLimit 订餐限额（通过接口selectEnaByPrimaryKeys获取。可以放在这里记录一下方便记录提取，也可以自己用变量记录，随意）
   * @param tradeNumber 餐次序号 （因为在购物车或确认订单在展示时要按餐次排序。获取餐次时餐次时已经按顺序排好的，那个顺序就是这个序号，赋值到这里）
   * @param delivery 配送权限（通过接口selectEnaByPrimaryKeys获取。配送权限跟餐次有关，放在这里方便记录提取，也可以自己用变量记录，随意）
   * @param dishSetDishArr 套餐明细数组，就是一组子菜品 （在下面，就是 dishSetDish） 主要是为了拼接成 this.description，所以也可去掉 dishSetDishArr参数，换成 description
   */
  constructor(id, name, sUnit, nUnitPrice,
    typeID, typeName, tradeID, tradeName,
    dateID, dateName, canteenID, canteenName, discount, moneyLimit, tradeNumber, delivery, dishSetDishArr) {
    this.id = id;
    this.name = name;
    this.sUnit = sUnit;
    this.nUnitPrice = nUnitPrice;
    this.typeID = typeID;
    this.typeName = typeName;
    // this.tradeID = tradeID;
    // this.tradeName = tradeName;
    // this.dateID = dateID;
    // this.dateName = dateName;
    // this.canteenID = canteenID;
    // this.canteenName = canteenName;
    this.discount = discount;
    // this.moneyLimit = moneyLimit;
    // this.tradeNumber = tradeNumber;
    // this.delivery = delivery;
    this.selectedNumber = 0; //被选择数量
    this.isSet = false; // 是否套餐 （就是标记一下，方便判断）

    this.description = ''; // 套餐描述（普通菜品没有）

    // if (typeof (dishSetDishArr) != 'undefined') {
    //   for (let i = 0; i < dishSetDishArr.length; i++) {
    //     this.description = this.description + dishSetDishArr[i].name + '*' + dishSetDishArr[i].number + '，'; // 拼接字符串 明细菜品名*明细菜品数量
    //   }
    // }

    // 折后价
    this.discountPrice = nUnitPrice * (discount / 100); // 折后价等于 (discount÷100)*discountPrice

    // 附加到页面上
    let pages = getCurrentPages(); // 用于获取当前页面栈的实例，以数组形式按栈的顺序给出，第一个元素为首页，最后一个元素为当前页面
    let curPage = pages[pages.length - 1];
    curPage.dishes = this;
    this.curPage = curPage
  }

}

// 套餐明细（一个子菜品）
class dishSetDish {
  constructor(id, name, setID, price, number, unit) {
    this.id = id;
    this.name = name;
    this.setID = setID;
    this.price = price;
    this.number = number;
    this.unit = unit;
  }
}

export { dishInfo, dishSetDish }

