const express = require("express");
const { execSync } = require("child_process");
const sequelize = require("./config/database");
require("dotenv").config();
const Tokens = require("./models/tokens");
const Bux = require("./models/bux");
const SpinLogs = require("./models/spinLogs");
const cors = require("cors");

// Import the routes
const gameRoutes = require("./routes/gameRoutes");

const app = express();

const corsOptions = {
  origin: "http://localhost:5173", // Allow only the origin of your React dev server
};
app.use(cors(corsOptions)); // Apply CORS settings

// Express JSON parsing middleware
app.use(express.json()); // This needs to come before any routes that will use it

// Check database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
    // Run Sequelize migrations
    try {
      execSync("npx sequelize-cli db:migrate");
      console.log("Migrations applied successfully");
    } catch (error) {
      console.error("Error applying migrations:", error);
    }
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

// POST endpoint to store tokens
app.post("/tokens", async (req, res) => {
  try {
    const newToken = await Tokens.create({
      userId: req.body.userId,
      balance: req.body.balance,
    });
    res.status(201).send(newToken);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error storing tokens: " + error.message);
  }
});

// POST endpoint to store bux
app.post("/bux", async (req, res) => {
  try {
    const newBux = await Bux.create({
      userId: req.body.userId,
      balance: req.body.balance,
    });
    res.status(201).send(newBux);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error storing bux: " + error.message);
  }
});

// POST endpoint to store spin logs
app.post("/spinlogs", async (req, res) => {
  try {
    const newSpinLog = await SpinLogs.create({
      userId: req.body.userId,
      outcome: req.body.outcome,
      dateTime: req.body.dateTime,
    });
    res.status(201).send(newSpinLog);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error storing spin logs: " + error.message);
  }
});

// Use your defined routes
app.use(gameRoutes);

// Basic home route for testing
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
