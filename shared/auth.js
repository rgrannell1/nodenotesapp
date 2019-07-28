
'use strict'

const auth = {}

auth.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next() // middleware says ok
  }
  // middleware redirects to homepage
  // req.flash('error_msg', 'Please log in to view this resource');
  res.redirect('/welcome')
}

module.exports = auth
