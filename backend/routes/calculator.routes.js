const express = require("express")
const router = express.Router()
const calculatorController = require("../controllers/calculator.controller")

// 1RM Calculator
router.post("/one-rm", calculatorController.calculate1RM)

// Wilks Calculator
router.post("/wilks", calculatorController.calculateWilks)

// Strength Level Calculator
router.post("/strength-level", calculatorController.calculateStrengthLevel)

module.exports = router
