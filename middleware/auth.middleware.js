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

    const decodedPayload = await authMethod.verifyToken(
      accessTokenFromHeader,
      accessTokenSecret
    );
    if (!decodedPayload) {
      return res
        .status(401)
        .send("You are not authorized to access this resource.");
    }

    console.log(
      `Auth Middleware: Decoded payload - ${JSON.stringify(decodedPayload)}`
    );

    if (decodedPayload.payload.id && decodedPayload.payload.email) {
      req.user = {
        id: decodedPayload.payload.id,
        email: decodedPayload.payload.email,
      };
      console.log(
        `Auth Middleware: User authenticated - ${decodedPayload.payload.id}`
      );
      return next();
    } else {
      console.log(
        "Auth Middleware: Token verified but missing email in payload."
      );
      return res
        .status(401)
        .send("Authentication failed: Invalid token payload.");
    }
  },
};

module.exports = authMiddleware;
