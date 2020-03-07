
class TemporaryScrapeController {
  constructor () {
    this.dirName = this._createDirName()
    this.saveBasePath = __dirname + `/../data/temporary/${this.dirName}` // server/controllers
    console.log("saveBasePath",this.saveBasePath);
    this.makeTemporaryDirectory();

    const PuppeteerModel = require('../models/PuppeteerModel.js')
    this.puppet = new PuppeteerModel(this.saveBasePath)
  }

  _createDirName(){
    const d = new Date();
    return `${d.getFullYear()}` +
      `${('0' + (d.getMonth() + 1)).slice(-2)}` +
      `${('0' + d.getDate()).slice(-2)}` +
      `${('0' + d.getHours()).slice(-2)}` +
      `${('0' + d.getMinutes()).slice(-2)}` +
      `${('0' + d.getSeconds()).slice(-2)}` ;
  }

  makeTemporaryDirectory(path = null){
    if (path == null) {
      path = this.saveBasePath;
    }
    console.log("makeTemporaryDirectory",path);

    const fs = require('fs');
    let result = null;
    try {
      fs.readdirSync(this.saveBasePath);
      result = true;
    } catch(err) {
      if (err.code === 'ENOENT') {
        try {
          // 保存先を作成する
          // console.log("mkdir ",path);
          fs.mkdirSync(this.saveBasePath);
          // console.log("mkdir done");
          result = true;
        } catch(err) {
          console.error("error", err);
          result = false;
        }
      } else {
        console.error("error", err);
        result = false;
      }
    }
    return result;
  }

  async scrape (url) {
    await this.puppet.scrape(url)
    return true;
  }
}
module.exports = TemporaryScrapeController
