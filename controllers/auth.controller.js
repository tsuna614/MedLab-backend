const userController = require("../controllers/user.controller");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;
const authMethod = require("../methods/auth.methods");
const jwt = require("jsonwebtoken");
// const randToken = require("rand-token"); // I have no idea what this import is

const authController = {
  register: async (req, res) => {
    const email = req.body.email;
    //   console.log(email);
    const user = await userController.getUserEmail(email);
    //   console.log(user);
    if (user.length > 0)
      res
        .status(409)
        .send(
          "The email that you entered is already in use! Please try again."
        );
    else {
      const hashPassword = bcrypt.hashSync(req.body.password, SALT_ROUNDS);
      // const newUser = {
      //   email: email,
      //   password: hashPassword,
      //   firstName: req.body.firstName,
      //   lastName: req.body.lastName,
      //   age: req.body.age,
      // };
      await userController.createUser(req, res, hashPassword);
    }
  },

  login: async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await userController.getUserEmail(email);
    if (user.length == 0) {
      return res.status(401).send("Email does not exist.");
    }

    console.log(`Email: ${email}, Password: ${password}, ${user[0].password}`);

    const isPasswordValid = bcrypt.compareSync(password, user[0].password);
    if (!isPasswordValid) {
      return res.status(401).send("Password is not correct.");
    }

    const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

    const dataForAccessToken = {
      email: user[0].email,
    };
    const accessToken = await authMethod.generateToken(
      dataForAccessToken,
      accessTokenSecret,
      accessTokenLife
    );
    if (!accessToken) {
      return res.status(401).send("Login failed, please try again.");
    }

    // let refreshToken = randToken.generate(jwt.refreshTokenSize); // tạo 1 refresh token ngẫu nhiên

    const refreshToken = jwt.sign(
      {
        email: user[0].email,
      },
      refreshTokenSecret,
      { expiresIn: "1d" }
    );

    if (user.refreshToken === null || user.refreshToken === undefined) {
      // Nếu user này chưa có refresh token thì lưu refresh token đó vào database
      await userController.updateRefreshToken(user[0].email, refreshToken);
    } else {
      // Nếu user này đã có refresh token thì lấy refresh token đó từ database
      refreshToken = user[0].refreshToken;
    }

    return res.json({
      msg: "Login successfully!",
      accessToken,
      refreshToken,
      user,
    });
  },
  refreshToken: async (req, res) => {
    // Lấy access token từ header
    const accessTokenFromHeader = req.headers.x_authorization;
    if (!accessTokenFromHeader) {
      return res.status(400).send("No access token found.");
    }

    // Lấy refresh token từ body
    const refreshTokenFromBody = req.body.refreshToken;
    if (!refreshTokenFromBody) {
      return res.status(400).send("No refresh token found.");
    }

    const accessTokenSecret =
      process.env.ACCESS_TOKEN_SECRET || jwt.accessTokenSecret;
    const accessTokenLife =
      process.env.ACCESS_TOKEN_LIFE || jwt.accessTokenLife;

    // Decode access token đó
    const decoded = await authMethod.decodeToken(
      accessTokenFromHeader,
      accessTokenSecret
    );
    if (!decoded) {
      return res.status(400).send("Invalid access token.");
    }

    // console.log(decoded.payload.email);

    const email = decoded.payload.email; // Lấy email từ payload

    const user = await userController.getUserEmail(email);

    if (user.length === 0) {
      return res.status(401).send("Email does not exist.");
    }

    // console.log(email);
    console.log(user[0].refreshToken);

    if (refreshTokenFromBody !== user[0].refreshToken) {
      return res.status(400).send("Invalid refresh token.");
    }

    // Tạo access token mới
    const dataForAccessToken = {
      email,
    };

    const accessToken = await authMethod.generateToken(
      dataForAccessToken,
      accessTokenSecret,
      accessTokenLife
    );
    if (!accessToken) {
      return res
        .status(400)
        .send("Cannot create new access token. Please login again.");
    }
    return res.json({
      accessToken,
    });
  },
};

module.exports = authController;
