const router = require('express').Router()
const broker = require('../../middleware/broker')
const Fun = require('../models/function')

router.get('/functions', async (req, res) => {
  try {
    let funs = await Fun.find({ user: req.session.user._id })
    res.render('functions', { funs })
  } catch (err) {
    console.log(err)
    res.status(500).end()
  }
})

router.post('/functions', async (req, res) => {
  try {
    if (!req.body.name) res.status(422).send({ error: 'Function name is required!' })
    if (req.body.name.toLowerCase() === 'new') res.status(422).send({ error: 'Function name is not available!' })
    let found = await Fun.findOne({ name: req.body.name, user: req.session.user._id })
    if (found) return res.status(422).send({ error: 'You can not have more than one function with the same name!' })
    let fun = new Fun({
      name: req.body.name,
      content: req.body.content,
      user: req.session.user
    })
    await fun.save()
    broker.send('create', {
      id: fun._id,
      name: fun.name,
      content: fun.content,
      username: fun.user.username
    })
    res.end()
  } catch (err) {
    console.log(err)
    res.status(500).end()
  }
})

router.delete('/functions/:name', async (req, res) => {
  try {
    let fun = await Fun.findOneAndRemove({ name: req.params.name, user: req.session.user._id })
    if (fun) {
      broker.send('delete', {
        id: fun._id,
        name: fun.name,
        content: fun.content
      })
    }
    res.end()
  } catch (err) {
    console.log(err)
    res.status(500).end()
  }
})

router.get('/functions/new', (req, res) => {
  res.render('newFunction')
})

router.get('/functions/:name', async (req, res) => {
  try {
    let fun = await Fun.findOne({ name: req.params.name, user: req.session.user._id })
    if (!fun) return res.redirect('/')
    res.render('function', { fun })
  } catch (err) {
    console.log(err)
    res.status(500).end()
  }
})

module.exports = router
