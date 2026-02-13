const fs = require("fs");
function deleteFileIfExists(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
module.exports = { deleteFileIfExists };
