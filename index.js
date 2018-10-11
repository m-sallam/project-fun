const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('cookie-session')
const path = require('path')
const auth = require('./middleware/auth')
const broker = require('./middleware/broker')
const app = express()
require('dotenv').config()

const indexRoutes = require('./api/routes')
const functionsRoutes = require('./api/routes/functions')
const apiRoutes = require('./api/routes/api')

app.use(session({
  name: 'session',
  secret: process.env.APPSECRET,
  maxAge: 30 * 24 * 60 * 60 * 1000
}))
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'assets')))
app.set('view engine', 'pug')

app.use((req, res, next) => {
  res.locals.user = req.session ? req.session.user : null
  next()
})

app.use(indexRoutes)
app.use(auth.verify, functionsRoutes)
app.use(auth.verify, apiRoutes)

var start = async () => {
  try {
    await mongoose.connect(process.env.DBURL, { useNewUrlParser: true, useCreateIndex: true })
    console.log('connected to database')
    await broker.connect()
    app.listen(process.env.PORT || 3000)
    console.log(`listening on port ${process.env.PORT || 3000} ...`)
  } catch (err) {
    console.log(err)
    process.abort()
  }
}

start()

// amqp.connect('amqp://fysuoolu:7Z1fUywZrepR8gIrtT523R2qgrSyPCKo@raven.rmq.cloudamqp.com/fysuoolu', function (err, conn) {
//   conn.createChannel(function (err, ch) {
//     var q = 'hello'

//     ch.assertQueue(q, { durable: false })
//     console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', q)
//     ch.consume(q, function (msg) {
//       console.log(' [x] Received %s', msg.content.toString())
//     }, { noAck: true })
//   })
// })
