const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  logHash: { type: String, required: true, unique: true, index: true },
  analysis: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now, expires: '7d' } // Cache expires in 7 days
});

module.exports = mongoose.model("ErrorCache", schema);