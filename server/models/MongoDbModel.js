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
  }
  /**
   * create new url to connect mongodb
   * config is expected follow
   * "mongodb":{
   *   "host": String,
   *   "port": Number,
   *   "name": String
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
    if (this.client == null) {
      await this._connect()
    }
    const collection = await client.db(this.databaseName).collection(this.collectionName)
    await collection.insertOne(param)
      .then(res => {
        console.log('inserted', res.result)
        this.id = res.insertedId
      })
      .catch(err => console.error(err))
      .then(() => { if (client) client.close() })
    return this.id
  }
}
module.exports = MongoDbModel
