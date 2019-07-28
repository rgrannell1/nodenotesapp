const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const verifController = require('../controllers/verifController')
const auth = require('../shared/auth')

const User = require('../models/User')
const Note = require('../models/Note')

// welcome page
router.get('/welcome', (req, res) => {
  res.render('welcome', { user: req.user })
})

// dashboard
// using ensureAuthenticated from auth configuration file
// no auth -> no req.user
router.get('/', auth.ensureAuthenticated, async (req, res) => {
  verifController(req.user)
  const notes = await Note.find({ user: req.user._id }).sort({ edited: -1 })
  res.render('dashboard', {
    user: req.user,
    notes: notes
  })
})

router.post('/requestsave', (req, res) => {
  console.log('save requested')
  Note.updateOne({ _id: req.body.id }, { content: req.body.content, edited: new Date() }, (err) => { if (err) { console.log(err) } })
  res.json({ we: 'good' })
})
router.post('/requestid', (req, res) => {
  console.log('id requested')
  var content = '-'
  if (req.body.content) { content = req.body.content }
  var note = new Note({
    user: req.body.x,
    content: content
  })
  note.save().then(note => console.log(note)).catch(err => console.log(err))
  res.json({ noteid: note._id })
})
router.post('/requestdelete', (req, res) => {
  console.log('delete requested')
  Note.deleteOne({ _id: req.body.id }, (err) => {
    if (err) { console.log(err) }
  }).then(result => { console.log('delete result: ' + result); console.log(result) })
})
router.post('/requestinfo', async (req, res) => {
  const note = await Note.findOne({ _id: req.body.id })
  var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  const createdDate = new Date(note.created)
  const editedDate = new Date(note.edited)
  const created = createdDate.toLocaleDateString('en-US', options) + ' ' + createdDate.toLocaleTimeString('en-US')
  const edited = editedDate.toLocaleDateString('en-US', options) + ' ' + editedDate.toLocaleTimeString('en-US')
  res.json({ created: created, edited: edited })
})

router.get('/view', async (req, res) => {
  const id = req.query.note
  var { user, content, created } = await Note.findOne({ _id: id })
  var { name } = await User.findOne({ _id: user })
  var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  created = new Date(created).toLocaleDateString('en-US', options) + ' ' + new Date(created).toLocaleTimeString('en-US')
  res.render('view', {
    name,
    content,
    created
  })
})

router.get('/about', (req, res) => {
  res.send("<code>I'll get to this later.</code>")
})

module.exports = router
