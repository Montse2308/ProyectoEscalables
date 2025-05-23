const mongoose = require("mongoose")

const setSchema = new mongoose.Schema({
  reps: {
    type: Number,
    required: true,
    min: 1,
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
  },
  rpe: {
    type: Number,
    min: 0,
    max: 10,
  },
  notes: String,
})

const exercisePerformedSchema = new mongoose.Schema({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exercise",
    required: true,
  },
  sets: [setSchema],
})

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    exercises: [exercisePerformedSchema],
    duration: {
      type: Number, // in minutes
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    fromTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

const Workout = mongoose.model("Workout", workoutSchema)

module.exports = Workout
