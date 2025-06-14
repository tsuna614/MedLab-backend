const Doctor = require("../models/doctor.model");

const doctorController = {
  getAllDoctors: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const isVisible = req.query.isVisible;

      const filter = {};

      if (isVisible) {
        filter.isVisibleToUsers = isVisible;
      }

      const doctors = await Doctor.find(filter).skip(skip).limit(limit);

      const total = await Doctor.countDocuments(filter);

      res.status(200).json({
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        doctors,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getDoctorById: async (req, res) => {
    try {
      const { id } = req.params;
      const doctor = await Doctor.findById(id);
      res.json(doctor);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getDoctorByEmail: async (req, res) => {
    try {
      const { email } = req.params;
      const doctor = await Doctor.find({ email: email });
      res.status(200).json(doctor);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  createDoctor: async (req, res) => {
    try {
      const input = req.body;

      console.log("Input received for doctor creation:", input);

      // Check if it's a single object or an array
      const data = Array.isArray(input)
        ? input.map((p) => ({ ...p }))
        : [{ ...input }];

      const createdDoctors = await Doctor.insertMany(data);
      res.status(200).json(createdDoctors);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  updateDoctor: async (req, res) => {
    try {
      const id = req.params.id;
      const doctor = await Doctor.findOneAndUpdate({ _id: id }, req.body, {
        new: true,
      });
      res.status(200).json("Updated successfully");
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  deleteDoctor: async (req, res) => {
    try {
      const id = req.params.id;
      await Doctor.findByIdAndDelete(id);
      res.status(200).json("Deleted successfully");
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = doctorController;
