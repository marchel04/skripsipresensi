const { sendBadRequestResponse } = require("../utils/responseHandler");

const isAdmin = (req, res, next) => {
  console.log("user : " + req.user);
  console.log("Admin : " + req.user?.role);
  if (req.user?.role !== "admin") {
    return sendBadRequestResponse(res, "Access denied - Admin only");
  }
  next();
};

module.exports = { isAdmin };
