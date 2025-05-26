const express = require("express")
const router = express.Router()
const calculatorController = require("../controllers/calculator.controller")

router.post("/one-rm", calculatorController.calculate1RM)

router.post("/wilks", calculatorController.calculateWilks)

router.post("/strength-level", calculatorController.calculateStrengthLevel)

module.exports = router
