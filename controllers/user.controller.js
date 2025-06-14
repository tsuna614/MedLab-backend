const User = require("../models/user.model");

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const searchValue = req.query.searchValue || "";
      const filter = searchValue;

      const users = await User.find({
        $or: [
          { firstName: { $regex: filter, $options: "i" } },
          { lastName: { $regex: filter, $options: "i" } },
          { email: { $regex: filter, $options: "i" } },
        ],
      })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments({
        $or: [
          { firstName: { $regex: filter, $options: "i" } },
          { lastName: { $regex: filter, $options: "i" } },
          { email: { $regex: filter, $options: "i" } },
        ],
      });

      res.status(200).json({
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        users,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getUser: async (req, res) => {
    try {
      const id = req.user.id;
      const user = await User.findById(id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getUserByEmail: async (req, res) => {
    try {
      const { email } = req.params;
      const user = await User.find({ email: email });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  createUser: async (req, res, hashPassword) => {
    try {
      const userData = {
        ...req.body,
        password: hashPassword,
      };
      const user = await User.create(userData);
      res.status(200).json(user);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  updateUser: async (req, res) => {
    try {
      const id = req.user.id;
      const user = await User.findOneAndUpdate({ _id: id }, req.body, {
        new: true,
      });
      res.status(200).json({ msg: "Updated successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  deleteUser: async (req, res) => {
    try {
      const id = req.params.id;
      await User.findByIdAndDelete(id);
      res.status(200).json("Deleted successfully");
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  // Methods for JWT auth only
  getUserEmail: async (email) => {
    try {
      const data = await User.find({
        email: email,
      });
      return data;
    } catch {
      return null;
    }
  },
  updateRefreshToken: async (email, refreshToken) => {
    try {
      await User.findOneAndUpdate(
        { email: email },
        {
          refreshToken: refreshToken,
        },
        {
          new: true,
        }
      );
    } catch {
      return null;
    }
  },
};

module.exports = userController;
