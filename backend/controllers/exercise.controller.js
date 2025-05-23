const Exercise = require("../models/exercise.model")

// Get all exercises
exports.getExercises = async (req, res) => {
  try {
    const { muscleGroup, movementType, isCompound, isPowerlifting } = req.query

    const filter = {}

    if (muscleGroup) filter.muscleGroup = muscleGroup
    if (movementType) filter.movementType = movementType
    if (isCompound !== undefined) filter.isCompound = isCompound === "true"
    if (isPowerlifting !== undefined) filter.isPowerlifting = isPowerlifting === "true"

    const exercises = await Exercise.find(filter).populate("createdBy", "name").sort({ name: 1 })

    res.status(200).json(exercises)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get exercise by ID
exports.getExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id).populate("createdBy", "name")

    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" })
    }

    res.status(200).json(exercise)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create new exercise (admin only)
exports.createExercise = async (req, res) => {
  try {
    const exerciseData = {
      ...req.body,
      createdBy: req.user._id,
    }

    const exercise = new Exercise(exerciseData)
    await exercise.save()

    const populatedExercise = await Exercise.findById(exercise._id).populate("createdBy", "name")

    res.status(201).json(populatedExercise)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update exercise (admin only)
exports.updateExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true },
    ).populate("createdBy", "name")

    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" })
    }

    res.status(200).json(exercise)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete exercise (admin only)
exports.deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id)

    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" })
    }

    res.status(200).json({ message: "Exercise deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
