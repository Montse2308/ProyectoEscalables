const mongoose = require("mongoose");

const strengthLevelRatiosSchema = new mongoose.Schema({
  principiante: { type: Number, required: true, min: 0 },
  novato: { type: Number, required: true, min: 0 },
  intermedio: { type: Number, required: true, min: 0 },
  avanzado: { type: Number, required: true, min: 0 },
  elite: { type: Number, required: true, min: 0 },
}, { _id: false }); 

const standardSchema = new mongoose.Schema(
  {
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise",
      required: [true, "El ejercicio es obligatorio."],
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female"],
        message: "El género debe ser 'male' o 'female'."
      },
      required: [true, "El género es obligatorio."],
    },
    ratios: { 
      type: strengthLevelRatiosSchema,
      required: [true, "Los ratios de nivel de fuerza son obligatorios."],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  { 
    timestamps: true, 
    indexes: [{ unique: true, fields: ['exercise', 'gender'] }]
  }
);

standardSchema.pre('save', async function (next) {
  if (this.isNew) {
    const existing = await mongoose.model('Standard').findOne({
      exercise: this.exercise,
      gender: this.gender,
    });
    if (existing) {
      const err = new Error(`Ya existe un estándar definido para el ejercicio '${this.exercise}' y el género '${this.gender}'. Edita el existente en lugar de crear uno nuevo.`);
      err.isDuplicate = true; 
      return next(err);
    }
  }
  next();
});


const Standard = mongoose.model("Standard", standardSchema);

module.exports = Standard;