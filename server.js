'use strict'
const express = require('express')
const app = express()
const port = 8001
const bodyParser = require('body-parser')

class Logger{
	constructor(log=null){
        console.log("logger constructed")
        this._log = log
    }
    set log(log) {
        this._log = log
      }
    get log() {
        return this._log
    }
}

var msg = 'initializing...' ;
var logger = new Logger(msg);

// var scraper = require('./application/scraper' ) ;

console.log(logger)

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('./public_html/'))
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS, HEAD');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Max-Age', '86400');
    next();
})
app.listen( port , () => {
  console.log('Express Server listened', port)
} )

// OPTIONSメソッドの実装
app.options('/api/*', function (req, res) {
  res.sendStatus(200);
});

app.get( '/api/scrape' , async function( req, res ) {
  // URLパラメタが空でなければ画面に表示
  let url = null
  if ( req.query.url ) {
    url = req.query.url
    // thanks https://medium.com/@iaincollins/how-not-to-create-a-singleton-in-node-js-bd7fde5361f5

    const Scraper = require('./application/scraper' ) ;
    const s = new Scraper();

    // 一時的なクロール
    await s.temporaryScrape( req.query.url )
    await s.closeBrowser()

    res.send( { url: url , result: s.save_dir_name } )
  }
} )

// シナリオリスト取得
app.get( '/api/scenarios' , async function( req, res ) {
    const Scenario = require( './application/scenario' )
    const s = new Scenario();

    const skip  = ( parseInt( req.query.page ) -1) * parseInt( req.query.size )
    const limit = parseInt( req.query.size )

    const multiSearch = ( req.query ) ? req.query.multiSearch : null

    const result = await s.getScenarios( {
        sort: ( (req.query.sort)? req.query.sort : null ) ,
        skip: skip ,
        limit: limit ,
        multiSearch: multiSearch,
        active: true
    } )
    res.json( result ) ;
} )

// シナリオ取得
app.get( '/api/scenario' , async function( req, res ) {
    // console.log( "scenario get",req.body,req.query)
    if (req.query.id) {
        const Scenario = require( './application/scenario' )
        const s = new Scenario();

        const result = await s.getScenario(req.query.id)
        // console.log( "end",result )
        if( result ){
            res.json( result )
        }else{
            res.sendStatus(400).send("Bad Request")
        }
    }
} )

// シナリオの登録
app.post( '/api/scenario' , async function( req, res ) {
    if (req.body) {
        const Scenario = require( './application/scenario' )
        const s = new Scenario();

        s.setRegisterParameter(req.body)

        if ( s.validateRegisterParameter() ) {
            const resultScenarioId = await s.addScenario();

            // スケジュール追加
            const Scheduler = require( './application/scheduler' )
            const scdl = new Scheduler();
            // 予定日は現日付を採用
            const scheduleParam = { scenarioId: resultScenarioId , scheduled: new Date() }
            scdl.setRegisterParameter( scheduleParam ) // `${y}-${m}-${d}` }  )
            const addResultScheduleId = await scdl.addSchedule()
            console.log('addResult', addResultScheduleId)

            // 一時保存したフォルダを戻り値のIDでフォルダを作りそこにコピー
            await s.createNewScenarioDirectory(resultScenarioId, req.body.dir)

            // コピー後に、部分htmlを取り出し
            const Scraper = require('./application/scraper' ) ;
            const scrp = new Scraper();
            await scrp.partialExtraction( s.renamedDir , req.body.actions)

            // スケジュール更新 exec, done , saveをセットしてアップデートする
            scheduleParam.executed = new Date()
            scheduleParam.done = new Date()
            scheduleParam.saveDir = req.body.dir
            scdl.setRegisterParameter( scheduleParam )
            const updateResult = await scdl.updateSchedule(addResultScheduleId)
            if (!updateResult) throw new Error(`schedule updating error`)
            console.log( "updateResult",updateResult)

            res.json( { id: resultScenarioId, error: null } )
        } else {
            console.log( s.errors )
            res.json( { id: null, error: s.errors } )
        }
    }
} )

