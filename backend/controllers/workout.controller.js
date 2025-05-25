// backend/controllers/workout.controller.js
const Workout = require("../models/workout.model");
const Template = require("../models/template.model"); // Asegúrate que el path sea correcto
const Exercise = require("../models/exercise.model");

const POPULATE_EXERCISE_FIELDS_FOR_WORKOUT = "name muscleGroups exerciseType movementType isPowerlifting";

// Get all workouts for current user
exports.getWorkouts = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const workouts = await Workout.find({ user: req.user._id })
      .populate("exercises.exercise", POPULATE_EXERCISE_FIELDS_FOR_WORKOUT)
      .populate("fromTemplate", "name")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Workout.countDocuments({ user: req.user._id });
    res.status(200).json({
      workouts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error en getWorkouts:", error);
    res.status(500).json({ message: "Error del servidor al obtener entrenamientos", error: error.message });
  }
};

// Get recent workouts
exports.getRecentWorkouts = async (req, res) => {
  try {
    const limit = Number.parseInt(req.query.limit) || 6;
    const workouts = await Workout.find({ user: req.user._id })
      .populate("exercises.exercise", POPULATE_EXERCISE_FIELDS_FOR_WORKOUT)
      .sort({ date: -1 })
      .limit(limit);
    res.status(200).json(workouts);
  } catch (error) {
    console.error("Error en getRecentWorkouts:", error);
    res.status(500).json({ message: "Error del servidor al obtener entrenamientos recientes", error: error.message });
  }
};

// Get workout by ID
exports.getWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id })
      .populate("exercises.exercise", POPULATE_EXERCISE_FIELDS_FOR_WORKOUT)
      .populate("fromTemplate", "name");
    if (!workout) {
      return res.status(404).json({ message: "Entrenamiento no encontrado o no tienes acceso." });
    }
    res.status(200).json(workout);
  } catch (error) {
    console.error("Error en getWorkout (ID):", error);
    res.status(500).json({ message: "Error del servidor al obtener el entrenamiento", error: error.message });
  }
};

// Create new workout
exports.createWorkout = async (req, res) => {
  try {
    // 'duration' ahora vendrá calculado desde el frontend
    const { name, date, notes, exercises, isCompleted, fromTemplate, duration } = req.body;
    
    const workoutData = {
      name, date, notes, exercises, isCompleted, fromTemplate, duration, // Incluir duration
      user: req.user._id,
    };
    const workout = new Workout(workoutData);
    await workout.save();
    const populatedWorkout = await Workout.findById(workout._id)
      .populate("exercises.exercise", POPULATE_EXERCISE_FIELDS_FOR_WORKOUT)
      .populate("fromTemplate", "name");
    res.status(201).json(populatedWorkout);
  } catch (error) {
    console.error("Error en createWorkout:", error.message, error.stack);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: "Error de validación al crear entrenamiento", errors: messages });
    }
    res.status(500).json({ message: "Error del servidor al crear el entrenamiento", error: error.message });
  }
};

// Update workout
exports.updateWorkout = async (req, res) => {
  try {
    // 'duration' ahora vendrá calculado desde el frontend
    const { name, date, notes, exercises, isCompleted, duration } = req.body;
    const updateData = { 
        name, date, notes, exercises, isCompleted, duration, // Incluir duration
        updatedAt: Date.now() 
    };

    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    )
      .populate("exercises.exercise", POPULATE_EXERCISE_FIELDS_FOR_WORKOUT)
      .populate("fromTemplate", "name");

    if (!workout) {
      return res.status(404).json({ message: "Entrenamiento no encontrado o no tienes permiso para actualizar." });
    }
    res.status(200).json(workout);
  } catch (error) {
    console.error("Error en updateWorkout:", error);
     if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: "Error de validación al actualizar entrenamiento", errors: messages });
    }
    res.status(500).json({ message: "Error del servidor al actualizar el entrenamiento", error: error.message });
  }
};

