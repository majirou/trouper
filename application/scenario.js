class Scenario {

	constructor(){
        // console.log("scenario constructed")
        this.mongo = require( "mongodb" ).MongoClient
        this.url   = 'mongodb://localhost:27017/scraper_db'
        this.param = {}
        this.errors = []
        this.id = null
        this.databaseName = 'scraper_db'
        this.collectionName = 'scenario'
        this.renamedDir = null
        this.colors = require('colors')
    }

    async getScenarios( param ){
        const client     = await this.mongo.connect( this.url , { useNewUrlParser: true } )
        // const collection = await client.db( 'scraper_db' ).collection( 'scenario' )
        const collection = await client.db( this.databaseName ).collection( this.collectionName )

        let find = { $and: [ {delete: {$ne: true} } ] }
        if( param.multiSearch ){
            // const ms =
            const regexp = new RegExp(param.multiSearch) //, 'g')
            find.$or = [ {name: regexp}, {url: regexp} ]
        }
        const last_page =  Math.ceil( await collection.find().count() / param.limit )
        const data = await collection.find( find )
                                     .sort( param.sort )
                                     .skip( param.skip )
                                     .limit( param.limit )
                                     .toArray()
        client.close()
        return { last_page: last_page , data: data }
    }

    async getScenario( id ){
        const ObjectId = require('mongodb').ObjectID;

        const client     = await this.mongo.connect( this.url , { useNewUrlParser: true } )
        // const collection = await client.db( 'scraper_db' ).collection( 'scenario' )
        const collection = await client.db( this.databaseName ).collection( this.collectionName )
        const data = await collection.find( {"_id": ObjectId(id)} ).toArray()
        // console.log("getScenario",id, data)
        return (data.length === 1) ? data[0] : null
    }

    async addScenario() {
        const client     = await this.mongo.connect( this.url , { useNewUrlParser: true } )
        // const collection = await client.db( 'scraper_db' ).collection( 'scenario' )
        const collection = await client.db( this.databaseName ).collection( this.collectionName )

        await collection.insertOne(this.param)
                .then(res => {
                    console.log("inserted",res.result)
                    this.id = res.insertedId
                } )
                .catch(err => console.error(err))
                .then( () => { if(client) client.close() } )
        return this.id
    }

    async updateScenario(id) {
        if(id == null) return false

        const client     = await this.mongo.connect( this.url , { useNewUrlParser: true } )
        const collection = await client.db( this.databaseName ).collection( this.collectionName )
        const ObjectId = require('mongodb').ObjectID;

        // db.コレクション名.update({検索条件}, {更新内容})
        var result = null;
        console.log("update params",this.param)
        await collection.updateOne({"_id": ObjectId(id)}, {$set: this.param} )
                .then(res => {
                    if( res.result.nModified !== 1 ) throw new Error( 'update is failed!!' )
                } )
                .catch(err => console.error(err))
                .then( () => {
                    if(client) client.close()
                    result = true
                } )
        return result
    }

    async deleteScenario(id) {
        if(id == null) return false

        const client     = await this.mongo.connect( this.url , { useNewUrlParser: true } )
        const collection = await client.db( this.databaseName ).collection( this.collectionName )
        const ObjectId = require('mongodb').ObjectID;

        var result = null;
        await collection.updateOne({"_id": ObjectId(id)}, {$set: { delete: true } } )
                .then(res => {
                    console.log(res.result)
                    if( res.result.nModified !== 1 ) throw new Error( `[${id}] update is failed!!` )
                } )
                .catch(err => console.error(err))
                .then( () => {
                    if(client) client.close()
                    result = true
                } )
        return result
    }

    setRegisterParameter( param ) {
        if( typeof param === "object" ) {
            this.param = {}
            // url
            if( typeof param.url !== 'undefined' ) {
                this.param.url = ( param.url ) ? param.url.trim() : null
            }
            // dir
            if( typeof param.dir !== 'undefined' ) {
                this.param.dir = ( param.dir ) ? param.dir.trim() : null
            }
            // name
            if( typeof param.name !== 'undefined' ) {
                this.param.name = ( param.name ) ? param.name.trim() : null
            }
            // date
            if( typeof param.date !== 'undefined' ) {
                if( param.date ){
                    const tmpData = param.date.trim().replace( /\//g , "-" )
                    this.param.date = new Date( `${tmpData}T00:00:00+09:00` )
                } else {
                    this.param.date = null
                }
                // this.param.date = ( param.date ) ? param.date.trim().replace( /\//g , "-" ) : null
            }
            // notify
            if( typeof param.notify !== 'undefined' ) {
                this.param.notify = ( param.notify ) ? param.notify : null
            }
            // mail
            if( typeof param.mail !== 'undefined' ) {
                this.param.mail = ( param.mail ) ? param.mail.trim() : null
            }
            // interval
            if( typeof param.interval !== 'undefined' ) {
                this.param.interval = ( param.interval ) ? parseInt( param.interval ) : null
            }
            // actions
            if( typeof param.actions !== 'undefined' ) {
                this.param.actions = ( param.actions ) ? param.actions : null
            }
            // delete
            if( typeof param.url !== 'undefined' ) {
                this.param.delete = ( param.delete ) ? true : false
            }
        }else{
            console.error("not object", param)
        }
    }

    validateRegisterParameter(){
        // console.log( "validation" )
        this.errors = []

        if( this.param != null && typeof this.param !== "object" ) {
            this.errors.push( "not object" )
            return false
        }

        if( ! this.param.url || ! /^(https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)$/.exec( this.param.url ) ) {
            this.errors.push( "URLが正しくありません: " + this.param.url )
        }

        if( ! this.param.name ) {
            this.errors.push( "シナリオ名が正しくありません: " + this.param.name )
        }

        // if( ! this.param.date || ! /^\d{4}-\d{1,2}-\d{1,2}$/.exec( this.param.date )  ) {
        if ( ! this.param.date instanceof Date) {
            this.errors.push( "日付が正しくありません: " + this.param.date )
        }

        if( ! this.param.notify || ! Array.isArray(this.param.notify) ) {
            this.errors.push( "通知フラグが正しくありません: " + this.param.notify )
        }

        if( ! this.param.mail || ! /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.exec( this.param.mail ) ) {
            this.errors.push( "メールが正しくありません: " + this.param.mail )
        }

        if( ! this.param.interval || ! this.param.interval > 0  ) {
            this.errors.push( "期間の値が正しくありません: " + this.param.interval )
        }

        if( ! this.param.actions || ! Array.isArray(this.param.actions) ) {
            this.errors.push( "アクション内容が正しくありません: " + this.param.actions )
        }

        return ( this.errors.length === 0 )
    }

    async createNewScenarioDirectory(scenarioId, temporaryDir){
        var fs = require('fs')
        var mkdirp = require('mkdirp')
        var path = require('path');

        const baseDir = path.resolve( "./public_html/data" )

        const toDir = `${baseDir}/scenario/${scenarioId}/${temporaryDir}`
        const fromDir = `${baseDir}/tmp/${temporaryDir}`

        this.renamedDir = toDir

        await mkdirp.sync(toDir)
        console.log("mkdir ${toDir}".bgCyan)
        console.log("rename ${fromDir} to ${toDir}".bgCyan)
        await fs.renameSync(fromDir, toDir)
        console.log("rename end".bgGreen)
        return true
    }
}

// module.exports = new Scenario();
module.exports = Scenario;
