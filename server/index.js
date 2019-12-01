const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const bodyParser = require('body-parser');

const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

const baseDir = config.router.base || '/'

app.get(`${baseDir}programs/`, (req,res) => {
  res.json([
    {_id:'a', name:'name1'},
    {_id:'ab', name:'name2'},
    {_id:'abc', name:'name3'},
    {_id:'abcd', name:'name4'}
  ])
})

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
start()