// Delete workout - Sin cambios necesarios aquí
exports.deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!workout) {
      return res.status(404).json({ message: "Entrenamiento no encontrado o no tienes permiso para eliminar." });
    }
    res.status(200).json({ message: "Entrenamiento eliminado correctamente." });
  } catch (error) {
    console.error("Error en deleteWorkout:", error);
    res.status(500).json({ message: "Error del servidor al eliminar el entrenamiento", error: error.message });
  }
};

// Start workout from template
exports.startWorkoutFromTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.templateId).populate("exercises.exercise", POPULATE_EXERCISE_FIELDS_FOR_WORKOUT);

    if (!template) {
      return res.status(404).json({ message: "Plantilla no encontrada." });
    }

    // Mapear ejercicios de plantilla a formato de ExercisePerformed,
    // incluyendo el restTime de la plantilla en cada set del workout.
    // En startWorkoutFromTemplate, corregir el mapeo de series:
    const exercisesPerformed = template.exercises.map((templateExercise) => {
        const exerciseDetails = templateExercise.exercise;
        return {
            exercise: exerciseDetails._id,
            sets: Array.from({length: templateExercise.sets}).map(() => ({ // Usar Array.from para mejor compatibilidad
                reps: templateExercise.reps,
                weight: 0,
                restTime: templateExercise.restTime || 60,
                notes: templateExercise.notes || "",
            })),
        };
    });
    
    // Calcular duración aquí mismo ANTES de guardar
    let totalSeconds = 0;
    template.exercises.forEach(templateEx => {
        const exDetails = templateEx.exercise; // Ya populado
        const workTimePerSet = exDetails.isPowerlifting ? 90 : 60;
        totalSeconds += templateEx.sets * (workTimePerSet + (templateEx.restTime || 0));
    });
    const calculatedDuration = Math.round(totalSeconds / 60);


    const workoutData = {
      name: `${template.name} - ${new Date().toLocaleDateString('es-MX')}`,
      user: req.user._id,
      date: new Date(),
      fromTemplate: template._id,
      exercises: exercisesPerformed,
      isCompleted: false,
      duration: calculatedDuration, // Guardar duración calculada
    };

    const workout = new Workout(workoutData);
    await workout.save();

    const populatedWorkout = await Workout.findById(workout._id)
      .populate("exercises.exercise", POPULATE_EXERCISE_FIELDS_FOR_WORKOUT)
      .populate("fromTemplate", "name");

    res.status(201).json(populatedWorkout);
  } catch (error) {
    console.error("Error en startWorkoutFromTemplate:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: "Error de validación al iniciar entrenamiento desde plantilla", errors: messages });
    }
    res.status(500).json({ message: "Error del servidor al iniciar entrenamiento desde plantilla", error: error.message });
  }
};

// Get user metrics - Sin cambios necesarios aquí para el RPE o duración.
exports.getUserMetrics = async (req, res) => {
  try {
    const userId = req.user._id;
    const totalWorkouts = await Workout.countDocuments({ user: userId });
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(today.getFullYear(), today.getMonth(), diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const weeklyWorkouts = await Workout.countDocuments({
      user: userId,
      date: { $gte: weekStart },
    });

    const userWorkouts = await Workout.find({ user: userId }).populate("exercises.exercise", "name");
    let strongestLift = { exerciseName: "Ninguno", weight: 0 };

    userWorkouts.forEach((workout) => {
      workout.exercises.forEach((exercisePerformed) => {
        if (exercisePerformed.exercise && exercisePerformed.exercise.name) {
          exercisePerformed.sets.forEach((set) => {
            if (set.weight > strongestLift.weight) {
              strongestLift = {
                exerciseName: exercisePerformed.exercise.name,
                weight: set.weight,
              };
            }
          });
        }
      });
    });
    res.status(200).json({ totalWorkouts, weeklyWorkouts, strongestLift });
  } catch (error) {
    console.error("Error en getUserMetrics:", error);
    res.status(500).json({ message: "Error del servidor al obtener métricas", error: error.message });
  }
};