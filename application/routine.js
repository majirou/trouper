class Routine {
    constructor () {
      const Scenario = require('./scenario' ) ;
      this.scnr = new Scenario();
      this.colors = require('colors')
    }

    // 本日処理する予定のシナリオリストを作成
    async getTodaysScenarioList () {
        // 実行した日時をディレクトリ名にして作成
        const dt = new Date()
        const y = dt.getFullYear()
        const m = ('00' + (dt.getMonth() + 1)).slice(-2)
        const d = ('00' + dt.getDate()).slice(-2)
        const today = `${y}-${m}-${d}`
        const param = {
            "date" : {
                // "$gte" : new Date(`${today}T00:00:00+09:00`),
                "$lte" : new Date(`${today}T23:59:59+09:00`)
            },
            "skip" : 0,
            "limit": 100
        }
        return await this.scnr.getScenarios( param )
    }

    async registerSchedule (param) {
        const Scheduler = require('./scheduler' ) ;
        const scdl = new Scheduler();
        await scdl.setRegisterParameter(param)
        const id = await scdl.addSchedule()
        // console.log("registerSchedule", id)
        return id;
    }
    async removeNotExecuted () {
        const Scheduler = require('./scheduler' ) ;
        const scdl = new Scheduler();
        const result = await scdl.deleteNotExecutedSchedule()
        return result
    }
    async getNotPlayedSchedule () {
        const param = {
            "executed" : null
        }
        const Scheduler = require('./scheduler' ) ;
        const scdl = new Scheduler();
        await scdl.setSearchParameter(param)
        const result = await scdl.getSchedules( {sort:{scheduled: 1},limit:100,skip:0});
        return result
    }

    outputLabel (char,text,color) {
        const count = process.stdout.columns
        const barBase = char.repeat(count)[color]
        const bar = barBase[color]
        const msg = text[color]
        console.log( bar )
        console.log( msg + " ".repeat(count - text.length)[color])
        console.log( bar )
    }

    async routineScrape () {
        const Scraper = require('./scraper' ) ;
        this.scrp = new Scraper();

        await this.getTodaysScenarioList()
            .then( async res =>  {
                if( res.data == null || ! res.data.length > 0 ) throw new RangeError("no schedule")
                this.outputLabel('*',res.data[0].date.toString(),"bgBlue")
                return res.data[0]
            })
          　.then(async data => {
                this.outputLabel('*','scraping...',"bgBlue")
                // console.log(data)
                if (data._id == null ) throw new Error("no id")
                await this.scrp.immediatelyScrape(data._id)
                return data
            })
            .then(async data => {
                this.outputLabel('*','scheduleing...',"bgBlue")
                // 次回予定日の計算
                const date = new Date(data.date)
                if( data.interval === 1 ){ // a week
                    date.setDate(date.getDate() + 7);
                } else if ( data.interval === 2 ){ // a month
                    date.setMonth(date.getMonth() + 1);
                } else { // unknown
                    throw new Error( `unknown interval ${data.interval}`)
                }
                const y = date.getFullYear()
                const m = date.getMonth()+1
                const d = date.getDate()
                console.log( data.date , "to" , date )
                // 更新
                const scenarioData = { date: `${y}-${m}-${d}` }
                this.scnr.setRegisterParameter( scenarioData )
                this.scnr
                    .updateScenario(data._id)
                    .then( res => {
                        console.log("update scenario",res)
                    })
                return true
            })
            .catch( err => {
                if (err instanceof RangeError) {
                    this.outputLabel('*',err.toString(),"yellow")
                } else {
                    this.outputLabel('*',err.toString(),"bgRed")
                    console.error(err)
                }
            } )
    }

    async routineNotify () {
        const param = {
            "notified" : null
        }
        const Scheduler = require('./scheduler' ) ;
        const scdl = new Scheduler();
        await scdl.setSearchParameter(param)
        const result =
            await scdl.getSchedules(
                    {sort:{scheduled: 1},limit:100,skip:0}
                )
                .then( async res => {
                    if( res.data == null || ! res.data.length > 0 ) throw new RangeError( `No targets Error`)
                    const toList = []
                    // console.log(res.data)
                    for( let v of res.data ) {
                        toList.push( await this.scnr.checkDiff(v.scenarioId, v.saveDir) )
                    }
                    return toList
                } )
                .then( async res => {
                    if( res == null || ! res.length > 0 ) throw new RangeError( `No diffs Error`)

                    const countDiff = arr => {
                        let counter = 0
                        for(let i in arr ) {
                            if( arr.hasOwnProperty(i) && arr[i] === true) {
                                counter++;
                            }
                        }
                        return ( counter > 0 )
                    }
                    return res.filter( r => countDiff(r.diff) )
                } )
                .then( async res => {
                    if( res == null || ! res.length > 0 ) throw new RangeError( `No diff Error` )

                    const mailList = []
                    const getMessage = (n,d) => {
                        const bin = n.reduce( (p,c) => p+c );
                        const msg = []
                        if( ( ( bin & 1 ) === 1) && d.page ) {
                            msg.push("ページ差分あり")
                        }
                        if( ( ( bin & 2 ) === 2 ) && d.part ) {
                            msg.push("ページ部分差分あり")
                        }
                        if( ( ( bin & 4 ) === 4 ) && d.image ) {
                            msg.push("画像差分あり")
                        }
                        return (msg.length > 0) ? msg : null
                    }
                    for( let v of res ){
                        if( mailList[v.mail] == null ) mailList[v.mail] = []
                        mailList[v.mail].push({
                            dir: v.dir,
                            name: v.name,
                            id: v._id,
                            message: getMessage(v.notify, v.diff)
                        })
                    }
                    return mailList
                } )
                .then( async res => {
                    if( res == null ) throw new Error( `Error`)

                    const transporterConfig = require('../config/transporter.js').config
                    // mailerによるメール送信
                    const nodemailer = require('nodemailer');
                    const transporter = nodemailer.createTransport(transporterConfig)

                    const sendmail = async (subject,to,text,) => {
                      const mailOptions = {
                        to,
                        subject,
                        text,
                        sender: 'Sender Name <sender-mail-addr>',
                      }

                      await transporter.sendMail( mailOptions , (error, result ) => {
                        if(error){
                          console.error(error.message);
                          return;
                        }
                        console.log( result );
                      })
                    }

                    let body = null
                    for( let i in res ) {
                        console.log(`${i} に対するメール`)
                        body = []
                        res[i].forEach( r => {
                            if ( r.message != null && Array.isArray(r.message) ) {
                                body.push(`「${r.name} 」のクロール結果`)
                                body.push(`${baseUrl}/review/${r.id}`)
                                body.push(r.message.join("\n"))
                                body.push('\n')
                            }
                        })
                        if( body != null && body.length > 0 ){
                            await sendmail('スクレイピング通知', i, body.join('\n'))
                        }
                    }
                })
                .then( async res => {
                    console.log("update notified timestamp")
                    await scdl.updateNotified()
                    console.log("updated notified timestamp")
                } )
                .catch( err => {
                    if (err instanceof RangeError) {
                        this.outputLabel('*',err.toString(),"yellow")
                    } else {
                        this.outputLabel('*',err.toString(),"bgRed")
                        console.error(err)
                    }
                } )
        return result
    }

    async sweepScenarios () {
        // シナリオで削除(delete=true)となっている対象をひろいます。
        const scenariosResult = await this.scnr.getScenarios({delete: true})
        if( scenariosResult.data.length > 0 ) {
            const fs = require('fs-extra')
            const scenarioDir = process.cwd() + '/public_html/data/scenario'
            for ( let s of scenariosResult.data ) {
                console.log(`REMOVING SCENARIO: ${scenarioDir}/${s._id}`.bgRed)
                fs.remove( `${scenarioDir}/${s._id}`, err => {
                    if ( err != null) {
                        console.error( err )
                    } else {
                        this.scnr.physicalDeleteScenario(s._id)
                    }
                })
            }
        }
    }

    async sweepSchedules () {
        // スケジュールで無効化になっているものを対象にし、削除
        const Scheduler = require('./scheduler' ) ;
        const scdl = new Scheduler();

        scdl.setSearchParameter({ voided: { $ne: null } })
        const scheduleResult = await scdl.getSchedules()
        if( scheduleResult.data.length > 0 ) {
            const fs = require('fs-extra')
            const scheduleDir = process.cwd() + '/public_html/data/scenario'
            for ( let s of scheduleResult.data ) {
                console.log(`REMOVING SCHEDULE: ${scheduleDir}/${s.scenarioId}/${s.saveDir}`.bgRed)
                fs.remove( `${scheduleDir}/${s.scenarioId}/${s.saveDir}`, err => {
                    if ( err != null) {
                        console.error( err )
                    } else {
                        scdl.physicalDeleteSchedule(s._id)
                    }
                })
            }
        }
    }
}

module.exports = Routine
