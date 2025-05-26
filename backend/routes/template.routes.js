const express = require("express")
const router = express.Router()
const templateController = require("../controllers/template.controller")
const { verifyToken } = require("../middleware/auth.middleware")

router.get("/", verifyToken, templateController.getTemplates)

router.get("/:id", verifyToken, templateController.getTemplate)

router.post("/", verifyToken, templateController.createTemplate)

router.put("/:id", verifyToken, templateController.updateTemplate)

router.delete("/:id", verifyToken, templateController.deleteTemplate)

module.exports = router
