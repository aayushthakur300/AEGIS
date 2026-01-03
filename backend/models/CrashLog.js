const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  message: String,
  stack: String,
  type: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CrashLog", schema);
