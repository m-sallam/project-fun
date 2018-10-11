const mongoose = require('mongoose')
const Schema = mongoose.Schema

const functionSchema = new Schema({
  name: { type: String, required: true, trim: true },
  content: { type: String },
  user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' }
})

const functionModel = mongoose.model('Function', functionSchema)

module.exports = functionModel
