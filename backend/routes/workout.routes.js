const express = require("express")
const router = express.Router()
const workoutController = require("../controllers/workout.controller")
const { verifyToken } = require("../middleware/auth.middleware")

router.get("/", verifyToken, workoutController.getWorkouts)

router.get("/recent", verifyToken, workoutController.getRecentWorkouts)

router.get("/metrics", verifyToken, workoutController.getUserMetrics)

router.post("/from-template/:templateId", verifyToken, workoutController.startWorkoutFromTemplate)

router.get("/:id", verifyToken, workoutController.getWorkout)

router.post("/", verifyToken, workoutController.createWorkout)

router.put("/:id", verifyToken, workoutController.updateWorkout)

router.delete("/:id", verifyToken, workoutController.deleteWorkout)

module.exports = router
