// backend/models/workout.model.js
const mongoose = require("mongoose");

const setSchema = new mongoose.Schema({
  reps: { type: Number, required: [true, "Las repeticiones son obligatorias por serie."], min: 0 },
  weight: { type: Number, required: [true, "El peso es obligatorio por serie."], min: 0 },
  // rpe: { type: Number, min: 0, max: 10, default: null }, // ELIMINADO
  restTime: { type: Number, min: 0, default: 60 }, // AÑADIDO: Descanso en segundos, default 60s
  notes: { type: String, trim: true, default: '' }
}, { _id: false });

const exercisePerformedSchema = new mongoose.Schema({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exercise",
    required: [true, "El ejercicio es obligatorio."]
  },
  sets: [setSchema]
}, { _id: false });

const workoutSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: [true, "La fecha del entrenamiento es obligatoria."], default: Date.now },
    name: { type: String, required: [true, "El nombre del entrenamiento es obligatorio."], trim: true },
    exercises: [exercisePerformedSchema],
    duration: { type: Number, min: 0, default: null }, // Se calculará y guardará
    notes: { type: String, trim: true, default: '' },
    fromTemplate: { type: mongoose.Schema.Types.ObjectId, ref: "Template", default: null },
    isCompleted: { type: Boolean, default: false, }
  },
  { timestamps: true }
);

const Workout = mongoose.model("Workout", workoutSchema);
module.exports = Workout;