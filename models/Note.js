// MongoDB Note Model, nothing much to see here

const mongoose = require('mongoose')

const NoteSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    required: true,
    default: Date.now
  },
  edited: {
    type: Date,
    required: true,
    default: Date.now
  },
  content: {
    type: String,
    required: true,
    default: ''
  }
})

const Note = mongoose.model('Note', NoteSchema)

module.exports = Note
