const express = require("express")
const router = express.Router()
const templateController = require("../controllers/template.controller")
const { verifyToken } = require("../middleware/auth.middleware")

// Get all templates
router.get("/", verifyToken, templateController.getTemplates)

// Get template by ID
router.get("/:id", verifyToken, templateController.getTemplate)

// Create new template
router.post("/", verifyToken, templateController.createTemplate)

// Update template
router.put("/:id", verifyToken, templateController.updateTemplate)

// Delete template
router.delete("/:id", verifyToken, templateController.deleteTemplate)

module.exports = router
