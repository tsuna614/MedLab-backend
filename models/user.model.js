const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    number: {
      type: String,
      required: false,
    },
    userType: {
      type: String,
      required: false,
    },
    receiptsId: {
      type: [String],
      required: false,
    },
    // profileImageUrl: {
    //   type: String,
    //   required: false,
    // },
    // userFriends: {
    //   type: Array,
    //   required: true,
    // },
    // this is for jwt auth
    refreshToken: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = mongoose.model("users", userSchema);

module.exports = User;
