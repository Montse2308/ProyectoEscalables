const mongoose = require("mongoose")

const strengthLevelSchema = new mongoose.Schema({
  beginner: {
    type: Number,
    required: true,
    min: 0,
  },
  novice: {
    type: Number,
    required: true,
    min: 0,
  },
  intermediate: {
    type: Number,
    required: true,
    min: 0,
  },
  advanced: {
    type: Number,
    required: true,
    min: 0,
  },
  elite: {
    type: Number,
    required: true,
    min: 0,
  },
})

const weightCategorySchema = new mongoose.Schema({
  minWeight: {
    type: Number,
    required: true,
    min: 30,
  },
  maxWeight: {
    type: Number,
    required: true,
    min: 30,
  },
  strengthLevels: {
    type: strengthLevelSchema,
    required: true,
  },
})

const standardSchema = new mongoose.Schema(
  {
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    weightCategories: [weightCategorySchema],
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

const Standard = mongoose.model("Standard", standardSchema)

module.exports = Standard
