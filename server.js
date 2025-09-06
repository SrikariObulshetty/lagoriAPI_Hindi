const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());


// Load JSON once at startup
const careerPaths = JSON.parse(fs.readFileSync("career_paths.json", "utf-8"));

// Helper to find where the current class belongs
function findStageIndex(stages, classNum) {
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const match = stage.stage_title.match(/Class\s*(\d+)\s*[–-]?\s*(\d+)?/);
    if (match) {
      const start = parseInt(match[1]);
      const end = match[2] ? parseInt(match[2]) : start;
      if (classNum >= start && classNum <= end) {
        return i;
      }
    }
  }
  return -1;
}

// API endpoint
app.get("/api/roadmap", (req, res) => {
  const career = req.query.career;
  const classNum = parseInt(req.query.class);

  if (!career || !classNum) {
    return res.status(400).json({ error: "Please provide career and class" });
  }

  const stages = careerPaths[career];
  if (!stages) {
    return res.status(404).json({ error: "Career not found" });
  }

  const startIndex = findStageIndex(stages, classNum);
  if (startIndex === -1) {
    return res.status(404).json({ error: "No roadmap found for this class" });
  }

  // Return all stages from current class onwards
  const remainingStages = stages.slice(startIndex);

  return res.json({
    career,
    starting_class: classNum,
    roadmap: remainingStages,
  });
});


module.exports = app;


