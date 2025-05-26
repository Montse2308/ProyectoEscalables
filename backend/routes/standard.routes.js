const express = require("express")
const router = express.Router()
const standardController = require("../controllers/standard.controller")
const { verifyToken, isAdmin } = require("../middleware/auth.middleware")

router.get("/", standardController.getStandards)

router.get("/:id", standardController.getStandard)

router.post("/", verifyToken, isAdmin, standardController.createStandard)

router.put("/:id", verifyToken, isAdmin, standardController.updateStandard)

router.delete("/:id", verifyToken, isAdmin, standardController.deleteStandard)

module.exports = router
