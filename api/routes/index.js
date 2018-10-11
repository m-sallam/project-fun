const router = require('express').Router()
const User = require('../models/user')
const auth = require('../../middleware//auth')

router.get('/', (req, res) => {
  if (!req.session.user) return res.render('landing')
  res.redirect('/functions')
})

router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/')
  res.render('register', { body: {}, error: {} })
})

router.post('/register', async (req, res) => {
  if (req.session.user) return res.redirect('/')
  try {
    if (req.body.password.length < 6) return res.render('register', { body: req.body, error: { field: 'password', message: 'Password must be at least 6 chars long' } })
    if (req.body.username.length < 4) return res.render('register', { body: req.body, error: { field: 'username', message: 'Username must be at least 4 chars long' } })
    let user = new User({
      username: req.body.username,
      name: req.body.name,
      email: req.body.email
    })
    await auth.register(user, req.body.password)
    let { token } = await auth.authenticate(req.body.username, req.body.password)
    req.session.token = token
    req.session.user = user
    res.redirect('/')
  } catch (err) {
    console.log(err)
    if (err.code === 11000) {
      let type = err.message.split('$')[1].split('_')[0]
      if (type === 'username') {
        res.render('register', { body: req.body, error: { field: 'username', message: 'Username already exists' } })
      } else {
        res.render('register', { body: req.body, error: { field: 'email', message: 'Email already exists' } })
      }
    } else if (err.name === 'ValidationError') {
      console.log(err.errors)
      res.render('register', { body: req.body, error: { field: Object.keys(err.errors)[0], message: `${Object.keys(err.errors)[0]} is required` } })
    } else {
      res.status(500).send({ message: err.message })
    }
  }
})

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/')
  res.render('login', { body: {}, error: {} })
})

router.post('/login', async (req, res) => {
  if (req.session.user) return res.redirect('/')
  try {
    let { token, user } = await auth.authenticate(req.body.username, req.body.password)
    req.session.token = token
    req.session.user = user
    res.redirect('/')
  } catch (err) {
    if (err.code === 'AUTHERROR') {
      res.render('login', { body: req.body, error: { message: err.message } })
    } else {
      console.log(err)
      res.status(500).send(err.message)
    }
  }
})

router.get('/logout', (req, res) => {
  req.session = null
  res.redirect('/')
})

// router.post('/token/refresh', async (req, res) => {
//   try {
//     let { token } = await auth.refreshToken(req.body.token)
//     res.status(200).send({ token })
//   } catch (err) {
//     console.log(err)
//     res.status(500).send(err.message)
//   }
// })

module.exports = router
