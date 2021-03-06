class Scraper {
    constructor () {
      this.fs = require('fs')
      this.mkdirp = require('mkdirp')
      this.browser = null
      this.currentText = null
      this.created = Date.now()
      this.colors = require('colors')
      console.log(`Scraper Constructed @ ${this.created}`.bgGreen)
    }

    createTemporaryDir () {
      // 実行した日時をディレクトリ名にして作成
      const dt = new Date()
      this.save_dir_name = dt.getFullYear() +
                             ('00' + (dt.getMonth() + 1)).slice(-2) +
                             ('00' + dt.getDate()).slice(-2) +
                             ('00' + dt.getHours()).slice(-2) +
                             ('00' + dt.getMinutes()).slice(-2) +
                             ('00' + dt.getSeconds()).slice(-2)

      // console.log( this.save_dir_name ) ;
      this.save_path = `${process.cwd()}/public_html/data/tmp/${this.save_dir_name}`

      this.fs.mkdir(this.save_path, function (err) {
        if (err) console.error(err)
      })
    }

    getCurrentText () {
      return this.currentText
    }

    async closeBrowser () {
      await this.browser.close()
      console.log('ブラウザ終了'.bgGreen)
    }

    replaceUrl (src, hostname, pathname) {
      // console.log("ORIGINAL",src)
      let target
      // reqUrl が https://hoge.piyo/index.htmlとかの場合、ファイル名がフォルダになるのでとばす
      // let base = `${parsedUrl.hostname}/${parsedUrl.pathname}`
      let base = `${hostname}/${pathname}`
      if (!base.match(/\/$/)) {
        base = base.split('/')
        base.pop()
        base = base.join('/')
      }

      if (src.match(/^[.]{1,2}\//)) {
        // ./ ../ にマッチする場合は、現リクエストを足す
        target = `${base}/${src}`.split('/')
      } else if (src.match(/^(http|https):\/\//)) {
        // httpなどプロトコル始まりは, プロトコルを飛ばす
        // console.log(target)
        target = src.split('/')
        target.shift() // httpなどのプロトコル部分を外す
      } else if (src.match(/^\/\//)) {
        // // にマッチする場合は、プロトコル略記なので、ドメイン部分から開始しているので // の / を飛ばす
        target = src.split('/')
        target.shift()
        target.shift()
      } else if (src.match(/^\//)) {
        // / にマッチする場合は、base でなくホストを足す
        target = `${hostname}/${src}`.split('/')
      } else { // img/peace.svg のような直下ディレクトリ名直の場合
        target = `${base}/${src}`.split('/')
      }

      // console.log( `${src} TO ${target}`)

      let filename = target.pop()
      filename = filename.split('?')[0]
      const outputPath = target.join('/')
        .replace(/:/g, '_') // ポート部分をアンダースコアに
        // .replace(/\./g, '_') // ドット文字もアンダースコアに

      return (`./${outputPath}/${filename}`).replace(/\/\/+/g, '/')
    }

    async temporaryScrape (reqUrl) {
      process.on('unhandledRejection', console.dir)

      var url = require('url')
      var parsedUrl = url.parse(reqUrl)
      // var parsedUrl = url.URL(reqUrl)
      var path = require('path')

      this.currentText = 'start scraping...'
      // ref) https://qiita.com/syuilo/items/0800d7e44e93203c7285

      try {
        const pptr = require('puppeteer')

        this.createTemporaryDir()
        this.browser = await pptr.launch({
          args: [ '--lang=ja,en-US,en',
            '--no-sandbox',
            '--disable-setuid-sandbox'
          ],
          headless: true,
          ignoreHTTPSErrors: true
        })
        console.log('START')
        const page = await this.browser.newPage()

        // reponse イベント
        page.on('request', req => {
          try {
            if (req.resourceType() === 'script') {
              console.log('aborted', req.resourceType(), req.url())
              req.abort()
            } else {
              process.stdout.write(' '.repeat(process.stdout.columns) + '\r')
              process.stdout.write(`GET ${req.resourceType()} > ${req.url()}\r`)
              req.continue()
            }
          } catch (err) {
            console.error(req.resourceType() + ' ' + req.url())
          }
        })

        page.on('response', async (res) => {
          try {
            const parsedUrl = url.parse(res.url()) // res.urlはどうやらフルパスらしい。
            // const parsedUrl = url.URL(res.url()) // res.urlはどうやらフルパスらしい。
            // console.log(res.url(),parsedUrl.href)
            const resExt = path.extname(parsedUrl.pathname)
            // const resHost = parsedUrl.hostname

            // console.log(parsedUrl, resExt, resHost );
            // https://www.google-analytics.com

            let contentType = res.headers()[ 'content-type' ]
            if (contentType && contentType.indexOf(';' > 0)) {
              // text/css; charset=utf8 のような書き方への対応
              contentType = contentType.split(';')[0]
            }
            this.currentText = 'GET > (' + contentType + ') ' + parsedUrl.href
            switch (contentType) {
              case 'application/json':
              case 'application/javascript':
              case 'application/x-javascript':
              case 'application/xml':
              case 'application/rss+xml':
              case 'text/javascript':
              case 'undefined':
                console.log('PASSED > ', contentType, parsedUrl.href)
                break
              case 'image/png':
              case 'image/jpeg':
              case 'image/gif':
              case 'image/webp':
              case 'image/bmp':
              case 'image/svg+xml':
              case 'text/css':
              case 'font/woff2':
              case 'font/woff':
              case 'font/ttf':
              case 'font/opentype':
              case 'video/mp4':
              case 'application/font-woff2':
              case 'application/gif':
              default:
                // image/svg+xml data:image/svg+xml;base64,PHN2ZyBzdHlsZ.......
                if (/^data:/.exec(reqUrl)) {
                  console.log('base64ed data')
                } else {
                  const dirs = parsedUrl.pathname.split('/')
                  const filename = (resExt === '') ? 'noname' : dirs.pop()
                  const outputPath = parsedUrl.host
                                              // .replace(/\./g, '_')
                                              .replace(/:/g, '_') + // ドットとポート番号をアンダースコアに
                                              dirs.join('/')
                  const targetPath = (this.save_path + '/' + outputPath + '/').replace(/\/\/+/g, '/')

                  res.url()
                  const buffer = await res.buffer()

                  this.mkdirp(targetPath, (err) => {
                    if (err) {
                      if (err.code === 'ENAMETOOLONG') {
                      } else {
                        console.log('mkdirp: ' + err)
                      }
                    } else {
                      let output = targetPath + filename
                      this.fs.writeFile(output, buffer, (err) => {
                        // 書き出しに失敗した場合
                        if (err) {
                          if (err.code === 'EISDIR') {
                            // すでにディレクトリをファイルとして書き込もうとしている？
                            this.fs.writeFile(output + '/noname', buffer, (err) => {
                              if (err) {
                                console.log('エラーが発生しました。', err)
                              } else {

                              }
                            })
                          } else if (err.code === 'ENAMETOOLONG') {
                            // 何もしない
                          } else {
                            console.log('エラーが発生しました。', err)
                          }
                        }
                      })
                    }
                  })
                }
                break
                              // case "text/html":
                              // case "text/plain":
            }
          } catch (err) {
            console.log(err.message.red, res.url())
            console.error(err)
          }
        })

        await page.setRequestInterception(true)

        // 画面サイズ
        await page.setViewport({ width: 1024, height: 800 })
        // ユーザーエージェント
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36')
        // ページ移動
        await page.goto(reqUrl, { waitUntil: 'networkidle2', timeout: 60000 })
        // await page.waitForNavigation();
        // await page.goto( reqUrl , {waitUntil: "domcontentloaded",timeout:90000} ) ;
        // ページタイトル取得
        console.log('\nページ移動後の、タイトル取得：' + await page.title())

        // スクリーンショット
        await page.screenshot({ path: this.save_path + '/screenshot.png', fullPage: true })

        var html = await page.evaluate(rebase => {
          const html = document.getElementsByTagName('html')[0]

          // script タグを削除（理由：動的な部分は本スクレイピングでは無視する）
          // 余分なanalyticsなどを稼働させないため
          const scriptTag = html.getElementsByTagName('script')
          // 削除なので逆から行う
          for (let i = (scriptTag.length - 1); i >= 0; i--) {
            scriptTag[i].parentNode.removeChild(scriptTag[i])
          }
          // base タグを削除（理由：ローカル保存先をベースにするため）
          const baseTag = html.getElementsByTagName('base')
          // 削除なので逆から行う
          for (let i = (baseTag.length - 1); i >= 0; i--) {
            baseTag[i].parentNode.removeChild(baseTag[i])
          }

          // a タグの href を絶対URIに変更して、ローカルに合わせる
          const aTag = html.getElementsByTagName('a')
          for (let i in aTag) {
            if (aTag[i].href) {
              aTag[i].value = aTag[i].href
              aTag[i].removeAttribute('href')
            }
          }
          // 最終的なHTML
          const resultHtml = document.createElement('html')
          resultHtml.lang = document.documentElement.lang
          resultHtml.innerHTML = html.innerHTML
          return resultHtml.outerHTML
        }, this.save_path)

        // prettyしてoriginal htmlとして出力
        await this.fs.writeFileSync(`${this.save_path}/original.html`, html)
      } catch (err) {
        console.error(err)
        return false
      } finally {
        // 終了
        // console.log('finally'.bgRed)
        const preloadFile = this.fs.readFileSync(`${this.save_path}/original.html`, 'utf8')
        const cheerio = require('cheerio')
        const $ = cheerio.load(preloadFile, { decodeEntities: false })
        // thanks http://info-i.net/cheerio-decodeentities
        // img タグのsrcを絶対URIに変更して、ローカルに合わせる
        $('img').each((i, elem) => {
          const src = elem.attribs.src
          if (src && !src.match(/^data:/)) {
            elem.attribs.src = this.replaceUrl(src, parsedUrl.hostname, parsedUrl.pathname)
          }
          const srcset = elem.attribs.srcset
          if (srcset && !srcset.match(/^data:/)) {
            elem.attribs.srcset = this.replaceUrl(srcset, parsedUrl.hostname, parsedUrl.pathname)
          }
        })

        $('link').each((i, elem) => {
          const href = elem.attribs.href
          if (href && !href.match(/^data:/)) {
            elem.attribs.href = this.replaceUrl(href, parsedUrl.hostname, parsedUrl.pathname)
          }
        })

        // iframe タグのsrcを無効化
        $('iframe').each((i, elem) => {
          elem.attribs.src = ''
        })

        // common.js をつける for iframe messaging
        $('head').append('<script src="/data/common.js"></script>')
        // common.css をつける
        $('head').append('<link rel="stylesheet" href="/data/common.css">')

        const pretty = require('pretty')
        await this.fs.writeFileSync(
          `${this.save_path}/index.html`,
          pretty($.html(), { ocd: true })
        )
        console.log('\nスクレイピング終了'.bgGreen)
        return true
      }
    }

    async scheduledScrape (scenarioId) {
      await this._scrape(scenarioId)
        .then( async res => {
          console.log( "scheduled scraped.".bgCyan)
          await this._diff(res)
          return res
        } )
        .then( async res => {
          // scenarioのdirを修正
          // const dt = new Date();
          const scenarioData = {
              dir: this.save_dir_name,
              // date: dt.getFullYear() + ("00" + (dt.getMonth()+1)).slice(-2) + ("00" + dt.getDate() ).slice(-2),
              execute: null
          }

          const Scenario = require( `${process.cwd()}/application/scenario` )
          const scnr = new Scenario();
          scnr.setRegisterParameter( scenarioData )
          const updateScenarioResult = await scnr.updateScenario(scenarioId)
          if (!updateScenarioResult) throw new Error(`scenario updating error`)
          console.log( "updateScenarioResult".bgCyan, updateScenarioResult)
        })
        .catch( err => {
          console.error(__filename, err)
        } )
    }

    async _diff (res) {
      const to = `${res.scenarioBasePath}/${res.newScheduleParam.saveDir}/`
      const from = res.scrapedResult.temporarySavePath

      await this.mkdirp(to, async err => {
        if(err) throw new Error(err)
        // renameし、diff対応
        await this.fs.rename( from, to, async err => {
            process.stdout.write( `rename from ${from}\n to ${to}¥n`.bgCyan)
            if(err) throw new Error(err)
            // console.log("\n...done")

            const Differ = require( `${process.cwd()}/application/differ` ) ;
            const dffr = new Differ();

            const oldDir = `${res.scenarioBasePath}/${res.scenario.dir}`
            const newDir = `${res.scenarioBasePath}/${res.newScheduleParam.saveDir}`

            // page-diff
            console.log("page-diff")
            const oldFilePath = `${oldDir}/index.html`
            const newFilePath = `${newDir}/index.html`
            const outputPath  = `${newDir}/diff_${res.scenario.dir}.txt`
            await dffr.diffFull(oldFilePath, newFilePath, outputPath)

            // image-diff
            console.log("image-diff")
            const oldImageFilePath = `${oldDir}/screenshot.png`
            const newImageFilePath = `${newDir}/screenshot.png`
            const outputImagePath  = `${newDir}/diff_image_${res.scenario.dir}.png`
            await dffr.diffImage(oldImageFilePath, newImageFilePath, outputImagePath)

            // part-diff
            console.log("part-diff")
            await this.partialExtraction( to , res.scenario.actions )
            .then( async r => {
                const oldFilePath = `${oldDir}/parts.html`
                const newFilePath = `${newDir}/parts.html`
                const outputPath  = `${newDir}/diff_parts_${res.scenario.dir}.txt`
                await dffr.diffFull (oldFilePath, newFilePath, outputPath)
            })
        } )
        console.log("fs.renamed...".bgCyan)
      } )
    }

    async immediatelyScrape (scenarioId) {
      await this
        ._scrape(scenarioId)
        .then( async res => {
          console.log( "immediately scraped.".bgCyan)
          await this._diff(res)
          return res
        } )
        .then( async res => {
          // scenarioのdirを修正
          const dt = new Date();
          const scenarioData = {
              dir: this.save_dir_name,
              // date: dt.getFullYear() + ("00" + (dt.getMonth()+1)).slice(-2) + ("00" + dt.getDate() ).slice(-2),
              execute: null
          }

          const Scenario = require( `${process.cwd()}/application/scenario` )
          const scnr = new Scenario();
          scnr.setRegisterParameter( scenarioData )
          const updateScenarioResult = await scnr.updateScenario(scenarioId)
          if (!updateScenarioResult) throw new Error(`scenario updating error`)
          console.log( "updateScenarioResult".bgCyan, updateScenarioResult)
        })
        .catch( err => {
          console.error(__filename, err)
        } )
    }

    async _scrape (scenarioId) {
      const Scenario = require(`${process.cwd()}/application/scenario`)
      const scnr = new Scenario()
      const Scheduler = require(`${process.cwd()}/application/scheduler`)
      const scdl = new Scheduler()

      const scenarioBasePath = `${process.cwd()}/public_html/data/scenario/${scenarioId}`

      // 1.scenarioを取得
      const scenarioResult = await scnr.getScenario(scenarioId)
      if (!scenarioResult) {
        throw new Error(`no scenario @ ${scenarioId}`)
      }
      console.log('scenarioResult', scenarioResult)
      // 1.5 scenario に 実行中フラグを追加
      scnr.setRegisterParameter( { execute: true } )
      const updateScenarioResult = await scnr.updateScenario(scenarioId)
      if (!updateScenarioResult) throw new Error(`scenario updating error`)
      console.log( "updateScenarioResult".bgCyan, updateScenarioResult)

      // 2. スケジュール追加
      const scheduleParam = { scenarioId: scenarioId, scheduled: new Date() }
      scdl.setRegisterParameter(scheduleParam) // `${y}-${m}-${d}` }  )
      const addResultScheduleId = await scdl.addSchedule()
      console.log('addResult', addResultScheduleId)

      // 3. スクレイプ開始
      const executed = new Date()
      const scrapingResult = await this.temporaryScrape(scenarioResult.url)
      console.log('scrapingResult', scrapingResult)
      await this.closeBrowser()
      console.log('browser closed...', this.save_dir_name)
      if (!scrapingResult) throw new Error(`scraping error @ ${scenarioResult.url}`)

      // 4. スケジュール更新 exec, done , saveをセットしてアップデートする
      scheduleParam.executed = executed
      scheduleParam.done = new Date()
      scheduleParam.saveDir = this.save_dir_name
      scdl.setRegisterParameter(scheduleParam)
      const updateResult = await scdl.updateSchedule(addResultScheduleId)
      if (!updateResult) throw new Error(`schedule updating error`)
      console.log('updateResult'.bgYellow, updateResult)

      return {
        scrapedResult: {
          result: scrapingResult,
          targetUrl: scenarioResult.url,
          temporarySavePath: this.save_path
        },
        scenario: scenarioResult,
        newScheduleId: addResultScheduleId,
        newScheduleParam: {
          executed,
          done: new Date(),
          saveDir: this.save_dir_name
        },
        scenarioBasePath // `${process.cwd()}/public_html/data/scenario/${scenarioId}`
      }
    }

    async createPartialDiffFile (actions) {
    }

    async partialExtraction (dir, actions) {
      console.log('partialExtraction...'.bgRed )
      console.log(dir.bgRed) // , actions)
      // partialExtraction
      const preloadFile = await this.fs.readFileSync(`${dir}/index.html`, 'utf8')
      const cheerio = require('cheerio')
      const $ = cheerio.load(preloadFile, { decodeEntities: false })
      // thanks http://info-i.net/cheerio-decodeentities

      let query, elems
      const partHtml = []
      for (let v of actions) {
        query = v.tag +
                    ((v.id) ? `#${v.id}` : '') +
                    ((v.class) ? `.${v.class.replace(' ', '.')}` : '')
        elems = $(query)
        // query対象のアウターHTMLを格納していく
        partHtml.push(
          $.html(elems.toArray()[v.index])
        )
      }

      const pretty = require('pretty')
      const result = await this.fs.writeFileSync(
        dir + '/parts.html',
        pretty(
          partHtml.join('\n'),
          { ocd: true }
        )
      )
      return result
    }
  }

  module.exports = Scraper
