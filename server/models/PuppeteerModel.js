class PuppeteerModel {
  constructor (savePath) {
    this.requestUrl = ''
    this.puppeteer = require('puppeteer')
    this.browser = null
    this.saveBasePath = savePath
    this.savePath = null
    this.screenshotPath = savePath
    this.url = null
    // this.hostname = null
    this.path = require('path')
    this.fs = require('fs');
  }

  async _initBrowser () {
    console.log('init browser...'.cyan)
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
    await this._initBrowser()
    console.log('start scrape...'.cyan)
    const page = await this.browser.newPage()

    this.url = new URL(url);

    // reponse event
    page.on('request', (req) => {
    });

    // response event
    page.on('response', async (res) => {
      try {
        if (res.ok()) {
          const url = new URL(res.url());
          // const headers = res.headers()
          // const contentType = headers == null ? null : headers['content-type']
          const req = res.request()
          const buffer = await res.buffer();
          const saveFilePath = this._getSaveFilePathByResourceType(req.resourceType(), url);

          const dir = this.path.parse(saveFilePath).dir;
          this.fs.mkdirSync(dir, {recursive: true});
          this.fs.writeFileSync(saveFilePath, buffer);
        } else {
          throw new Error('error status:'.red + res.status());
        }
      } catch (err) {
        console.log(err.name.red, err.message.yellow);
      }
    });

    // 画面サイズ
    await page.setViewport({ width: 1024, height: 800 })
    // ユーザーエージェント
    // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36')
    // ページ移動
    await page.goto(url, {waitUntil: 'networkidle2', timeout: 30000})

    // とりあえず、そのページで10秒待つことで描画されるものを待つ
    await page.waitFor(10000); // ミリ秒
    // await page.waitForNavigation();
    // await page.goto( reqUrl , {waitUntil: "domcontentloaded",timeout:90000} ) ;
    console.log('page title...'.cyan + await page.title())

    // スクリーンショット
    console.log("save screenshot...".cyan + this.screenshotPath)
    await page.screenshot({
      path: `${this.screenshotPath}/screenshot.png`,
      fullPage: true
    });

    // evluate html
    const html = await page.evaluate( () => {
      const _html = document.getElementsByTagName('html')[0];

      // remove base-tag, because use localpath
      const baseElem = _html.getElementsByTagName('base');
      for (let i = (baseElem.length - 1); i >= 0; i--) { // remove from reverse order
        baseElem[i].parentNode.removeChild(baseElem[i])
      }
      // set
      const resultHtml = document.createElement('html');
      resultHtml.lang = document.documentElement.lang;
      resultHtml.innerHTML = _html.innerHTML;
      return resultHtml.outerHTML;
    });
    // output evaluated html
    await this.fs.writeFileSync(`${this.saveBasePath}/evaluated.html`, html)

    // localize evaluated html
    const createLocalizePath = () => {
      const savePath = this.path.normalize(
        this.saveBasePath + "/" +
        this.url.host.replace(/[:]/g, "_")
      );
      const dirs = this.url.pathname.split("/");
      let pathname = this.url.pathname;
      if (dirs[dirs.length-1] !== "" ) {
        dirs.pop();
        pathname = dirs.join("/");
      }
      return `${savePath}/${pathname}`;

    } ;
    console.log("savePath:", createLocalizePath() )

    // HTML内の各パスをローカライズ
    const localizePath = createLocalizePath();
    console.log('start localizing...'.cyan + localizePath);
    const localizedHtml = await this._localizeScrapedHtml(html, localizePath)
      .then(result => {
        console.log('end localizing...'.cyan , "size:" + result.length);
        return result;
      });
    console.log('end scrape...'.cyan);

    // output localized html
    await this.fs.writeFileSync(`${this.saveBasePath}/index.html`, localizedHtml);

    await this.browser.close();
    console.log('browser closed...'.cyan);
  }

  _getSaveFilePathByResourceType(resourceType, url) {
    let saveFilePath = null ;
    const basePath = this.path.normalize(
      this.saveBasePath + "/" + url.host.replace(/[:]/g, "_")
    );

    switch (resourceType) {
      case 'document':
        saveFilePath = (url.pathname === '/') ? `${basePath}/index.html` : `${basePath}${url.pathname}`;
        break;
      case 'stylesheet':
      case 'script':
      case 'font':
        saveFilePath = `${basePath}${url.pathname}`;
        break;
      case 'image':
        // console.log(url);
        if (url.protocol==="data:") {
          throw new Error(`base64:${resourceType}`.red + ", " + url.pathname.substr(0,20) + "...");
        }
        saveFilePath = `${basePath}${url.pathname}`;
        break;
      case 'xhr':
        throw new Error(resourceType.red);
      case 'other':
        throw new Error(resourceType.red);
      default:
        throw new Error('unknown type:'.red + resourceType.red);
    }
    return saveFilePath;
  }

  async _localizeScrapedHtml (htmlText, savePath) {
    let result = null;
    try {
      const cheerio = require('cheerio')
      const $ = cheerio.load(htmlText, {decodeEntities: false});

      $('img').each((i, elem) => {
        const src = elem.attribs.src;
        if (src != null) {
          elem.attribs.src = this._replaceUrl(src, savePath)
        }
        // const srcset = elem.attribs.srcset
        // if (srcset != null) {
        //   elem.attribs.srcset = this._replaceSrcsetUrl(srcset, savePath)
        // }
      })

      $('iframe').each((i, elem) => {
        elem.attribs.src = ''
      })

      $('link').each((i, elem) => {
        const href = elem.attribs.href;
        if (href != null) {
          elem.attribs.href = this._replaceUrl(href, savePath)
        }
      })

      $('script').each((i, elem) => {
        const src = elem.attribs.src;
        if (src != null) {
          elem.attribs.src = this._replaceUrl(src, savePath)
        }
      })

      const beautify = require('js-beautify').html;
      result = beautify(
        $.html(),
        {indent_size: 2, space_in_empty_paren: true}
      );

    } catch (e) {
      console.error(e)
    }
    return result
  }

  _replaceUrl (sourcePath, saveBasePath) {
    let targetPath = null;
    if (sourcePath.match(/^[.]{1,2}\//)) {
      // ./ ../ にマッチする場合は、現リクエストを足す
      targetPath = `${saveBasePath}/${sourcePath}`;
    } else if (sourcePath.match(/^(http|https):\/\//) ) {
      // http://, https://などプロトコル始まりは, プロトコルを飛ばす
      const url = new URL(sourcePath);
      targetPath = `${url.host}/${url.pathname}`;
    } else if (sourcePath.match(/^\/\//)) {
      // // はじまり
      targetPath = sourcePath.substr(2);
    } else if (sourcePath.match(/^\//)) {
      // / はじまり
      targetPath = `${this.url.host}/${sourcePath}`;
    } else {
      targetPath = sourcePath;
      console.log(sourcePath + " => " + targetPath.split("?")[0].yellow);
    }
    return targetPath.split("?")[0];
    // const path = this.path.parse(targetPath);
    // console.log(path.dir.red, path.name, path.ext);
    // let filename = target.pop()
    // filename = filename.split('?')[0]
    // const outputPath = target.join('/')
    //   .replace(/:/g, '_') // ポート部分をアンダースコアに
    //   // .replace(/\./g, '_') // ドット文字もアンダースコアに
    // return (`./${outputPath}/${filename}`).replace(/\/\/+/g, '/')

    /*
    else if (src.match(/^(http|https):\/\//)) {
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
    */
  }
  _replaceSrcsetUrl (sourcePath, saveBasePath) {
    let targetPath = null;

    if (sourcePath.match(/^([.]{1,2})*\//)) {
      // ./ ../ にマッチする場合は、現リクエストを足す
      targetPath = `${saveBasePath}/${sourcePath}`;
    } else {
      targetPath = sourcePath;
    }

    if (path.ext != null) {

    }
    const path = this.path.parse(targetPath);
    console.log(path.dir.red, path.name, path.ext);
  }
}

module.exports = PuppeteerModel
