const mongoose = require("mongoose");

const InsightSchema = new mongoose.Schema({
  intensity: Number,
  likelihood: Number,
  relevance: Number,

  sector: String,
  topic: String,
  region: String,
  country: String,
  pestle: String,
  source: String,

  year: Number,
});

module.exports = mongoose.model("Insight", InsightSchema);
