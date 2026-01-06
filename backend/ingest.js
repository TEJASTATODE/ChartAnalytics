require("dotenv").config();

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const Insight = require("./models/Insight");
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected (ingestion)"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
const dataPath = path.join(__dirname, "../data/jsondata.json");
const rawData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

const cleanedData = rawData.map((item) => {
  const year = item.published
    ? new Date(item.published).getFullYear()
    : null;

  return {
    intensity: item.intensity || 0,
    likelihood: item.likelihood || 0,
    relevance: item.relevance || 0,
    sector: item.sector || null,
    topic: item.topic || null,
    region: item.region || null,
    country: item.country || null,
    pestle: item.pestle || null,
    source: item.source || null,

    year,
  };
});
const ingest = async () => {
  try {
    await Insight.deleteMany(); 
    await Insight.insertMany(cleanedData);
    console.log(`Inserted ${cleanedData.length} records`);
    process.exit();
  } catch (error) {
    console.error("Ingestion failed:", error.message);
    process.exit(1);
  }
};

ingest();
