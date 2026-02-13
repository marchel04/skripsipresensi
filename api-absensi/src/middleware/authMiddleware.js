const { verifyToken } = require("../utils/jwtHandler.js");
const LoginService = require("../services/login.service.js");
const {
  sendBadRequestResponse,
  sendUnauthorizedResponse,
} = require("../utils/responseHandler.js");

async function protectAuth(req, res, next) {
  const token = req.cookies?.jwt;

  if (!token) {
    return sendBadRequestResponse(res, "Unauthorized - you need to login");
  }

  try {
    const decoded = verifyToken(token);


    if (!decoded?.nip) {
      return sendUnauthorizedResponse(res, "Invalid token payload");
    }

    const authUser = await LoginService.getLoginServiceByNip(decoded.nip);

    if (!authUser) {
      return sendBadRequestResponse(res, "Unauthorized - user not found");
    }

    req.user = {
      nip: authUser.nip,
      role: authUser.pegawai?.role || null,
      id_pegawai: authUser.pegawai?.id_pegawai || null,
      pegawai: authUser.pegawai,
    };

    return next();
  } catch (error) {
    console.error("JWT Verify Error:", error.message);
    return sendUnauthorizedResponse(
      res,
      "Unauthorized - invalid or expired token"
    );
  }
}

module.exports = { protectAuth };
