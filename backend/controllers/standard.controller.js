const Standard = require("../models/standard.model");
const Exercise = require("../models/exercise.model"); 

exports.getStandards = async (req, res) => {
  try {
    const { exerciseId, gender } = req.query; 
    const filter = {};
    if (exerciseId) filter.exercise = exerciseId;
    if (gender) filter.gender = gender;

    const standards = await Standard.find(filter)
      .populate({ path: "exercise", model: Exercise, select: "name _id" }) 
      .populate("createdBy", "name")
      .sort({ 'exercise.name': 1, gender: 1 }); 

    res.status(200).json(standards);
  } catch (error) {
    console.error("Error en getStandards:", error);
    res.status(500).json({ message: "Error del servidor al obtener estándares", error: error.message });
  }
};

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

exports.createStandard = async (req, res) => {
  try {
    const { exercise, gender, ratios } = req.body;


    const standardData = {
      exercise,
      gender,
      ratios,
      createdBy: req.user._id, 
    };

    const newStandard = new Standard(standardData);
    await newStandard.save();

    const populatedStandard = await Standard.findById(newStandard._id)
        .populate({ path: "exercise", model: Exercise, select: "name _id" })
        .populate("createdBy", "name");

    res.status(201).json(populatedStandard);
  } catch (error) {
    console.error("Error en createStandard:", error);
     if (error.isDuplicate || (error.code === 11000 && error.message.includes('exercise_1_gender_1'))) { 
      return res.status(409).json({ message: `Error: Ya existe un estándar definido para este ejercicio y género.` });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: "Error de validación al crear estándar", errors: messages });
    }
    res.status(500).json({ message: "Error del servidor al crear el estándar", error: error.message });
  }
};

exports.updateStandard = async (req, res) => {
  try {
    const { ratios } = req.body; 
    if (!ratios) {
        return res.status(400).json({ message: "Faltan los datos de ratios para actualizar." });
    }
    
    const requiredRatioKeys = ['principiante', 'novato', 'intermedio', 'avanzado', 'elite'];
    for (const key of requiredRatioKeys) {
        if (ratios[key] === undefined || typeof ratios[key] !== 'number' || ratios[key] < 0) {
            return res.status(400).json({ message: `El ratio para '${key}' es inválido o falta.` });
        }
    }


    const standard = await Standard.findByIdAndUpdate(
      req.params.id,
      { ratios, updatedAt: Date.now() }, 
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