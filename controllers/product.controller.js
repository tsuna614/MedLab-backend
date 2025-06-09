const Product = require("../models/product.model");

const productController = {
  getAllProducts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const category = req.query.category;

      const filter = {};
      if (category) {
        filter.category = category;
      }

      const products = await Product.find(filter).skip(skip).limit(limit);

      const total = await Product.countDocuments(filter);

      res.status(200).json({
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        products,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getProductByEmail: async (req, res) => {
    try {
      const { email } = req.params;
      const product = await Product.find({ email: email });
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  createProduct: async (req, res) => {
    try {
      const input = req.body;

      console.log("Input received for product creation:", input);

      // Check if it's a single object or an array
      const data = Array.isArray(input)
        ? input.map((p) => ({ ...p }))
        : [{ ...input }];

      const createdProducts = await Product.insertMany(data);
      res.status(200).json(createdProducts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  updateProduct: async (req, res) => {
    try {
      const id = req.params.id;
      const product = await Product.findOneAndUpdate({ _id: id }, req.body, {
        new: true,
      });
      res.status(200).json("Updated successfully");
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const id = req.params.id;
      await Product.findByIdAndDelete(id);
      res.status(200).json("Deleted successfully");
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = productController;
