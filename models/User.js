const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema(
  {
    displayName: {
      type: String,
      trim: true,
      required: true,
    },
    userName: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      required: true,
      type: String,
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/douy56nkf/image/upload/v1594060920/defaults/txxeacnh3vanuhsemfc8.png",
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followersCount: {
      type: Number,
      default: 0,
    },
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followingCount: {
      type: Number,
      default: 0,
    },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    postCount: {
      type: Number,
      default: 0,
    },
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    adminRole: {
      type: Boolean,
      default: false,
    },
    token: String,
    website: String,
    bio: String,
    phoneNumber: String,
    gender: String,
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  const user = this;
  if (user.isModified("password")) {
    bcrypt.hash(user.password, saltRounds, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  const user = this;
  var token = jwt.sign({ id: user._id }, process.env.SECRET, {
    expiresIn: "1d",
  });
  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  const user = this;
  jwt.verify(token, process.env.SECRET, function (err, decode) {
    if (err) return cb(err);
    user.findOne({ _id: decode.id, token: token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};

userSchema.set("toJSON", {
  transform: (doc, { __v, password, token, ...rest }, options) => rest,
});

module.exports = mongoose.model("User", userSchema);
