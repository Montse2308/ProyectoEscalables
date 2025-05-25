// backend/controllers/standard.controller.js
const Standard = require("../models/standard.model");
const Exercise = require("../models/exercise.model"); // Para popular

// Get all standards
exports.getStandards = async (req, res) => {
  try {
    const { exerciseId, gender } = req.query; // Cambiado a exerciseId para claridad
    const filter = {};
    if (exerciseId) filter.exercise = exerciseId;
    if (gender) filter.gender = gender;

    const standards = await Standard.find(filter)
      .populate({ path: "exercise", model: Exercise, select: "name _id" }) // Popular ejercicio con nombre
      .populate("createdBy", "name")
      .sort({ 'exercise.name': 1, gender: 1 }); // Ordenar por nombre de ejercicio, luego género

    res.status(200).json(standards);
  } catch (error) {
    console.error("Error en getStandards:", error);
    res.status(500).json({ message: "Error del servidor al obtener estándares", error: error.message });
  }
};

// Get standard by ID (puede ser menos útil ahora que se identifican por ejercicio/género)
exports.getStandard = async (req, res) => {
  try {
    const standard = await Standard.findById(req.params.id)
      .populate({ path: "exercise", model: Exercise, select: "name _id" })
      .populate("createdBy", "name");

    if (!standard) {
      return res.status(404).json({ message: "Estándar no encontrado" });
    }
    res.status(200).json(standard);
  } catch (error) {
    console.error("Error en getStandard (ID):", error);
    res.status(500).json({ message: "Error del servidor al obtener el estándar", error: error.message });
  }
};

// Create new standard (admin only)
exports.createStandard = async (req, res) => {
  try {
    const { exercise, gender, ratios } = req.body;

    // La validación de duplicados está en el middleware pre('save') del modelo
    // pero una comprobación aquí podría dar un mensaje más amigable si no quieres depender solo del middleware.
    // const existingStandard = await Standard.findOne({ exercise, gender });
    // if (existingStandard) {
    //   return res.status(409).json({ message: `Ya existe un estándar para el ejercicio y género seleccionados. Por favor, edita el existente.` });
    // }

    const standardData = {
      exercise,
      gender,
      ratios,
      createdBy: req.user._id, // Asumiendo que req.user está disponible
    };

    const newStandard = new Standard(standardData);
    await newStandard.save();

    // Popular el ejercicio para la respuesta
    const populatedStandard = await Standard.findById(newStandard._id)
        .populate({ path: "exercise", model: Exercise, select: "name _id" })
        .populate("createdBy", "name");

    res.status(201).json(populatedStandard);
  } catch (error) {
    console.error("Error en createStandard:", error);
     if (error.isDuplicate || (error.code === 11000 && error.message.includes('exercise_1_gender_1'))) { // MongoDB duplicate key error
      return res.status(409).json({ message: `Error: Ya existe un estándar definido para este ejercicio y género.` });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: "Error de validación al crear estándar", errors: messages });
    }
    res.status(500).json({ message: "Error del servidor al crear el estándar", error: error.message });
  }
};

// Update standard by ID (admin only)
exports.updateStandard = async (req, res) => {
  try {
    const { ratios } = req.body; // Solo se deberían poder actualizar los ratios
    // No permitir cambiar ejercicio o género de un estándar existente, se debería crear uno nuevo.
    // O si se permite, la lógica sería más compleja para evitar duplicados.
    // Por simplicidad, asumimos que solo actualizamos ratios de un estándar identificado por ID.

    if (!ratios) {
        return res.status(400).json({ message: "Faltan los datos de ratios para actualizar." });
    }
    
    // Validar que todos los campos de ratios estén presentes y sean números
    const requiredRatioKeys = ['principiante', 'novato', 'intermedio', 'avanzado', 'elite'];
    for (const key of requiredRatioKeys) {
        if (ratios[key] === undefined || typeof ratios[key] !== 'number' || ratios[key] < 0) {
            return res.status(400).json({ message: `El ratio para '${key}' es inválido o falta.` });
        }
    }


    const standard = await Standard.findByIdAndUpdate(
      req.params.id,
      { ratios, updatedAt: Date.now() }, // Actualizar solo los ratios
      { new: true, runValidators: true }
    )
    .populate({ path: "exercise", model: Exercise, select: "name _id" })
    .populate("createdBy", "name");

    if (!standard) {
      return res.status(404).json({ message: "Estándar no encontrado para actualizar" });
    }

    res.status(200).json(standard);
  } catch (error) {
    console.error("Error en updateStandard:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: "Error de validación al actualizar estándar", errors: messages });
    }
    res.status(500).json({ message: "Error del servidor al actualizar el estándar", error: error.message });
  }
};

// Delete standard (admin only) - Esto eliminaría la combinación ejercicio/género
exports.deleteStandard = async (req, res) => {
  try {
    const standard = await Standard.findByIdAndDelete(req.params.id);
    if (!standard) {
      return res.status(404).json({ message: "Estándar no encontrado para eliminar" });
    }
    res.status(200).json({ message: "Estándar eliminado correctamente" });
  } catch (error) {
    console.error("Error en deleteStandard:", error);
    res.status(500).json({ message: "Error del servidor al eliminar el estándar", error: error.message });
  }
};