const mongoose = require("mongoose");

const addressSchema = mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: false,
    },
    postalCode: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

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
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: false,
    },
    address: {
      type: addressSchema,
      required: false,
    },
    userType: {
      type: String,
      required: false,
    },
    usedVouchersCode: {
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
