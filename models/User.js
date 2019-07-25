//MongoDB User Model, nothing much to see here

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  verified: {
    isVerified: { type: Boolean, default: false, required: true},
    last: {type: Date, default: Date.now, required: true},
    
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
