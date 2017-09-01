/**
 * 　　┏┓　　　┏┓+ +
 * 　┏┛┻━━━┛┻┓ + +
 * 　┃　　　　　　　┃
 * 　┃　　　━　　　┃ ++ + + +
 * ████━████ ┃+
 * 　┃　　　　　　　┃ +
 * 　┃　　　┻　　　┃
 * 　┃　　　　　　　┃ + +
 * 　┗━┓　　　┏━┛
 * 　　　┃　　　┃
 * 　　　┃　　　┃ + + + +
 * 　　　┃　　　┃
 * 　　　┃　　　┃ +  神兽保佑
 * 　　　┃　　　┃    代码无bug
 * 　　　┃　　　┃　　+
 * 　　　┃　 　　┗━━━┓ + +
 * 　　　┃ 　　　　　　　┣┓
 * 　　　┃ 　　　　　　　┏┛
 * 　　　┗┓┓┏━┳┓┏┛ + + + +
 * 　　　　┃┫┫　┃┫┫
 * 　　　　┗┻┛　┗┻┛+ + + +
 */


// 在评价详情界面显示的数据
class evaluateData {
	/**
	 * consumeId 消费单号
	 */
  constructor(app, consumeId) {
    this.consumeId = consumeId;
    let pages = getCurrentPages(); // 用于获取当前页面栈的实例，以数组形式按栈的顺序给出，第一个元素为首页，最后一个元素为当前页面
    let curPage = pages[pages.length - 1];
    curPage.evaluateData = this;
    // this.curPage = curPage

    this.app = app;
  }

