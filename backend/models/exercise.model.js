const mongoose = require("mongoose")

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    muscleGroup: {
      type: String,
      required: true,
      enum: ["chest", "back", "shoulders", "arms", "legs", "core", "full body"],
    },
    movementType: {
      type: String,
      required: true,
      enum: ["push", "pull", "squat", "hinge", "carry", "rotation", "isometric"],
    },
    description: {
      type: String,
      trim: true,
    },
    isCompound: {
      type: Boolean,
      default: false,
    },
    isPowerlifting: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

const Exercise = mongoose.model("Exercise", exerciseSchema)

module.exports = Exercise
