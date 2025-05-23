// 1RM Calculator
exports.calculate1RM = (req, res) => {
  try {
    const { weight, reps } = req.body

    if (!weight || !reps) {
      return res.status(400).json({ message: "Weight and reps are required" })
    }

    // Brzycki formula: 1RM = weight × (36 / (37 - reps))
    const oneRM = weight * (36 / (37 - reps))

    res.status(200).json({ oneRM: Math.round(oneRM * 100) / 100 })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Wilks Calculator
exports.calculateWilks = (req, res) => {
  try {
    const { bodyWeight, liftedWeight, gender } = req.body

    if (!bodyWeight || !liftedWeight || !gender) {
      return res.status(400).json({ message: "Body weight, lifted weight, and gender are required" })
    }

    let wilksCoefficient

    if (gender === "male") {
      // Male Wilks Coefficient formula
      const a = -216.0475144
      const b = 16.2606339
      const c = -0.002388645
      const d = -0.00113732
      const e = 7.01863e-6
      const f = -1.291e-8

      wilksCoefficient =
        500 /
        (a +
          b * bodyWeight +
          c * Math.pow(bodyWeight, 2) +
          d * Math.pow(bodyWeight, 3) +
          e * Math.pow(bodyWeight, 4) +
          f * Math.pow(bodyWeight, 5))
    } else {
      // Female Wilks Coefficient formula
      const a = 594.31747775582
      const b = -27.23842536447
      const c = 0.82112226871
      const d = -0.00930733913
      const e = 0.00004731582
      const f = -0.00000009054

      wilksCoefficient =
        500 /
        (a +
          b * bodyWeight +
          c * Math.pow(bodyWeight, 2) +
          d * Math.pow(bodyWeight, 3) +
          e * Math.pow(bodyWeight, 4) +
          f * Math.pow(bodyWeight, 5))
    }

    const wilksScore = liftedWeight * wilksCoefficient

    res.status(200).json({ wilksScore: Math.round(wilksScore * 100) / 100 })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Strength Level Calculator
exports.calculateStrengthLevel = (req, res) => {
  try {
    const { exercise, oneRM, bodyWeight, gender } = req.body

    if (!exercise || !oneRM || !bodyWeight || !gender) {
      return res.status(400).json({ message: "Exercise, 1RM, body weight, and gender are required" })
    }

    // This would typically query the database for strength standards
    // For now, we'll return a placeholder response
    res.status(200).json({
      strengthLevel: "intermediate",
      percentiles: {
        beginner: 60,
        novice: 80,
        intermediate: 120,
        advanced: 160,
        elite: 200,
      },
      percentage: 65, // Percentage towards next level
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
