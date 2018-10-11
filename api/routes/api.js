const router = require('express').Router()
const broker = require('../../middleware/broker')
const uuid4 = require('uuid/v4')

router.get('/api/function/invoke/:id', async (req, res) => {
  try {
    let responseQ = uuid4()
    let args = req.query
    broker.send(req.params.id, {
      responseQ,
      args
    })
    req.setTimeout(0)
    let response = await broker.listen(responseQ)
    res.status(200).send(response)
  } catch (err) {
    console.log(err)
    res.status(500).end()
  }
})

module.exports = router
