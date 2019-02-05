class Scheduler {
    constructor () {
      // console.log("schedule constructed")
      this.mongo = require('mongodb').MongoClient

      const config = require('../config/database.js')
      this.url = config.dbConf.url // 'mongodb://localhost:27017/scraper_db'
      this.databaseName = config.dbConf.name // 'scraper_db'
      this.collectionName = 'schedule'
      this.param = {}
      this.errors = []
      this.id = null
      this.result = null
    }

    async addSchedule () {
      const client = await this.mongo.connect(this.url, { useNewUrlParser: true })
      const collection = await client.db(this.databaseName).collection(this.collectionName)

      await collection.insertOne(this.param)
        .then(res => {
          console.log('inserted', res.result)
          this.id = res.insertedId
        })
        .catch(err => console.error(err))
        .then(() => { if (client) client.close() })
      return this.id
    }

    setRegisterParameter (param) {
      // console.log(param)
      this.param = {}
      if (typeof param !== 'object') return false

      const setDate = function (val) {
        let rt = null
        if (val) {
          switch (typeof val) {
            case 'object':
              rt = new Date(val)
              break
            case 'string':
              rt = new Date(val.trim())
              break
            default:
              rt = null
              break
          }
          rt = (rt && rt.toString === 'Invalid Date') ? null : rt
        }
        return rt
      }

      const ObjectId = require('mongodb').ObjectID
      // created
      this.param.created = new Date()
      // scheduled
      this.param.scheduled = setDate(param.scheduled)
      // executed
      this.param.executed = setDate(param.executed)
      // done
      this.param.done = setDate(param.done)
      // scenarioId
      // console.log( param.scenarioId, typeof param.scenarioId, param.scenarioId.toString() )
      this.param.scenarioId = (param.scenarioId) ? ObjectId(param.scenarioId.toString().trim()) : null
      // saveDir
      this.param.saveDir = (param.saveDir) ? param.saveDir.trim() : null
    }

    async updateSchedule (id) {
      if (id == null) return false

      const client = await this.mongo.connect(this.url, { useNewUrlParser: true })
      const collection = await client.db(this.databaseName).collection(this.collectionName)
      const ObjectId = require('mongodb').ObjectID

      // db.コレクション名.update({検索条件}, {更新内容})
      // var result = null;
      this.result = null
      await collection.updateOne({ '_id': ObjectId(id) }, { $set: this.param })
        .then(res => {
          // console.log('updating...start')
          if (res.result.ok !== 1) throw new Error('update is failed!!')
          this.result = true
        })
        .catch(err => console.error(err))
        .then(() => {
          if (client) client.close()
        })
      return this.result
    }

    async getSchedules (param) {
      const client = await this.mongo.connect(this.url, { useNewUrlParser: true })
      const collection = await client.db(this.databaseName).collection(this.collectionName)

      const lastPage = Math.ceil(await collection.find().count() / param.limit)
      const data = await collection.find(this.param)
        .sort(param.sort)
        .skip(param.skip)
        .limit(param.limit)
        .toArray()
      client.close()
      return { last_page: lastPage, data }
    }

    setSearchParameter (param) {
      // console.log(__filename,param)
      if (typeof param !== 'object') return false
      this.param = {}

      const ObjectId = require('mongodb').ObjectID

      // scenarioId
      this.param.scenarioId = (param.scenarioId) ? ObjectId(param.scenarioId.trim()) : null
    }
  }

  module.exports = Scheduler
