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
                    this.outputLabel('*',err.toString(),"bgYellow")
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
                    if( res.data == null || ! res.data.length > 0 ) throw new Error( `Error`)
                    const toList = []
                    // console.log(res.data)
                    for( let v of res.data ) {
                        toList.push( await this.scnr.checkDiff(v.scenarioId, v.saveDir) )
                    }
                    return toList
                } )
                .then( res => {
                    if( res == null || ! res.length > 0 ) throw new Error( `Error`)

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
                .then( res => {
                    if( res == null || ! res.length > 0 ) throw new Error( `Error`)

                    const mailList = []
                    const getMessage = (n,d) => {
                        const bin = n.reduce( (p,c) => p+c );
                        const msg = []
                        if( bin & 1 === 1 && d.page ) {
                            msg.push("ページ差分あり")
                        }
                        if( bin & 2 === 2 && d.part ) {
                            msg.push("ページ部分差分あり")
                        }
                        if( bin & 4 === 4 && d.image ) {
                            msg.push("画像差分あり")
                        }
                        return (msg.length>0) ? msg : null
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
                .then( res => {
                    if( res == null ) throw new Error( `Error`)

                    for( let i in res ) {
                        console.log(`${i} に対するメール`)
                        res[i].forEach( r => {
                            console.log(`${r.name} のクロール結果`)
                            console.log(r.message.join("\n"))
                        })
                    }

                })
                .catch( err => {
                    this.outputLabel('*',err.toString(),"bgRed")
                    console.error(err)
                } )
        return result
    }
}

module.exports = Routine
