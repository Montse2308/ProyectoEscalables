const Standard = require("../models/standard.model")

// Get all standards
exports.getStandards = async (req, res) => {
  try {
    const { exercise, gender } = req.query

    const filter = {}

    if (exercise) filter.exercise = exercise
    if (gender) filter.gender = gender

    const standards = await Standard.find(filter)
      .populate("exercise")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })

    res.status(200).json(standards)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get standard by ID
exports.getStandard = async (req, res) => {
  try {
    const standard = await Standard.findById(req.params.id).populate("exercise").populate("createdBy", "name")

    if (!standard) {
      return res.status(404).json({ message: "Standard not found" })
    }

    res.status(200).json(standard)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create new standard (admin only)
exports.createStandard = async (req, res) => {
  try {
    const standardData = {
      ...req.body,
      createdBy: req.user._id,
    }

    const standard = new Standard(standardData)
    await standard.save()

    const populatedStandard = await Standard.findById(standard._id).populate("exercise").populate("createdBy", "name")

    res.status(201).json(populatedStandard)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update standard (admin only)
exports.updateStandard = async (req, res) => {
  try {
    const standard = await Standard.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true },
    )
      .populate("exercise")
      .populate("createdBy", "name")

    if (!standard) {
      return res.status(404).json({ message: "Standard not found" })
    }

    res.status(200).json(standard)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete standard (admin only)
exports.deleteStandard = async (req, res) => {
  try {
    const standard = await Standard.findByIdAndDelete(req.params.id)

    if (!standard) {
      return res.status(404).json({ message: "Standard not found" })
    }

    res.status(200).json({ message: "Standard deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
