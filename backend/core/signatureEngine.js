const RuntimeSignature = require("../models/RuntimeSignature");
module.exports = async code =>
  RuntimeSignature.findOne({ normalizedCode: code });
