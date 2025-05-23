const express = require("express")
const router = express.Router()
const exerciseController = require("../controllers/exercise.controller")
const { verifyToken, isAdmin } = require("../middleware/auth.middleware")

// Get all exercises
router.get("/", exerciseController.getExercises)

// Get exercise by ID
router.get("/:id", exerciseController.getExercise)

// Create new exercise (admin only)
router.post("/", verifyToken, isAdmin, exerciseController.createExercise)

// Update exercise (admin only)
router.put("/:id", verifyToken, isAdmin, exerciseController.updateExercise)

// Delete exercise (admin only)
router.delete("/:id", verifyToken, isAdmin, exerciseController.deleteExercise)

module.exports = router
