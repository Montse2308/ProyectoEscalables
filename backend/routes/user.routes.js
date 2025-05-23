const express = require("express")
const router = express.Router()
const userController = require("../controllers/user.controller")
const { verifyToken, isAdmin } = require("../middleware/auth.middleware")

// Get all users (admin only)
router.get("/", verifyToken, isAdmin, userController.getAllUsers)

// Get user by ID
router.get("/:id", verifyToken, userController.getUser)

// Update user profile
router.put("/profile", verifyToken, userController.updateProfile)

// Delete user (admin only)
router.delete("/:id", verifyToken, isAdmin, userController.deleteUser)

module.exports = router
