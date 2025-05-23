const express = require("express")
const router = express.Router()
const standardController = require("../controllers/standard.controller")
const { verifyToken, isAdmin } = require("../middleware/auth.middleware")

// Get all standards
router.get("/", standardController.getStandards)

// Get standard by ID
router.get("/:id", standardController.getStandard)

// Create new standard (admin only)
router.post("/", verifyToken, isAdmin, standardController.createStandard)

// Update standard (admin only)
router.put("/:id", verifyToken, isAdmin, standardController.updateStandard)

// Delete standard (admin only)
router.delete("/:id", verifyToken, isAdmin, standardController.deleteStandard)

module.exports = router
