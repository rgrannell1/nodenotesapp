const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcyrpt = require('bcryptjs')
const User = require('../models/User')

// takes in require('passport')
module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // matching user
      // passport takes the input field 'email' as the email variable for the function
      User.findOne({ email: email })
        .then(user => {
          if (!user) {
            // done(err,user,data)
            return done(null, false, { message: 'Email address is not registered' })
            // flash will pass the message on as 'error' -> handle as global var
          }

          // matching password
          bcyrpt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err

            if (isMatch) {
              // done(err,user,data)
              return done(null, user)
            } else {
              // done(err,user,data)
              return done(null, false, { message: 'Password incorrect' })
              // flash will pass the message on as 'error' -> handle as global var
            }
          })
        })
        .catch(err => console.log(err))
    })
  )
  // cookie session handling
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user)
    })
  })
}
