let mongoose = require('mongoose');
let bcrypt = require('bcrypt');

// schema for user accounts
let UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    default: 0
  }
});

// encripts the password and authenticates user based on email in mongoDB Atlas Cluster
UserSchema.statics.authenticate = (email, password, doneCallback) => {
  User.findOne({ email: email })
  .exec((err, user) => {
    if (err) {
      return doneCallback(err)
    } else if (!user) {
      let err = new Error('User not found.');
      err.status = 401;
      return doneCallback(err);
    }
    bcrypt.compare(password, user.password, (err, res) => {
      if (res === true) {
        return doneCallback(null, user);
      } else {
        return doneCallback();
      }
    })
  });
}

// encripts the password and saves the new user in mongoDB Atlas Cluster
UserSchema.pre('save', function (next) {
  console.log(this)
  let user = this;
  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  })
});

let User = mongoose.model('User', UserSchema);
module.exports = User;
