const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bodyParser = require("body-parser")
const dotenv = require("dotenv")
const path = require("path")

// Routes
const authRoutes = require("./routes/auth.routes")
const userRoutes = require("./routes/user.routes")
const workoutRoutes = require("./routes/workout.routes")
const templateRoutes = require("./routes/template.routes")
const exerciseRoutes = require("./routes/exercise.routes")
const standardRoutes = require("./routes/standard.routes")
const calculatorRoutes = require("./routes/calculator.routes")
const dashboardRoutes = require("./routes/dashboard.routes");

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/workouts", workoutRoutes)
app.use("/api/templates", templateRoutes)
app.use("/api/exercises", exerciseRoutes)
app.use("/api/standards", standardRoutes)
app.use("/api/calculators", calculatorRoutes)
app.use("/api/dashboard", dashboardRoutes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist/frontend")))

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/frontend/index.html"))
  })
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB")
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err)
  })
