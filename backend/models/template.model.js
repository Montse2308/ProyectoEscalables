const mongoose = require("mongoose");

const templateExerciseSchema = new mongoose.Schema({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exercise",
    required: true,
  },
  sets: {
    type: Number,
    required: true,
    min: 1,
  },
  reps: {
    type: Number,
    required: true,
    min: 1,
  },
  restTime: {
    type: Number, 
    default: 60,
    min: 0, 
  },
  notes: String,
}, { _id: false }); 

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre de la plantilla es requerido."],
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    exercises: [templateExerciseSchema],

  },
  { timestamps: true }
);

const Template = mongoose.model("Template", templateSchema);

module.exports = Template;