const express = require("express")
const router = express.Router()
const workoutController = require("../controllers/workout.controller")
const { verifyToken } = require("../middleware/auth.middleware")

// Get all workouts for current user
router.get("/", verifyToken, workoutController.getWorkouts)

// Get recent workouts
router.get("/recent", verifyToken, workoutController.getRecentWorkouts)

// Get user metrics
router.get("/metrics", verifyToken, workoutController.getUserMetrics)

// Start workout from template
router.post("/from-template/:templateId", verifyToken, workoutController.startWorkoutFromTemplate)

// Get workout by ID
router.get("/:id", verifyToken, workoutController.getWorkout)

// Create new workout
router.post("/", verifyToken, workoutController.createWorkout)

// Update workout
router.put("/:id", verifyToken, workoutController.updateWorkout)

// Delete workout
router.delete("/:id", verifyToken, workoutController.deleteWorkout)

module.exports = router
