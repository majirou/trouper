const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const bodyParser = require('body-parser')

const colors = require('colors')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

const baseDir = config.router.base || '/'

init()

start()

async function start () {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}

function init () {
  const ctrlPath = './controllers'
  app.get(`${baseDir}programs/`, async (req, res) => {
    try {
      if (req.body == null) throw new Error('No Body')
      const Program = require(`${ctrlPath}/ProgramController.js`)
      const ctrl = new Program()
      const searchResult = await ctrl.search(req.body)
      if (!searchResult) {
        throw new Error(`Search Error`)
      }
      res.json({result: searchResult})
    } catch(e) {
      res.json({result: false, message: e.message})
    }
  })

  // register program
  app.post(`${baseDir}program/`, async (req, res) => {
    try {
      if (req.body == null) throw new Error('No Body')
      const Program = require(`${ctrlPath}/ProgramController.js`)
      const ctrl = new Program()
      const registerResult = await ctrl.register(req.body)
      if (!registerResult) {
        throw new Error(`Validation Error`)
      }
      res.json({result: true})
    } catch(e) {
      res.json({result: false, message: e.message})
    }
  })

  app.get(`${baseDir}temporary/`, async (req, res) => {
    // console.log('param url:', req.query.url)
    const url = req.query.url
    const Scraper = require(`${ctrlPath}/TemporaryScrapeController.js`)

    const ctrl = new Scraper()
    await ctrl.scrape(url)
      .then(result => {
        res.json({
          result: {
            dirName: ctrl.dirName
          }
        });
      })
  })

  app.use('/data', express.static( __dirname + '/data'));
}
