const User = require("../models/user.model");
const Voucher = require("../models/voucher.model");

const voucherController = {
  getVoucherWithPagination: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const isVisible = req.query.isVisible;

      const filter = {};

      if (isVisible) {
        filter.isVisibleToUsers = isVisible;
      }

      const vouchers = await Voucher.find(filter).skip(skip).limit(limit);

      const total = await Voucher.countDocuments(filter);

      res.status(200).json({
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        vouchers,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getVoucherById: async (req, res) => {
    try {
      const { id } = req.params;
      const voucher = await Voucher.findById(id);
      res.json(voucher);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getAllVouchers: async (req, res) => {
    try {
      const vouchers = await Voucher.find();
      res.status(200).json(vouchers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getVoucherByEmail: async (req, res) => {
    try {
      const { email } = req.params;
      const voucher = await Voucher.find({ email: email });
      res.status(200).json(voucher);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  createVoucher: async (req, res) => {
    try {
      const input = req.body;

      console.log("Input received for voucher creation:", input);

      // Check if it's a single object or an array
      const data = Array.isArray(input)
        ? input.map((p) => ({ ...p }))
        : [{ ...input }];

      const createdVouchers = await Voucher.insertMany(data);
      res.status(200).json(createdVouchers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  redeemVoucher: async (req, res) => {
    try {
      const userId = req.user.id;
      const { voucherCode } = req.body;

      const voucher = await Voucher.findOne({ code: voucherCode });
      const user = await User.findById(userId);

      if (!voucher) {
        return res.status(404).json({ message: "Voucher not found" });
      }
      if (user.usedVouchersCode.includes(voucherCode)) {
        return res.status(400).json({ message: "Voucher already redeemed" });
      }

      user.usedVouchersCode.push(voucherCode);
      await user.save();

      res.status(200).json({ message: "Voucher redeemed successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  updateVoucher: async (req, res) => {
    try {
      const id = req.params.id;
      const voucher = await Voucher.findOneAndUpdate({ _id: id }, req.body, {
        new: true,
      });
      res.status(200).json("Updated successfully");
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  deleteVoucher: async (req, res) => {
    try {
      const id = req.params.id;
      await Voucher.findByIdAndDelete(id);
      res.status(200).json("Deleted successfully");
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = voucherController;
