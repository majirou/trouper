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
          console.log('INSERTED'.bgGreen, res.result)
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
      // notified
      this.param.notified = setDate(param.notified)
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

      // Id
      if(typeof param._id !== 'undefined') {
        this.param._id = (param._id) ? ObjectId(param._id.trim()):null
      }
      // scenarioId
      if(typeof param.scenarioId !== 'undefined') {
        this.param.scenarioId = (param.scenarioId)?ObjectId(param.scenarioId.trim()):null
      }
      // notified
      if(typeof param.notified !== 'undefined') {
        this.param.notified = (param.notified)?param.notified:null
      }
      // executed
      if(typeof param.executed !== 'undefined') {
        this.param.executed = (param.executed)?param.executed:null
      }
    }

    async deleteNotExecutedSchedule(){
      const client = await this.mongo.connect(this.url, { useNewUrlParser: true })
      const collection = await client.db(this.databaseName).collection(this.collectionName)
      this.result = null
      await collection.deleteMany({executed:null})
        .then(res => {
          console.log("DELETED".bgRed,res.result)
          if (res.result.ok !== 1) throw new Error('delete is failed!!')
          this.result = true
        })
        .catch(err => console.error(err))
        .then(() => {
          if (client) client.close()
        })
      return this.result
    }

    async updateNotified () {
      const client = await this.mongo.connect(this.url, { useNewUrlParser: true })
      const collection = await client.db(this.databaseName).collection(this.collectionName)
      this.result = null

      await collection.updateMany({notified: null}, {$set: { notified: new Date() } })
        .then(res => {
          console.log("NOTIFIED IS UPDATED".bgRed,res.result)
          // if (res.result.ok !== 1) throw new Error('update is failed!!')
          this.result = true
        })
        .catch(err => console.error(err))
        .then( () => {
          if (client) client.close()
        })
      return this.result
    }
  }

  module.exports = Scheduler
