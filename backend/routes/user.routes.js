const express = require("express")
const router = express.Router()
const userController = require("../controllers/user.controller")
const { verifyToken, isAdmin } = require("../middleware/auth.middleware")

router.get("/", verifyToken, isAdmin, userController.getAllUsers)

router.get("/:id", verifyToken, userController.getUser)

router.put("/profile", verifyToken, userController.updateProfile)

router.delete("/:id", verifyToken, isAdmin, userController.deleteUser)

module.exports = router
