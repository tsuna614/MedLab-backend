const Product = require("../models/product.model");

const productController = {
  queryProduct: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const category = req.query.category;
      const language = req.query.language;

      const filter = {};
      if (category) {
        filter.category = category;
      }
      // Ensure language is a valid string
      filter.language = language;
      if (typeof language !== "string" || !language.trim()) {
        console.log(`Filtering products by language: defaulting to 'en'`);
        filter.language = "en";
      } else {
        console.log(`Filtering products by language: ${language}`);
        filter.language = language;
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
  getProductByLabel: async (req, res) => {
    try {
      const label = req.query.label;
      const language = req.query.language || "en";

      const product = await Product.findOne({
        label: new RegExp(label, "i"),
        language: language,
      });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getProductByName: async (req, res) => {
    try {
      const name = req.query.name;
      const language = req.query.language || "en";

      const product = await Product.findOne({
        name: new RegExp(name, "i"),
        language: language,
      });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json(product);
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
  getProductForAIBot: async () => {
    try {
      const products = await Product.find({
        language: "en",
      }).select("name");
      const productNames = products.map((p) => p.name);
      console.log("Product names for AI Bot:", productNames);
      return productNames;
    } catch (error) {
      console.error("Error fetching products for AI Bot:", error);
      throw new Error("Failed to fetch products for AI Bot");
    }
  },
};

module.exports = productController;
