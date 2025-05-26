const Exercise = require("../models/exercise.model");

exports.getExercises = async (req, res) => {
  try {
    const {
      muscleGroupToSearch,
      movementType,
      exerciseType,       
      isPowerlifting
    } = req.query;

    const filter = {};

    if (muscleGroupToSearch) {
      filter.muscleGroups = muscleGroupToSearch;
    }


    if (movementType) {
      filter.movementType = movementType;
    }

    if (exerciseType) {
      filter.exerciseType = exerciseType;
    }

    if (isPowerlifting !== undefined) {
      filter.isPowerlifting = isPowerlifting === "true";
    }

    const exercises = await Exercise.find(filter)
      .populate("createdBy", "name")
      .sort({ name: 1 });

    res.status(200).json(exercises);
  } catch (error) {
    console.error("Error en getExercises:", error);
    res.status(500).json({ message: "Error del servidor al obtener ejercicios", error: error.message });
  }
};

exports.getExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id).populate("createdBy", "name");

    if (!exercise) {
      return res.status(404).json({ message: "Ejercicio no encontrado" });
    }

    res.status(200).json(exercise);
  } catch (error) {
    console.error("Error en getExercise (ID):", error);
    res.status(500).json({ message: "Error del servidor al obtener el ejercicio", error: error.message });
  }
};

exports.createExercise = async (req, res) => {
  try {
    const exerciseData = {
      ...req.body,
      createdBy: req.user._id, 
    };

    if (exerciseData.muscleGroups && !Array.isArray(exerciseData.muscleGroups)) {
      // Asegurarse de que muscleGroups sea un array
    }


    const exercise = new Exercise(exerciseData);
    await exercise.save(); 

    const populatedExercise = await Exercise.findById(exercise._id).populate("createdBy", "name");
    res.status(201).json(populatedExercise);

  } catch (error) {
    console.error("Error en createExercise:", error); // Muy importante loguear el error completo aquí
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: "Error de validación al crear ejercicio", errors: messages });
    }
    res.status(500).json({ message: "Error del servidor al crear el ejercicio", error: error.message });
  }
};

exports.updateExercise = async (req, res) => {
  try {

    const updateData = { ...req.body };

    const exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      updateData, 
      { new: true, runValidators: true } 
    ).populate("createdBy", "name");

    if (!exercise) {
      return res.status(404).json({ message: "Ejercicio no encontrado para actualizar" });
    }

    res.status(200).json(exercise);
  } catch (error) {
    console.error("Error en updateExercise:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: "Error de validación al actualizar ejercicio", errors: messages });
    }
    res.status(500).json({ message: "Error del servidor al actualizar el ejercicio", error: error.message });
  }
};

exports.deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);

    if (!exercise) {
      return res.status(404).json({ message: "Ejercicio no encontrado para eliminar" });
    }

    res.status(200).json({ message: "Ejercicio eliminado correctamente" });
  } catch (error) {
    console.error("Error en deleteExercise:", error);
    res.status(500).json({ message: "Error del servidor al eliminar el ejercicio", error: error.message });
  }
};