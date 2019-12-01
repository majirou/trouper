// 一時的なスクレイピングを開始しする
const PuppeteerModel = require("../models/PuppeteerModel.js")

const p = new PuppeteerModel()

p.scrape('https://www.google.co.jp')

