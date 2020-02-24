class PuppeteerModel {
  constructor (savePath) {
    this.requestUrl = ''
    this.puppeteer = require('puppeteer')
    this.browser = null
    this.screenshotPath = savePath
  }

  async initBrowser () {
    console.log('init browser...')
    this.browser = await this.puppeteer.launch({
      args: [ '--lang=ja,en-US,en',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ],
      headless: true,
      ignoreHTTPSErrors: true
    })
  }

  async scrape (url) {
    process.on('unhandledRejection', console.dir)

    await this.initBrowser()
    console.log('start scrape...')
    const page = await this.browser.newPage()

    // reponse イベント
    page.on('request', (req) => {
      try {
        console.log(req.resourceType(), req.url())
      } catch (err) {
        console.error(req.resourceType() + ' ' + req.url())
      }
    })

    // 画面サイズ
    await page.setViewport({ width: 1024, height: 800 })
    // ユーザーエージェント
    // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36')
    // ページ移動
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 })
    // await page.waitForNavigation();
    // await page.goto( reqUrl , {waitUntil: "domcontentloaded",timeout:90000} ) ;
    // ページタイトル取得
    console.log('\nページ移動後の、タイトル取得：' + await page.title())

    // スクリーンショット
    console.log('save screenshot...' + this.screenshotPath)
    await page.screenshot({ path: `${this.screenshotPath}/screenshot.png`, fullPage: true })

    console.log('end scrape...')

    await this.browser.close()
  }
}

module.exports = PuppeteerModel
