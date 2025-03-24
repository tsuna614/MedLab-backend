const multer = require("multer");
const path = require("path");
const fs = require("fs");

// const storage = multer.memoryStorage();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./assets";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      //   file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      "avatar" + path.extname(file.originalname)
    );
  },
});

module.exports = multer({ storage: storage });
