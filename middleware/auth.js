const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../api/models/user')

let register = async (user, password) => {
  let hash = await bcrypt.hash(password, 10)
  user.hash = hash
  await user.save()
  return true
}

let authenticate = async (username, password) => {
  let user = await User.findOne({ username: username })
  if (user) {
    let match = await bcrypt.compare(password, user.hash)
    if (match) {
      let token = jwt.sign({ user }, process.env.APPSECRET, { expiresIn: '7d' })
      return { token, user }
    }
  }
  let err = new Error('Invalid Username/Password')
  err.code = 'AUTHERROR'
  throw err
}

let verify = async (req, res, next) => {
  try {
    let token = req.session.token
    if (token) {
      let payload = jwt.verify(token, process.env.APPSECRET)
      res.locals.user = payload.user
      return next()
    }
    res.redirect('/')
  } catch (err) {
    res.redirect('/')
  }
}

let refreshToken = async oldToken => {
  const payload = jwt.verify(oldToken, process.env.APPSECRET)
  delete payload.iat
  delete payload.exp
  delete payload.nbf
  delete payload.jti
  let token = jwt.sign(payload, process.env.APPSECRET, { expiresIn: '7d' })
  return { token }
}

module.exports = { register, authenticate, verify, refreshToken }
