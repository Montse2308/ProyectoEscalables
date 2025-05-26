const express = require("express")
const router = express.Router()
const exerciseController = require("../controllers/exercise.controller")
const { verifyToken, isAdmin } = require("../middleware/auth.middleware")

router.get("/", exerciseController.getExercises)

router.get("/:id", exerciseController.getExercise)

router.post("/", verifyToken, isAdmin, exerciseController.createExercise)

router.put("/:id", verifyToken, isAdmin, exerciseController.updateExercise)

router.delete("/:id", verifyToken, isAdmin, exerciseController.deleteExercise)

module.exports = router