	/**
	 * 获取待评价数据
	 * 
	 * callback 请求结果回调
	 */
  getWillEvaluateData(callback) {
    let that = this;
    wx.request({
      url: this.app.baseUrl + 'swtapi/user/canteen_comments/get_basic_info_by_bill',
      header: {
        'token': this.app.appData.token,
        "appid": this.app.appid,
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      data: {
        id: this.consumeId
      },
      success: function (res) {
        if (res.statusCode == '200') {
          if (res.data.success) {
            let data = res.data.data
            // 整理所有评价项
            let canteenEvalOptions = [];
            let posEvalOptions = [];
            let dishEvalOptions = [];
            for (let i = 0; i < data.eval.length; i++) {
              if (data.eval[i].type == 0) { // 食堂的评价项
                canteenEvalOptions.push(new evalOption(data.eval[i].id, data.eval[i].name, data.eval[i].enabled, 0))
              }
              if (data.eval[i].type == 1) { // pos的评价项
                posEvalOptions.push(new evalOption(data.eval[i].id, data.eval[i].name, data.eval[i].enabled, 0))
              }
              if (data.eval[i].type == 2) { // 菜品的评价项
                dishEvalOptions.push(new evalOption(data.eval[i].id, data.eval[i].name, data.eval[i].enabled, 0))
              }
            }

            // 整合饭堂数据
            let _canteen = new canteen(data.canteen.CanteenId, data.canteen.CanteenName, canteenEvalOptions, '')

            // 整合pos数据
            let poses = []
            for (let i = 0; i < data.pos.length; i++) {
              let _pos = new pos(data.pos[i].id, data.pos[i].name, posEvalOptions, '');
              poses.push(_pos)
            }

            // 整合菜品数据
            let dishes = []
            for (let i = 0; i < data.dish.length; i++) {
              if (data.dish[i].dishseted == 0) { // 普通菜品
                let _dish = new dish(data.dish[i].dishId, data.dish[i].dishName, data.dish[i].dishseted,
                  data.dish[i].pic, dishEvalOptions, null, '', that.app.getIP()); // 菜品
                dishes.push(_dish);
              }
              if (data.dish[i].dishseted == 1) { // 套餐
                let __dishes = [] // 某个套餐明细

                for (let j = 0; j < data.dish[i].dishsetlist.length; j++) { // 遍历整理某个套餐的子菜品
                  let __dish = new dish(data.dish[i].dishsetlist[j].dishId, data.dish[i].dishsetlist[j].dishName, 0/*子菜品不会是套餐所以给0*/,
                    null, dishEvalOptions, null, '', '');
                  __dishes.push(__dish);
                }

                let _dish = new dish(data.dish[i].dishId, data.dish[i].dishName, data.dish[i].dishseted,
                  data.dish[i].pic, null, __dishes, '', that.app.getIP()); // 某个套餐本身
                dishes.push(_dish);
              }
            }

            // 菜品排序，普通菜品在前面，套餐在后面
            dishes.sort(function (a, b) {
              return a.dishseted ? 1 : -1; // 返回正数代表把a往后面放
            });

            // 把饭堂、POS、菜品数据整合并传出去
            callback({
              canteen: _canteen,
              poses: poses,
              dishes: dishes,
              anonymous: 0, // 是否匿名评价。1是匿名评价，0是未匿名评价
            }, null)

          } else {
            callback(null, res.data.message)
          }
        } else {
          callback(null, '接口错误')
        }


      },
      fail: function (res) {
        callback(null, '服务器连接不成功')
      }
    })
  }

	/**
	 * 获取已评价数据
	 * callback 请求结果回调
	 */
  getEvaluatedData(callback) {
    let that = this
    wx.request({
      url: this.app.baseUrl + 'swtapi/user/canteen_comments/get_comments_by_bill',
      header: {
        'token': this.app.appData.token,
        "appid": this.app.appid,
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      data: {
        id: this.consumeId
      },
      success: function (res) {
        JSON.stringify(res.data);
        if (res.statusCode == '200') {
          if (res.data.success) {
            let evalDetailInfo = res.data.data.evalDetailInfo     // 评价留言
            let evalDetail = res.data.data.evalDetail             // 评价分数明细
            let evalDishsetList = res.data.data.evalDishsetList   // 套餐分数明细

            let _canteen = null;
            let poses = [];
            let dishes = [];

            for (let i = 0; i < evalDetailInfo.length; i++) { // 遍历评价留言。这里可以确定有哪些需要评价（饭堂、pos、菜品）

              // 整合饭堂数据。饭堂只有一个
              if (evalDetailInfo[i].type == 0) {
                let canteenEvalOptions = [];
                for (let j = 0; j < evalDetail.length; j++) { // 找一下此饭堂有哪些评价项
                  if (evalDetailInfo[i].object_c == evalDetail[j].objectC) {
                    canteenEvalOptions.push(new evalOption(evalDetail[j].evaluateId, evalDetail[j].evaluateName, true, evalDetail[j].score))
                    evalDetail.splice(j, 1) // evalDetail可能会很大，所以用了的元素就去掉
                    j--;
                  }
                }

                _canteen = new canteen(evalDetailInfo[i].object_c, evalDetailInfo[i].object_n, canteenEvalOptions, evalDetailInfo[i].proposal)
              }

              // 整合pos数据
              if (evalDetailInfo[i].type == 1) {
                let posEvalOptions = [];

                for (let j = 0; j < evalDetail.length; j++) { // 找一下此pos有哪些评价项
                  if (evalDetailInfo[i].object_c == evalDetail[j].objectC && evalDetail[j].type == 1/*偶尔pos编码会跟套餐或菜品片面撞车，所以加类型判断*/) {
                    posEvalOptions.push(new evalOption(evalDetail[j].evaluateId, evalDetail[j].evaluateName, true, evalDetail[j].score))
                    evalDetail.splice(j, 1)
                    j--;
                  }
                }

                let _pos = new pos(evalDetailInfo[i].object_c, evalDetailInfo[i].object_n, posEvalOptions, evalDetailInfo[i].proposal);
                poses.push(_pos)
              }

              // 整合菜品数据
              if (evalDetailInfo[i].type == 2) {

                if (evalDetailInfo[i].dishseted == 0) { // 普遍菜品
                  let dishEvalOptions = [];
                  for (let j = 0; j < evalDetail.length; j++) { // 找一下此菜品有哪些评价项
                    if (evalDetailInfo[i].object_c == evalDetail[j].objectC && evalDetail[j].type == 2/*偶尔pos编码会跟套餐或菜品片面撞车，所以加类型判断*/) {
                      dishEvalOptions.push(new evalOption(evalDetail[j].evaluateId, evalDetail[j].evaluateName, true, evalDetail[j].score))
                      evalDetail.splice(j, 1)
                      j--;
                    }
                  }

                  let _dish = new dish(evalDetailInfo[i].object_c, evalDetailInfo[i].object_n, 0,
                    evalDetailInfo[i].pic, dishEvalOptions, null, evalDetailInfo[i].proposal, that.app.getIP()); // 菜品
                  dishes.push(_dish);
                }

                if (evalDetailInfo[i].dishseted == 1) { // 套餐
                  let tempEvalDishsetList = [] // 为某个套餐缓存一份它自己的evalDishsetList
                  for (let j = 0; j < evalDishsetList.length; j++) { // 找一下此套餐下的子菜品有哪些评价（套餐本身没有评价项，只有子菜品才有，所以不用在返回的数中的evalDetail属性中找）
                    if (evalDetailInfo[i].object_c == evalDishsetList[j].dishsetId) {
                      tempEvalDishsetList.push(evalDishsetList[j]); // 把此套餐下的子菜品评价项抽出来
                      evalDishsetList.splice(j, 1)
                      j--;
                    }
                  }

                  let __dishes = that.exeTempEvalDishsetList(tempEvalDishsetList, []);  // 某个套餐明细，其中的子菜品已经携带了自己的评价信息
                  let _dish = new dish(evalDetailInfo[i].object_c, evalDetailInfo[i].object_n, 1,
                    evalDetailInfo[i].pic, null, __dishes, '', that.app.getIP()); // 套餐本身
                  dishes.push(_dish);
                }
              }

            }

            // 菜品排序，普通菜品在前面，套餐在后面
            dishes.sort(function (a, b) {
              return a.dishseted ? 1 : -1; // 返回正数代表把a往后面放
            });

            // 把饭堂、POS、菜品数据整合并传出去
            callback({
              canteen: _canteen,
              poses: poses,
              dishes: dishes,
              anonymous: res.data.data.anonymousEvaluation, // 是否匿名评价。1是匿名评价，0是未匿名评价
            }, null)

          } else {
            callback(null, res.data.message)
          }
        } else {
          callback(null, '接口错误')
        }


      },
      fail: function (res) {
        callback(null, '服务器连接不成功')
      }
    })
  }

	/**
	 * 获得（此函数专门处理已评价数据的套餐的）
	 * tempEvalDishsetList 某个套餐的所有子菜品评价
	 * __dishes 某个套餐明细（将会把携带评价的子菜品放进去）
	 * 
	 */
  exeTempEvalDishsetList(tempEvalDishsetList, __dishes) {
    if (tempEvalDishsetList.length > 0) { // 还有评价需要处理
      let dishEvalOptions = [];
      let __dish = new dish(tempEvalDishsetList[0].objectC, tempEvalDishsetList[0].objectN, 0, null, dishEvalOptions, null, '', ''); // 子菜品

      let tempObjectC = tempEvalDishsetList[0].objectC; // 这里是拿一个子菜品的编码
      // 把这个子菜品的评价拿出来
      for (let j = 0; j < tempEvalDishsetList.length; j++) {
        if (tempObjectC == tempEvalDishsetList[j].objectC) {
          __dish.evalOptions.push(new evalOption(tempEvalDishsetList[j].evaluateId, tempEvalDishsetList[j].evaluateName, true, tempEvalDishsetList[j].score))
          tempEvalDishsetList.splice(j, 1) // 剔除处理了的评价
          j--;
        }
      }
      // 把携带了评价的子菜品放到明细中
      __dishes.push(__dish);
      this.exeTempEvalDishsetList(tempEvalDishsetList, __dishes) // 递归
    }
    return __dishes;
  }

  /**
   * 提交评价
   */
  submitEvaluate(consumeId, callback) {
    let that = this
    let commentData = wx.getStorageSync('commentDetailData') // 评价数据
    let listDetailStr = new ForListDetailStr().getData()
    let detailInfoStr = new ForDetailInfoStr().getData()

    wx.request({
      url: this.app.baseUrl + 'swtapi/user/canteen_comments/add',
      header: {
        'token': this.app.appData.token,
        "appid": this.app.appid,
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      // id=0002 & userId=0002000004&consumeId=000201010220170720150000103575&orderId=000201010220170720095817594671
      data: {
        eid: commentData.canteen.id,// 饭堂ID
        // id: this.app.appData.eid, // 企业ID（应该也不需要传，文档没有要求）
        userId: this.app.appData.userInfo.id, // 用户ID
        // submit: commentData.canteen.id, // 后台也不知道这是什么鬼，不传也能提交成，根据文档这个值跟饭堂ID一样
        // reply: this.app.appData.userInfo.id,// 后台也不知道这是什么鬼，不传也能提交成，根据文档这个值跟用户ID一样
        consumeId: consumeId,
        // orderId: '', // 也没要求
        // remark: '', // 不知道要传什么鬼，文档里也不是必须的
        anonymousEvaluation: commentData.anonymous,
        listDetailStr: listDetailStr, // 评分
        detailInfoStr: detailInfoStr // 备注
      },
      success: function (res) {
        if (res.statusCode == '200') {
          callback(res.data, null)
        } else {
          callback(null, '接口错误')
        }

      },
      fail: function (res) {
        callback(null, '服务器连接不成功')
      }
    })
  }
}

// -------------------------------铺平所有数据，自己携带自己的评价项-----↓--------------------------
// 饭堂
class canteen {
	/**
	 * evalOptions  饭堂的评价项
   * words 留言
	 */
  constructor(id, name, evalOptions, words) {
    this.id = id
    this.name = name
    this.evalOptions = evalOptions
    this.words = words;
    this.curWordNum = words.length // 留言字数
  }

}

// pos
class pos {
	/**
	 * evalOptions pos的评价项
   * words 留言
	 */
  constructor(id, name, evalOptions, words) {
    this.id = id
    this.name = name
    this.evalOptions = evalOptions
    this.words = words
    this.curWordNum = words.length // 留言字数
  }
}

// 菜品
class dish {
	/**
	 * evalOptions 套餐或菜品的评价项。如果是普通菜品，则evalOptions有值dishsetlist为空；如果是套餐，则evalOptions为空dishsetlist有值且dishsetlist的每个子菜品都携带自己的evalOptions
	 * dishsetlist 套餐明细
   * words 留言
	 */
  constructor(id, name, dishseted, pic, evalOptions, dishsetlist, words, ip) {
    this.id = id
    this.name = name
    this.dishseted = dishseted
    this.pic = ip + pic
    this.evalOptions = evalOptions
    this.dishsetlist = dishsetlist
    this.words = words
    this.curWordNum = words.length // 留言字数
  }

}

// 评价项
class evalOption {
	/**
	 * enabled 是否启用（显示）此评价项
	 * score 评分
	 */
  constructor(id, name, enabled, score) {
    this.id = id
    this.name = name + ':'
    this.enabled = enabled
    this.score = score
    this.stars = [0, 1, 2, 3, 4]
  }

}
// -------------------------------铺平所有数据，自己携带自己的评价项-----↑--------------------------

// -------------------------------提交评价数据对象-----↓--------------------------
class ForListDetailStr { // 评分部分，对应key为listDetailStr
  getData() {
    let commentData = wx.getStorageSync('commentDetailData');
    let arr = [];
    // 食堂
    for (let i = 0; i < commentData.canteen.evalOptions.length; i++) {
      let element = {
        objectC: commentData.canteen.id,                       // 被评价对象
        objectN: commentData.canteen.name,
        evaluateId: commentData.canteen.evalOptions[i].id,     // 评价项
        evaluateName: commentData.canteen.evalOptions[i].name,
        score: commentData.canteen.evalOptions[i].score,       // 评价项的分数
        type: 0                                                // 被评价对象的类型，0是食堂，1是pos，2是菜品
      }
      arr.push(element)
    }
    // pos
    for (let i = 0; i < commentData.poses.length; i++) {
      for (let j = 0; j < commentData.poses[i].evalOptions.length; j++) {
        let element = {
          objectC: commentData.poses[i].id,
          objectN: commentData.poses[i].name,
          evaluateId: commentData.poses[i].evalOptions[j].id,
          evaluateName: commentData.poses[i].evalOptions[j].name,
          score: commentData.poses[i].evalOptions[j].score,
          type: 1
        }
        arr.push(element)
      }
    }
    // 菜品
    for (let i = 0; i < commentData.dishes.length; i++) {
      if (commentData.dishes[i].dishseted == 0) { // 普通菜品
        for (let j = 0; j < commentData.dishes[i].evalOptions.length; j++) {
          let element = {
            objectC: commentData.dishes[i].id,
            objectN: commentData.dishes[i].name,
            evaluateId: commentData.dishes[i].evalOptions[j].id,
            evaluateName: commentData.dishes[i].evalOptions[j].name,
            score: commentData.dishes[i].evalOptions[j].score,
            type: 2,
            dishseted: commentData.dishes[i].dishseted
          }
          arr.push(element)
        }
      }
      if (commentData.dishes[i].dishseted == 1) { // 套餐
        let element = {
          objectC: commentData.dishes[i].id, // 套餐编码
          objectN: commentData.dishes[i].name,
          evaluateId: '',   // 这个值本身不应该存在，但必须随便给个值，后台SQL会报错
          evaluateName: '', // 这个值本身不应该存在，但必须随便给个值，后台SQL会报错
          score: 0,         // 这个值本身不应该存在，但必须随便给个值，后台SQL会报错
          type: 2,
          dishseted: commentData.dishes[i].dishseted,
          dishsetList: []
        }
        for (let j = 0; j < commentData.dishes[i].dishsetlist.length; j++) {
          for (let k = 0; k < commentData.dishes[i].dishsetlist[j].evalOptions.length; k++) {
            let _element = {
              dishsetId: commentData.dishes[i].id,                                 // 套餐编码
              objectC: commentData.dishes[i].dishsetlist[j].id,                    // 被评价的子菜品
              objectN: commentData.dishes[i].dishsetlist[j].name,
              evaluateId: commentData.dishes[i].dishsetlist[j].evalOptions[k].id,  // 被评价的子菜品的评价项
              evaluateName: commentData.dishes[i].dishsetlist[j].evalOptions[k].name,
              score: commentData.dishes[i].dishsetlist[j].evalOptions[k].score,    // 被评价的子菜品的评价项的分数
              type: 2
            }
            element.dishsetList.push(_element)
          }
        }
        arr.push(element)
      }
    }

    return JSON.stringify(arr);
  }
}

class ForDetailInfoStr {// 留言部分，对应key为detailInfoStr
  getData() {
    let commentData = wx.getStorageSync('commentDetailData');
    let arr = [];
    // 食堂
    arr.push({
      object_c: commentData.canteen.id,
      object_n: commentData.canteen.name,
      proposal: commentData.canteen.words,
      type: 0,
      dishseted: 0
    })
    // POS
    for (let i = 0; i < commentData.poses.length; i++) {
      arr.push({
        object_c: commentData.poses[i].id,
        object_n: commentData.poses[i].name,
        proposal: commentData.poses[i].words,
        type: 1,
        dishseted: 0
      })
    }
    // 菜品
    for (let i = 0; i < commentData.dishes.length; i++) {
      arr.push({
        object_c: commentData.dishes[i].id,
        object_n: commentData.dishes[i].name,
        proposal: commentData.dishes[i].words,
        type: 2,
        dishseted: commentData.dishes[i].dishseted
      })
    }
    return JSON.stringify(arr);
  }
}


// -------------------------------提交评价数据对象-----↑--------------------------
export { evaluateData }
