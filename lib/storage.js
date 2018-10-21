//类的私有方法
const whereCompare ={
  //判断相等的情况下
  "=":function(that,value){
    return that = value
  },
  ">": function (that, value) {
    return that > value
  },
  "<": function (that, value) {
    return that < value
  },
  ">=": function (that, value) {
    return that >= value
  },
  "<=": function (that, value) {
    return that <= value
  },
  "!=": function (that, value) {
    return that != value
  },
  //模糊查询
  "like": function (that, value) {
    return new RegExp(value,"i").test(that)
  }
}

export default class storage{
  constructor(dbname){
    Object.assign(this,{
      dbname,
      cache: {//存档和读档
        add:{
          data:[]
        }
      }
    })
  }
  //实时获得数据库的数据
  static getDb(dbname){
    return wx.getStorageSync(dbname)|| [];
  }
  //添加数据
  add(data){
    if(Array.isArray(data)){
      data.forEach(item=>{
        this.add(item)
      })
    }else if(/object/.test(typeof data)){
      this.cache.add.data.push(data)
    }else{
      throw new Error("add方法错误")
    }
    return this;
  }
  //将缓存更新到本地数据
  save(){
    //先从本地拿数据，接着缓存合并并保存
    let db= storage.getDb(this.dbname);
   
    // //是否存在本地缓存
    if(this.cache.add){
      db.push(...this.cache.add.data);
    }
    console.log(db)
    // //更新本地缓存
    wx.setStorageSync(this.dbname, db);
    //更新类的缓存
    this.cache ={
      add:{
        data:[]
      }
    }
    return this;
  }
  //查询器
  where(...args){
    //db.where("a",1)或者db.where("a",">"，1)查询
    let [key,compare,value] = args;
    if(!value){
      value = compare;
      compare ="=";
    }
    //获取对比函数
    const compareFn = whereCompare[compare];
    //用户传递进来是否为当前类支持的对比方式
    if(compareFn){
      //构建where查询函数
      this.whereFn =(item)=>{
        return compareFn(item[key],value);
      }
    }else{
      throw new Error("where不支持"+compare+"这个对比方式")
    }
    return this;
  }

  //查找一条数据
  find(){
    const db = storage.getDb(this.dbname);
    return db.find(this.whereFn)
  }
}