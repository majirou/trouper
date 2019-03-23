class Scenario {
    constructor () {
      // console.log("scenario constructed")
      this.mongo = require('mongodb').MongoClient
      const config = require('../config/database.js')
      this.url = config.dbConf.url // 'mongodb://localhost:27017/scraper_db'
      this.databaseName = config.dbConf.name // 'scraper_db'
      this.collectionName = 'scenario'
      this.param = {}
      this.errors = []
      this.id = null
      this.renamedDir = null
      this.colors = require('colors')
      this.fs = require("fs")
    }

    async getScenarios (param) {
      const client = await this.mongo.connect(this.url, { useNewUrlParser: true })
      // const collection = await client.db( 'scraper_db' ).collection( 'scenario' )
      const collection = await client.db(this.databaseName).collection(this.collectionName)

      let find = { $and: [ { delete: { $ne: true } } ] }
      if (param.multiSearch) {
        const regexp = new RegExp(param.multiSearch) //, 'g')
        find.$or = [ { name: regexp }, { url: regexp }, { mail: regexp }]
      }
      const lastPage = Math.ceil(await collection.find().count() / param.limit)

      const aggregateParam = []

      const match = {
        '$match': {
          'delete': { '$ne': true }
        }
      }
      if (param.delete === true) {
        match.$match.delete = { '$ne': null }
      }
      aggregateParam.push(match)

      if (param.multiSearch) {
        const regexp = new RegExp(param.multiSearch) //, 'g')
        const search = {
          '$match': {
            '$or': [ { name: regexp }, { url: regexp }, { mail: regexp } ]
          }
        }
        aggregateParam.push(search)
      }
      if (param.date) {
        aggregateParam.push({
          '$match': { date: param.date }
        })
      }

      const project = { '$project': {
        '_id': 1,
        'name': 1,
        'url': 1,
        'dir': 1,
        'mail': 1,
        'execute': 1,
        'interval': 1,
        'notify': 1,
        'date': { '$add': [ '$date', 32400000 ] } // 9*60*60*1000
      } }
      aggregateParam.push(project)

      if (param.sort != null) {
        const sort = { '$sort': param.sort }
        aggregateParam.push(sort)
      }
      if (param.skip != null) {
        const skip = { '$skip': param.skip }
        aggregateParam.push(skip)
      }

      if (param.limit!=null) {
        const limit = { '$limit': param.limit }
        aggregateParam.push(limit)
      }

      // console.log(aggregateParam);
      const data = await collection.aggregate(aggregateParam).toArray()

      client.close()
      return { last_page: lastPage, data }
    }

    async getScenario (id) {
      const ObjectId = require('mongodb').ObjectID

      const client = await this.mongo.connect(this.url, { useNewUrlParser: true })
      // const collection = await client.db( 'scraper_db' ).collection( 'scenario' )
      const collection = await client.db(this.databaseName).collection(this.collectionName)
      const data = await collection.find({ '_id': ObjectId(id) }).toArray()
      // console.log("getScenario".bgCyan,id, data)
      await client.close()
      return (data.length === 1) ? data[0] : null
    }

    async addScenario () {
      const client = await this.mongo.connect(this.url, { useNewUrlParser: true })
      // const collection = await client.db( 'scraper_db' ).collection( 'scenario' )
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

    async updateScenario (id) {
      if (id == null) return false

      const client = await this.mongo.connect(this.url, { useNewUrlParser: true })
      const collection = await client.db(this.databaseName).collection(this.collectionName)
      const ObjectId = require('mongodb').ObjectID

      // db.コレクション名.update({検索条件}, {更新内容})
      var result = null
      // console.log('update params', this.param)
      await collection.updateOne({ '_id': ObjectId(id) }, { $set: this.param })
        .then(res => {
          if (res.result.nModified !== 1) throw new Error('update is failed!!')
        })
        .catch(err => console.error(err))
        .then(() => {
          if (client) client.close()
          result = true
        })
      return result
    }

    async logicalDeleteScenario (id) {
      if (id == null) return false

      const client = await this.mongo.connect(this.url, { useNewUrlParser: true })
      const collection = await client.db(this.databaseName).collection(this.collectionName)
      const ObjectId = require('mongodb').ObjectID

      var result = null
      await collection.updateOne({ '_id': ObjectId(id) }, { $set: { delete: true } })
        .then(res => {
          // console.log(res.result)
          if (res.result.nModified !== 1) throw new Error(`[${id}] update is failed!!`)
        })
        .catch(err => console.error(err))
        .then(() => {
          if (client) client.close()
          result = true
        })
      return result
    }

    async physicalDeleteScenario (id) {
      if (id == null) return false

      const client = await this.mongo.connect(this.url, { useNewUrlParser: true })
      const collection = await client.db(this.databaseName).collection(this.collectionName)
      const ObjectId = require('mongodb').ObjectID

      var result = null
      await collection.deleteOne({ '_id': ObjectId(id) })
        .then(res => {
          if (res.result.ok !== 1) throw new Error(`[${id}] delete is failed!!`)
          console.log(`DELETED DB's SCENARIO: ${s._id}`.bgRed)
        })
        .catch(err => console.error(err))
        .then(() => {
          if (client) client.close()
          result = true
        })
      return result
    }

    async setRegisterParameter (param) {
      if (typeof param === 'object') {
        this.param = {}
        // url
        if (typeof param.url !== 'undefined') {
          this.param.url = (param.url) ? param.url.trim() : null
        }
        // dir
        if (typeof param.dir !== 'undefined') {
          this.param.dir = (param.dir) ? param.dir.trim() : null
        }
        // name
        if (typeof param.name !== 'undefined') {
          this.param.name = (param.name) ? param.name.trim() : null
        }
        // date
        if (typeof param.date !== 'undefined') {
          if (param.date) {
            let tmpDate = param.date.trim().replace(/\//g, '-')
            if (/^[0-9]{8}$/.exec(tmpDate)) {
              tmpDate = `${tmpDate.substr(0,4)}-${tmpDate.substr(4,2)}-${tmpDate.substr(6,2)}`
            }else{
              tmpDate = tmpDate.split('-')
              tmpDate = tmpDate[0] + '-' +
                        ('00'+tmpDate[1]).slice(-2) + '-' +
                        ('00'+tmpDate[2]).slice(-2)
            }
            this.param.date = new Date(`${tmpDate}T00:00:00+09:00`)
          } else {
            this.param.date = null
          }
        }
        // notify
        if (typeof param.notify !== 'undefined') {
          this.param.notify = (param.notify) ? param.notify : null
        }
        // mail
        if (typeof param.mail !== 'undefined') {
          this.param.mail = (param.mail) ? param.mail.trim() : null
        }
        // interval
        if (typeof param.interval !== 'undefined') {
          this.param.interval = (param.interval) ? parseInt(param.interval) : null
        }
        // actions
        if (typeof param.actions !== 'undefined') {
          this.param.actions = (param.actions) ? param.actions : null
        }
        // delete
        if (typeof param.delete !== 'undefined') {
          this.param.delete = !!(param.delete)
        }
        // execute
        if (typeof param.execute !== 'undefined') {
          this.param.execute = !!(param.execute)
        }
      } else {
        console.error('not object', param)
      }
    }

    async validateRegisterParameter () {
      // console.log( "validation" )
      this.errors = []

      if (this.param != null && typeof this.param !== 'object') {
        this.errors.push('not object')
        return false
      }

      if (!this.param.url || !/^(https?|ftp)(:\/\/[-_.!~*'()a-zA-Z0-9;/?:@&=+\$,%#]+)$/.exec(this.param.url)) {
        this.errors.push('URLが正しくありません: ' + this.param.url)
      }

      if (!this.param.name) {
        this.errors.push('シナリオ名が正しくありません: ' + this.param.name)
      }

      // if( ! this.param.date || ! /^\d{4}-\d{1,2}-\d{1,2}$/.exec( this.param.date )  ) {
      if (!(this.param.date instanceof Date)) {
        this.errors.push('日付が正しくありません: ' + this.param.date)
      }

      if (!this.param.notify || !Array.isArray(this.param.notify)) {
        this.errors.push('通知フラグが正しくありません: ' + this.param.notify)
      }

      if (!this.param.mail || !/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.exec(this.param.mail)) {
        this.errors.push('メールが正しくありません: ' + this.param.mail)
      }

      if (!this.param.interval || !this.param.interval > 0) {
        this.errors.push('期間の値が正しくありません: ' + this.param.interval)
      }

      if (!this.param.actions || !Array.isArray(this.param.actions)) {
        this.errors.push('アクション内容が正しくありません: ' + this.param.actions)
      }

      return (this.errors.length === 0)
    }

    async createNewScenarioDirectory (scenarioId, temporaryDir) {
      // var fs = require('fs')
      const mkdirp = require('mkdirp')
      const path = require('path')
      const baseDir = path.resolve('./public_html/data')
      const toDir = `${baseDir}/scenario/${scenarioId}/${temporaryDir}`
      const fromDir = `${baseDir}/tmp/${temporaryDir}`

      this.renamedDir = toDir

      await mkdirp.sync(toDir)
      console.log(`mkdir ${toDir}`.bgCyan)
      console.log(`rename ${fromDir} to ${toDir}`.bgCyan)
      await this.fs.renameSync(fromDir, toDir)
      // console.log('rename end'.bgGreen)
      return true
    }

    async checkDiff (id, dir) {
      const path = require('path')
      const baseDir = path.resolve('./public_html/data')
      const targetDir = `${baseDir}/scenario/${id}/${dir}`
      // console.log("check diff...")
      // notify を取得する
      const result =
        await this.getScenario(id)
          .then( async res => {
            const fileList = this.fs.readdirSync(`${targetDir}/`)

            res.diff = {}

            if( ( res.notify.find( n => n === 1) ) ) {
              // console.log("\tcheck page diff".bgCyan)
              const d1 = fileList.find( f => /^diff_[0-9]+\.txt$/.exec(f) )
              if (d1 != null) {
                const diff1 = this.fs.readFileSync(`${targetDir}/${d1}`).toString()
                if (diff1) {
                  res.diff.page = ( diff1.toString().split('\n').length > 4 )
                }
              }
              // console.log("\tdiff1 end".bgRed);
            }
            if( ( res.notify.find( n => n === 2) ) ) {
              // console.log("\tcheck part diff".bgCyan)
              const d2 = fileList.find( f => /^diff_parts_[0-9]+\.txt$/.exec(f) )
              if (d2 != null) {
                const diff2 = this.fs.readFileSync(`${targetDir}/${d2}`).toString()
                if (diff2) {
                  res.diff.part = ( diff2.toString().split('\n').length > 4 )
                }
              }
              // console.log("\tdiff2 end".bgRed);
            }
            if( ( res.notify.find( n => n === 4) ) ) {
              // console.log("\tcheck image diff".bgCyan)
              // diff_image_20190215021330
              const d3 = fileList.find( f => /^diff_image_[0-9]+\.png\.txt$/.exec(f) )
              if (d3 != null) {
                const diff3 = this.fs.readFileSync(`${targetDir}/${d3}`).toString()
                if(diff3){
                  res.diff.image = (diff3.toString().split('\n')[1] != 0 )
                }
              }
              // console.log("\tdiff3 end".bgRed);
            }
            return res
            // console.log(targetDir,res)
          })
      return result
    }
  }

  // module.exports = new Scenario();
  module.exports = Scenario
