const Workout = require("../models/workout.model")
const Template = require("../models/template.model")

// Get all workouts for current user
exports.getWorkouts = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const workouts = await Workout.find({ user: req.user._id })
      .populate("exercises.exercise")
      .populate("fromTemplate", "name")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Workout.countDocuments({ user: req.user._id })

    res.status(200).json({
      workouts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get recent workouts
exports.getRecentWorkouts = async (req, res) => {
  try {
    const limit = Number.parseInt(req.query.limit) || 6

    const workouts = await Workout.find({ user: req.user._id })
      .populate("exercises.exercise")
      .sort({ date: -1 })
      .limit(limit)

    res.status(200).json(workouts)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get workout by ID
exports.getWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("exercises.exercise")
      .populate("fromTemplate", "name")

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" })
    }

    res.status(200).json(workout)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create new workout
exports.createWorkout = async (req, res) => {
  try {
    const workoutData = {
      ...req.body,
      user: req.user._id,
    }

    const workout = new Workout(workoutData)
    await workout.save()

    const populatedWorkout = await Workout.findById(workout._id)
      .populate("exercises.exercise")
      .populate("fromTemplate", "name")

    res.status(201).json(populatedWorkout)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update workout
exports.updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true },
    )
      .populate("exercises.exercise")
      .populate("fromTemplate", "name")

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" })
    }

    res.status(200).json(workout)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete workout
exports.deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" })
    }

    res.status(200).json({ message: "Workout deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Start workout from template
exports.startWorkoutFromTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.templateId).populate("exercises.exercise")

    if (!template) {
      return res.status(404).json({ message: "Template not found" })
    }

    // Create workout from template
    const workoutData = {
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      user: req.user._id,
      date: new Date(),
      fromTemplate: template._id,
      exercises: template.exercises.map((templateExercise) => ({
        exercise: templateExercise.exercise._id,
        sets: Array(templateExercise.sets)
          .fill()
          .map(() => ({
            reps: templateExercise.reps,
            weight: 0,
            rpe: null,
            notes: "",
          })),
      })),
    }

    const workout = new Workout(workoutData)
    await workout.save()

    const populatedWorkout = await Workout.findById(workout._id)
      .populate("exercises.exercise")
      .populate("fromTemplate", "name")

    res.status(201).json(populatedWorkout)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get user metrics
exports.getUserMetrics = async (req, res) => {
  try {
    const userId = req.user._id

    // Total workouts
    const totalWorkouts = await Workout.countDocuments({ user: userId })

    // Workouts this week
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const weeklyWorkouts = await Workout.countDocuments({
      user: userId,
      date: { $gte: weekStart },
    })

    // Find strongest lift
    const workouts = await Workout.find({ user: userId }).populate("exercises.exercise")

    let strongestLift = { exercise: "None", weight: 0 }

    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        exercise.sets.forEach((set) => {
          if (set.weight > strongestLift.weight) {
            strongestLift = {
              exercise: exercise.exercise.name,
              weight: set.weight,
            }
          }
        })
      })
    })

    res.status(200).json({
      totalWorkouts,
      weeklyWorkouts,
      strongestLift,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
