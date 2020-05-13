class MongoDbModel {
  constructor () {
    console.log('mongo db model constructing...'.cyan);

    const config = require('../config/db.config.json').mongodb
    if (config != null) {
      this.url = this._createUrlByConfig(config)
      this.mongo = require('mongodb').MongoClient
      this.client = null
      this.databaseName = config.name
      this.collectionName = config.collection
    }
    this.params = null
    this.msg = []
  }
  /**
   * create new url to connect mongodb
   * the following is expected
   * "mongodb":{
   *   "host": String,
   *   "port": Number,
   *   "name": String,
   *   "collection": String
   * }
   * @param {Object} config
   */
  _createUrlByConfig(config){
    return (
      config != null &&
      config.host != null &&
      config.port != null &&
      config.port > 0
    ) ? `mongodb://${config.host}:${config.port}/config.name` : null
  }

  async _connect(){
    try {
      if (this.url == null) throw new Error('connecting to:'.cyan + this.url);
      const connectOption = {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
      this.client = await this.mongo.connect(this.url, connectOption)
    } catch (err) {
      console.log(err.name.red, err.message.yellow);
    }
  }

  async addProgram(param) {
    const _p = (this.params == null) ? param : this.params
    _p.created = new Date()
    return await this._insert(_p)
  }

  async _insert(param) {
    if (this.client == null) {
      await this._connect()
    }
    const collection = await this.client.db(this.databaseName).collection(this.collectionName)
    await collection.insertOne(param)
      .then(res => {
        console.log('inserted', res.result)
        this.id = res.insertedId
      })
      .catch(err => console.error(err))
      .then(() => { if (this.client != null) this.client.close() })
    return this.id
  }

  validRegisterParameters(){
    let result ;
    try {
      if(this.params == null) {
        throw new Error('Paramter is empty.')
      }
      let valid = true
      if (!this._validateUrl(this.params.url)) {
        valid = false
        this.msg.push(`Validation Error @ Url: ${url}`)
      }
      if (!this._validateSchedule(this.params.schedule)) {
        valid = false
        this.msg.push('Validation Error @ Schedule')
      }
      // if (!this._validateActions(actions)) {
      //   valid = false
      //   this.msg.push(`Validation Error @ Actions`)
      // }
      if (!valid) {
        throw new Error('Validation is failed.')
      }
      result = true
    } catch(e) {
      result = false
    }
    return result
  }

  _validateUrl (url) {
    return /^(https?)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)$/.test(url)
  }

  _validateSchedule (schedule) {
    return (
      schedule != null &&
      schedule.name != null &&
      schedule.date != null &&
      this._validateDate(schedule.date) &&
      schedule.interval > 0 &&
      schedule.interval < 3 &&
      schedule.notification != null &&
      Array.isArray(schedule.notification) &&
      schedule.mail != null
    )
  }

  _validateDate(date){
    const arr = date.split("-")
    return (
      (arr.length === 3) &&
      (arr[0] >= 2020 && arr[0] <= 2099) &&
      (arr[1] >= 1 && arr[1] <= 12) &&
      (arr[2] >= 1 && arr[2] <= 31)
    )
  }

  _validateActions (actions) {
    return true
  }

  setRegisterParameters(params){
    this.params = params
  }

  /**
   * search
   */
  validSearchParameters(){
    let result ;
    try {
      // let valid = true
      // if (!this._validateUrl(this.params.url)) {
      //   valid = false
      //   this.msg.push(`Validation Error @ Url: ${url}`)
      // }
      // if (!valid) {
      //   throw new Error('Validation is failed.')
      // }
      result = true
    } catch(e) {
      result = false
    }
    return result
  }
  setSearchParameters(params){
    this.params = params
  }

  async search(param) {
    const _p = (this.params == null) ? param : this.param
    return await this._search(_p)
  }

  async _search(param) {
    if (this.client == null) {
      await this._connect()
    }
    const collection = await this.client.db(this.databaseName).collection(this.collectionName)
    const result = await collection.find().toArray()
    await this.client.close()
    return result
  }

}
module.exports = MongoDbModel
