const User = require('../models/User')
const nodemailer = require('nodemailer')
const auth = require('../config/sensitive').auth

const difference = function (earlier, later) {
  dt1 = new Date(earlier)
  dt2 = new Date(later)
  return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24))
}

const sendEmail = function (user) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: auth
  })
  const mailOptions = {
    from: 'nodenotesapp@gmail.com', // sender address
    to: user.email, // list of receivers
    subject: 'Notes App | Verify your email', // Subject line
    html: '<b>Notes App</b><br><p>Click here to <a href="http://nodenotesapp.herokuapp.com/users/verify?id=' + user._id + '">Verify your email</a></p>'
  }
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) { console.log(err) } else { console.log(info) }
  })
}

const verifyUser = function (user) {
  User.findOne({ email: user.email }, (err, doc) => {
    if (err) throw err
    doc.verified.isVerified = true
    doc.save().then().catch(err => console.log(err))
  })
}

module.exports = function (user) {
  if (!user.verified.isVerified && difference(user.verified.last, new Date()) > 14) {
    sendEmail(user)
    User.findOne({ email: user.email }, (err, doc) => {
      if (err) throw err
      doc.verified.last = new Date()
      doc.save().then().catch(err => console.log(err))
    })
  }
}

module.exports.sendEmail = sendEmail
module.exports.verifyUser = verifyUser
