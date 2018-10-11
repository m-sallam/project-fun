const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  hash: { type: String },
  name: { type: String, required: true },
  state: String,
  email: { type: String, required: true, unique: true },
  picture: String
})

const userModel = mongoose.model('User', userSchema)

module.exports = userModel
