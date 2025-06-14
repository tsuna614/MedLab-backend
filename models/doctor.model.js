const mongoose = require("mongoose");

const doctorSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    profileImageUrl: {
      type: String,
      required: false,
    },
    medicalSpecialty: {
      type: String,
      required: true,
    },
    qualifications: {
      type: String,
      required: false,
    },
    startingYear: {
      type: Number,
      required: true,
    },
    shortBio: {
      type: String,
      required: false,
    },
    consultationFeeRange: {
      type: String,
      required: false,
    },
    isVisibleToUsers: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Doctor = mongoose.model("doctors", doctorSchema);

module.exports = Doctor;
