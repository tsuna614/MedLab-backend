const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const authRoute = require("./routes/auth.route");
const userRoute = require("./routes/user.route");
const productRoute = require("./routes/product.route");
const doctorRoute = require("./routes/doctor.route");
const cartRoute = require("./routes/cart.route");
const orderRoute = require("./routes/order.route");
const authMiddleware = require("./middleware/auth.middleware");
const messageRoute = require("./routes/message.route");
const voucherRoute = require("./routes/voucher.route");
const loggerMiddleware = require("./middleware/logger.middleware");
const setupWebSocket = require("./utils/websocket");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on("error", (error) => {
  console.log(error);
});
db.on("open", () => {
  console.log("Connected to database");
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(loggerMiddleware);

app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/products", productRoute);
app.use("/doctors", doctorRoute);
app.use("/carts", authMiddleware.isAuth, cartRoute);
app.use("/orders", orderRoute);
app.use("/messages", messageRoute);
app.use("/vouchers", voucherRoute);

// Create an HTTP server
const server = http.createServer(app);

// Setup WebSocket
setupWebSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on server http://localhost:${PORT}`);
});
