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
  app.get(`${baseDir}programs/`, (req, res) => {
    res.json([
      { _id: 'a', name: 'name1' },
      { _id: 'ab', name: 'name2' },
      { _id: 'abc', name: 'name3' },
      { _id: 'abcd', name: 'name4' }
    ])
  })

  // register program
  app.post(`${baseDir}program/`, async (req, res) => {
    console.log(req.query, req.body)
    try {
      if (req.body == null) throw new Error('No Body')
      const url = req.body.url
      const schedule = req.body.schedule
      const elements = req.body.elements

      const Program = require(`${ctrlPath}/ProgramController.js`)
      const ctrl = new Program()
      await ctrl.register(url, schedule, elements)
      res.send('test')
    } catch(e) {
      console.error(e);
      res.status(404).send(e.message)
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
