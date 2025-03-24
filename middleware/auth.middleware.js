const userController = require("../controllers/user.controller");
const authMethod = require("../methods/auth.methods");

const authMiddleware = {
  isAuth: async (req, res, next) => {
    // Lấy access token từ header
    const accessTokenFromHeader = req.headers.x_authorization;
    if (!accessTokenFromHeader) {
      return res.status(401).send("No access token found.");
    }

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

    const verified = await authMethod.verifyToken(
      accessTokenFromHeader,
      accessTokenSecret
    );
    if (!verified) {
      return res
        .status(401)
        .send("You are not authorized to access this resource.");
    }

    return next();
  },
};

module.exports = authMiddleware;
