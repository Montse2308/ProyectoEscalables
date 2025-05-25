// backend/controllers/exercise.controller.js
const Exercise = require("../models/exercise.model");

// Get all exercises
exports.getExercises = async (req, res) => {
  try {
    // Usar los nombres de campo del NUEVO esquema para los query params
    const {
      // 'muscleGroupQuery' podría ser un query param si quieres buscar por un solo grupo dentro del array
      // o 'muscleGroupsQuery' si esperas una lista separada por comas
      muscleGroupToSearch, // Renombrado para claridad, asume que se busca si este grupo está en el array
      movementType,
      exerciseType,       // NUEVO: Reemplaza isCompound
      isPowerlifting
    } = req.query;

    const filter = {};

    // Lógica para filtrar por muscleGroups (array en el modelo)
    if (muscleGroupToSearch) {
      // Esto encontrará ejercicios donde el array 'muscleGroups' contenga el valor de 'muscleGroupToSearch'
      filter.muscleGroups = muscleGroupToSearch;
    }
    // Si quisieras permitir buscar por múltiples grupos en el query (ej. ?muscleGroups=pecho,espalda)
    // podrías hacer algo como:
    // if (req.query.muscleGroupsList) {
    //   filter.muscleGroups = { $in: req.query.muscleGroupsList.split(',') };
    // }

    if (movementType) {
      filter.movementType = movementType;
    }

    // Usar exerciseType para filtrar en lugar de isCompound
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

// Get exercise by ID
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

// Create new exercise (admin only)
exports.createExercise = async (req, res) => {
  try {
    // req.body ya debería venir del frontend con: name, exerciseType, muscleGroups (array), movementType, etc.
    const exerciseData = {
      ...req.body,
      createdBy: req.user._id, // Asumiendo que tu middleware de auth (auth.middleware.js) añade req.user
    };

    // Validar que muscleGroups sea un array si es necesario (aunque Mongoose debería hacerlo)
    if (exerciseData.muscleGroups && !Array.isArray(exerciseData.muscleGroups)) {
        // Si desde el frontend, para el tipo 'specific', envías muscleGroups como string en vez de array de un elemento:
        // podrías convertirlo aquí o asegurar que el frontend siempre envíe array.
        // Por ahora, confiamos en que el frontend y Mongoose manejan el tipo array.
    }


    const exercise = new Exercise(exerciseData);
    await exercise.save(); // Aquí es donde Mongoose usará el esquema de exercise.model.js cargado

    // La validación pre('save') en tu modelo se encargará de la lógica de 'specific' vs 'compound'
    // para la cantidad de elementos en muscleGroups.

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

// Update exercise (admin only)
exports.updateExercise = async (req, res) => {
  try {
    // Los datos en req.body deben ser compatibles con el nuevo esquema
    // (ej. exerciseType, muscleGroups como array)
    const updateData = { ...req.body };
    // Asegúrate de no intentar pasar 'updatedAt' directamente si usas {timestamps: true}
    // delete updateData.updatedAt; // Mongoose lo maneja con timestamps

    const exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      updateData, // Mongoose intentará aplicar estos datos al esquema
      { new: true, runValidators: true } // runValidators es clave para que se apliquen las reglas del esquema
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

// Delete exercise (admin only)
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