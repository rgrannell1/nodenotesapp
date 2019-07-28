const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')
const verifController = require('../controllers/verifController')
const generatePassword = require('password-generator')
const nodemailer = require('nodemailer')
const auth = require('../config/email').auth

// new password email sending
const pwEmail = function (user, pw) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: auth
  })
  const mailOptions = {
    from: 'nodenotesapp@gmail.com', // sender address
    to: user.email, // list of receivers
    subject: 'Notes App | New password', // Subject line
    html: '<b>Notes</b><br>Your new password is: ' + pw
  }
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) { console.log(err) } else { console.log(info) }
  })
}

// use model
const User = require('../models/User')

// login page
router.get('/login', (req, res) => {
  if (!req.user) {
    res.render('login')
  } else {
    res.redirect('/')
  }
})

// signup page
router.get('/signup', (req, res) => {
  if (!req.user) {
    res.render('signup')
  } else {
    res.redirect('/')
  }
})

// signup handle
router.post('/signup', (req, res) => {
  console.log(req.body)
  const { name, email, password, password2 } = req.body
  const errors = []

  // checking required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' })
  }

  // password fields
  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' })
  }

  // password length
  if (password.length < 6) {
    errors.push({ msg: 'Password is not strong enough' })
  }

  if (errors.length > 0) {
    // ejs will handle the errors
    res.render('signup', { errors, name, email, password, password2 })
  } else {
    // validation passed
    User.findOne({ email: email })
      .then(user => {
        if (user) {
          // User exists
          errors.push({ msg: 'Email address already in use' })
          // ejs will handle the errors
          res.render('signup', { errors, name, email, password, password2 })
        } else {
          // creating new user
          const newUser = new User({
            name,
            email,
            password
          })
          // hashing password
          bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err
              // set password to hashed
              newUser.password = hash
              // save user
              newUser.save()
                .then(user => {
                  verifController.sendEmail(user)
                  req.flash('success_msg', 'You are now registered and can log in')
                  res.redirect('/users/login')
                })
                .catch(err => console.log(err))
            }))
        }
      })
  }
})

// login handle
// auth using local DB
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next)
})

// profile settings

router.get('/profilesettings', (req, res) => {
  if (!req.user) {
    res.redirect('/')
  } else {
    res.render('profile_settings', {
      name: req.user.name,
      email: req.user.email,
      newemail: req.user.email,
      currentpassword: '',
      newpassword: '',
      newpassword2: ''
    })
  }
})

router.post('/profilesettings', (req, res, next) => {
  // deconstructing entered paramterers
  const { name, email, newemail, password, newpassword, newpassword2 } = req.body
  // getting stored hashed password
  const actualCurrentPassword = req.user.password
  const errors = []
  // If authentication failed, user will be set to false. If an exception occurred, err will be set
  passport.authenticate('local', function (err, user, info) {
    if (err) { errors.push({ msg: err }) }
    // auth failed
    if (!user) {
      errors.push({ msg: 'Current password invalid' })
      res.render('profile_settings', {
        errors,
        name,
        email,
        newemail,
        password,
        newpassword,
        newpassword2
      })
    } else {
      // auth successful
      // checking if a new password has been entered
      var newPw = newpassword || newpassword2
      var changedEmail = email != newemail
      // basic error handling
      if (!name || !newemail || !password) {
        errors.push({ msg: 'Please fill out all fields.' })
      }
      if (!email) {
        errors.push({ msg: 'Something is up with the email' })
      }
      if (newPw) {
        if (newpassword != newpassword2) {
          errors.push({ msg: 'Passwords do not match' })
        }
        if (password == newpassword) {
          errors.push({ msg: "Your new password can't be your current password" })
        }
        if (newpassword.length < 6) {
          errors.push({ msg: 'Password is not strong enough' })
        }
      }
      // checking if email has been changed
      if (changedEmail) {
        User.findOne({ email: newemail })
          .then(user => {
            if (user) {
            // different entered email address already exists
              errors.push({ msg: 'Email address already in use' })
            }
          })
      }
      if (errors.length > 0) {
        res.render('profile_settings', {
          errors,
          name,
          email,
          newemail,
          password,
          newpassword,
          newpassword2
        })
      } else {
        // updating user info in MongoDB
        User.findOne({ email: req.user.email }, (err, doc) => {
          doc.name = name
          doc.email = newemail
          if (changedEmail) {
            doc.verified.isVerified = false
            doc.verified.last = new Date()
          }
          if (newPw) {
            // gotta hash that new password
            bcrypt.genSalt(10, (err, salt) =>
              bcrypt.hash(newpassword, salt, (err, hash) => {
                if (err) throw err
                // set password to hashed
                doc.password = hash
                doc.save().then().catch(err => console.log(err))
              }))
          } else {
            doc.save().then().catch(err => console.log(err))
          }
        })
        if (changedEmail) {
          verifController.sendEmail({ email: newemail, _id: req.user._id })
        }
        req.flash('success_msg', 'User information saved')
        res.redirect('/users/profilesettings')
      }
    }
  })(req, res, next)
})

// logout handle
router.get('/logout', (req, res) => {
  req.logout() // basic passport function
  req.flash('success_msg', 'You are logged out') // keeps the variable in the redirect target url
  res.redirect('/users/login')
})

// email verification
router.get('/verify', (req, res) => {
  if (!req.query.id) {
    res.render('welcome')
  } else {
    User.findOne({ _id: req.query.id }, (err, doc) => {
      if (err) throw err
      verifController.verifyUser(doc)
      req.flash('success_msg', 'Email has been verified')
      res.redirect('/users/login')
    })
  }
})

// forgot
router.get('/forgot', (req, res) => {
  res.render('forgot')
})

router.post('/forgot', (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) throw err
    if (!user) {
      req.flash('error_msg', 'No user with entered email')
      res.redirect('/users/forgot')
    } else {
      var pw = generatePassword()
      bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(pw, salt, (err, hash) => {
          if (err) throw err
          // set password to hashed
          user.password = hash
          // save user
          user.save().then().catch(err => console.log(err))
          pwEmail(user, pw)
          req.flash('success_msg', 'New password sent to email')
          res.redirect('/users/forgot')
        }))
    }
  })
})

router.get('/deleteaccount', (req, res) => {
  if (req.user) {
    res.render('deleteaccount', { email: req.user.email })
  } else {
    res.render('deleteaccount')
  }
})

router.post('/deleteaccount', async (req, res, next) => {
  console.log('account delete requested')
  passport.authenticate('local', function (err, user, info) {
    const errors = []
    if (err || !user) {
      errors.push({ msg: err || 'Password incorrect' })
      res.render('deleteaccount', {
        errors: errors,
        email: req.body.email
      })
    } else {
      User.deleteOne({ email: user.email }, err => { if (err) { console.log(err) } })
        .then(result => {
          if (result) {
            req.flash('success_msg', 'Your account has been deleted.')
            res.redirect('/users/deleteaccount')
          }
        })
    }
  })(req, res, next)
})
module.exports = router
