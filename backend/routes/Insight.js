const express = require("express");
const router = express.Router();
const Insight = require("../models/Insight");



const buildMatch = (query, ignore = []) => {
  const match = {};

  const fields = [
    "topic",
    "sector",
    "region",
    "country",
    "pestle",
    "source",
    "city",
    "swot",
  ];

  fields.forEach((field) => {
    if (query[field] && !ignore.includes(field)) {
      match[field] = query[field];
    }
  });

  if (query.endYear) {
    match.year = { $lte: Number(query.endYear) };
  }

  return match;
};


router.get("/", async (req, res) => {
  try {
    const match = buildMatch(req.query);
    const data = await Insight.find(match).limit(200);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/avg-intensity-by-year", async (req, res) => {
  try {
    const match = buildMatch(req.query);

    const data = await Insight.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$year",
          avgIntensity: { $avg: "$intensity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/count-by-country", async (req, res) => {
  try {
    const match = buildMatch(req.query, ["country"]);
    match.country = { $ne: null };

    const data = await Insight.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$country",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/count-by-topic", async (req, res) => {
  try {
    const match = buildMatch(req.query, ["topic"]);
    match.topic = { $ne: null };

    const data = await Insight.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$topic",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.get("/sector-risk-analysis", async (req, res) => {
  try {
    const match = buildMatch(req.query, ["sector"]);
    match.sector = { $ne: null };

    const data = await Insight.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$sector",
          avgLikelihood: { $avg: "$likelihood" },
          avgRelevance: { $avg: "$relevance" },
          avgIntensity: { $avg: "$intensity" },
        },
      },
      { $sort: { avgIntensity: -1 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




router.get("/count-by-pestle", async (req, res) => {
  try {
    const match = buildMatch(req.query, ["pestle"]);
    match.pestle = { $ne: null };

    const data = await Insight.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$pestle",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.get("/filters", async (req, res) => {
  try {
    const filters = {
      topics: await Insight.distinct("topic"),
      sectors: await Insight.distinct("sector"),
      regions: await Insight.distinct("region"),
      countries: await Insight.distinct("country"),
      pestles: await Insight.distinct("pestle"),
      sources: await Insight.distinct("source"),
      years: (await Insight.distinct("year")).sort(),
      cities: await Insight.distinct("city"),
      swots: await Insight.distinct("swot"),
    };

    res.json(filters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
