var express = require('express');
var path = require('path');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const mongooseURI = require('./config/sensitive').mongooseURI;
//connecting to database

async function startMongoose () {
  return mongoose.connect(mongooseURI, { useNewUrlParser: true})
}

//launching express
const app = express();

//static files
app.use(express.static('public'));

//passport config
// telling passport what 'strategy' to use when authenticating
require('./config/passport')(passport);

//ejs
//app.use(expressLayouts);
app.set('view engine', 'ejs');

//bodyparser (inside express now)
app.use(express.urlencoded({ extended: false}));

//express session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect-flash - for writing out messages
app.use(flash());

//global vars - used by connect-flash
app.use((req, res, next) =>{
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error'); //used by passport as default
  next(); //moving on
});

const PORT = process.env.PORT || 3000;

//routing
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

async function main () {
  await startMongoose();
  console.log('mongoose started.');

  await new Promise((resolve, reject) => {
    app.listen(PORT, () => {
      console.log(`listening on port ${PORT}`);
      resolve();
    });
  });


}

main();
