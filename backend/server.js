
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

let reportsCollection;

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "LeakLens backend is running!",
    database: "MongoDB"
  });
});

// Get all reports
app.get("/api/reports", async (req, res) => {
  try {
    const reports = await reportsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(reports);
  } catch (error) {
    console.error("Fetch reports error:", error.message);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Create a report
app.post("/api/reports", async (req, res) => {
  try {
    const { title, type, severity, location, description } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof type !== "string" ||
      !["Water leak", "Waterlogging", "Water shortage", "Flooding"].includes(type) ||
      !["Low", "Medium", "High", "Critical"].includes(severity) ||
      typeof location !== "string" ||
      !location.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        error: "Please provide valid title, type, severity, location, and description."
      });
    }

    const report = {
      title: title.trim(),
      type,
      severity,
      location: location.trim(),
      description: description.trim(),
      status: "Reported",
      createdAt: new Date()
    };

    const result = await reportsCollection.insertOne(report);

    res.status(201).json({
      ...report,
      _id: result.insertedId
    });
  } catch (error) {
    console.error("Create report error:", error.message);
    res.status(500).json({ error: "Failed to create report" });
  }
});

// Update report status
app.patch("/api/reports/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Reported",
      "In Progress",
      "Resolved"
    ];

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid report ID"
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status"
      });
    }

    const result = await reportsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        error: "Report not found"
      });
    }

    res.json({
      message: "Report status updated successfully",
      status
    });
  } catch (error) {
    console.error("Update status error:", error.message);
    res.status(500).json({
      error: "Failed to update report status"
    });
  }
});

// Connect to MongoDB before accepting requests
async function startServer() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing from backend/.env");
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();

    const database = client.db("leaklens");
    reportsCollection = database.collection("reports");

    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`LeakLens server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database startup failed:", error.message);
    await client.close().catch(() => {});
    process.exit(1);
  }
}

startServer();
