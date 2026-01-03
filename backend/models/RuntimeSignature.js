const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  normalizedCode: String,
  category: String,
  layer: String,
  severity: String,
  languages: [String],
  causes: [String],
  fixes: [String]
});

module.exports = mongoose.model("RuntimeSignature", schema);