// シナリオの更新
app.put( '/api/scenario' , async function( req, res ) {
    console.log(req.body)
    if (req.body && req.body.id) {
        const Scenario = require( './application/scenario' )
        const s = new Scenario();

        s.setRegisterParameter(req.body)

        if ( s.validateRegisterParameter() ) {
            const result = await s.updateScenario(req.body.id);
            if( result ){
                res.json( { id: req.body.id, error: null } )
            }else{
                res.json( { id: null, error: s.errors } )
            }
        } else {
            console.log( s.errors )
            res.json( { id: null, error: s.errors } )
        }
    } else {
        res.status(400).send("Bad Request")
    }
} )

// シナリオの削除
app.delete( '/api/scenario/:id' , async function( req, res ) {
    if (req.params.id) {
        const Scenario = require( './application/scenario' )
        const s = new Scenario();

        // 実際は論理削除
        const result = await s.deleteScenario(req.params.id);
        if( result ){
            res.json( { id: req.params.id, error: null } )
        }else{
            res.json( { id: null, error: s.errors } )
        }

    } else {
        res.status(400).send("Bad Request")
    }
} )

// スケジュール取得

app.get( '/api/schedules/:scenarioId/recent', async function (req, res) {
    // 直近の２件を取得
    try{
        const Scheduler = require( './application/scheduler' )
        const scdl = new Scheduler()
        // console.log( "scenario id =",req.params.scenarioId)
        scdl.setSearchParameter( {scenarioId: req.params.scenarioId} )
        const result = await scdl.getSchedules( { skip:0, limit: 2, sort: {done: -1} } )
        res.json( result.data )
    } catch( err ) {
        console.log( "error" , err);
        res.sendStatus(400).send("BadRequest")
    }
} )

// スケジュール取得
app.get( '/api/schedule/:scenarioId/:id', function (req, res) {
    try{
        console.log( req.params.scenarioId, req.params.id)
    } catch( err ) {
        console.log( "error" , err);
    } finally{
        // 結果を返答
        res.send("end")
    }
} )

// 即時スケジュール追加
app.post( '/api/schedule/now', async function (req, res) {
    // console.log(req.body)
    try{
        if (!req.body.id) {
            throw new Error("no id")
        }
        const scenarioId = req.body.id

        const Scraper = require('./application/scraper' ) ;
        const s = new Scraper();
        await s.immediatelyScrape(scenarioId)
    } catch( err ) {
        console.error( "error".bgRed , err);
    } finally {
        // 結果を返答
        res.send("end")
    }
} )

app.get( '/api/scrapper/status', function( req, res ) {
    console.log( req.query )
} )

app.get( '/api/review' , async function( req, res ) {
    console.log( "review get",req.body,req.query)
    res.send("hoge")
} )

app.get( '/api/diff' , async function( req, res ) {
    const id = req.query.id
    const after = req.query.after
    const before = req.query.before

    const Differ = require('./application/differ' ) ;
    const dffr = new Differ();

    await dffr.getDiffFile(id, before, after)
              .then( response => {
                res.send(response)
              })
              .catch( err => {
                console.error(__filename, err)
                if( err.code === 'ENOENT'){
                    res.status(404).send("Not Found")
                }else{
                    res.status(400).send("Bad Request")
                }
              } )
} )


app.post( '/api/diff' , async function( req, res ) {
    const id = req.body.scenarioId
    const after = req.body.after
    const before = req.body.before

    const Differ = require('./application/differ' ) ;
    const dffr = new Differ();

    // 5.1.1 フルテキスト差分
    const scenarioBasePath = `${process.cwd()}/public_html/data/scenario/${id}`

    const diffedFilePath = `${scenarioBasePath}/${before}/index.html`
    const differFilePath = `${scenarioBasePath}/${after}/index.html`
    const outputPath = `${scenarioBasePath}/${after}/diff_${before}.txt`
    await dffr.diffFull(diffedFilePath, differFilePath, outputPath)
              .then( response => {
                console.log("response",response)
                res.status(200).send(response)
              })
              .catch( err => {
                console.error(__filename, err)
                if( err.code === 'ENOENT'){
                    res.status(404).send("Not Found")
                }else{
                    res.status(400).send("Bad Request")
                }
              } )

    /*
    await dffr.getDiffFile(id, before, after)
              .then( response => {
                res.send(response)
              })
              .catch( err => {
                console.error(__filename, err)
                if( err.code === 'ENOENT'){
                    res.status(404).send("Not Found")
                }else{
                    res.status(400).send("BadRequest")
                }
              } )
              */
} )