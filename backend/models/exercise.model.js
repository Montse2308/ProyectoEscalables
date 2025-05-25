// backend/models/exercise.model.js
const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del ejercicio es obligatorio."],
      unique: true,
      trim: true,
    },
    exerciseType: { // Nuevo campo
      type: String,
      required: [true, "El tipo de ejercicio es obligatorio."],
      enum: {
        values: ["compound", "specific"],
        message: "{VALUE} no es un tipo de ejercicio válido (compuesto/específico)."
      }
    },
    muscleGroups: [{ // Cambiado de muscleGroup a muscleGroups y ahora es un Array
      type: String,
      required: [true, "Se requiere al menos un grupo muscular."],
      enum: { // Nuevos valores detallados
        values: [
          "pecho", "espalda", "hombros",
          "biceps", "triceps", "antebrazos",
          "cuadriceps", "femorales", "gluteos", "pantorrillas",
          "core", "cuerpo_completo"
        ],
        message: "Grupo muscular '{VALUE}' no válido."
      }
    }],
    movementType: {
      type: String,
      required: [true, "El tipo de movimiento es obligatorio."],
      enum: {
        values: ["push", "pull", "squat", "hinge", "carry", "rotation", "isometric"],
        message: "Tipo de movimiento '{VALUE}' no válido."
      }
    },
    description: {
      type: String,
      trim: true,
    },
    // isCompound: { // Eliminado
    //   type: Boolean,
    //   default: false,
    // },
    isPowerlifting: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Asumiendo que siempre se sabe quién crea el ejercicio
    }
    // createdAt y updatedAt son manejados por timestamps: true
  },
  { timestamps: true } // Habilita createdAt y updatedAt automáticamente
);

// Validación para asegurar que si es 'specific', solo haya un grupo muscular
exerciseSchema.pre('save', function(next) {
  if (this.exerciseType === 'specific' && this.muscleGroups.length > 1) {
    next(new Error('Para ejercicios específicos, solo se permite un grupo muscular.'));
  } else {
    next();
  }
});


const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = Exercise;