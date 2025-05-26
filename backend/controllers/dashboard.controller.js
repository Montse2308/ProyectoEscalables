const Workout = require("../models/workout.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).select('name');
    const totalWorkouts = await Workout.countDocuments({ user: userId });
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyWorkouts = await Workout.countDocuments({
      user: userId,
      date: { $gte: oneWeekAgo }
    });
    
    // CORRECCIÓN PRINCIPAL: Usar new mongoose.Types.ObjectId()
    const strongestLift = await Workout.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } }, // <-- Aquí está el cambio
      { $unwind: '$exercises' },
      { $unwind: '$exercises.sets' },
      { $sort: { 'exercises.sets.weight': -1 } },
      { $limit: 1 },
      { $project: {
          exercise: '$exercises.exercise.name',
          weight: '$exercises.sets.weight'
        } 
      }
    ]);
    
    const recentWorkouts = await Workout.find({ user: userId })
      .sort({ date: -1 })
      .limit(3)
      .populate({
        path: 'exercises.exercise',
        select: 'name'
      });

    res.json({
      user: {
        name: user.name
      },
      totalWorkouts,
      weeklyWorkouts,
      strongestLift: strongestLift[0] || { exercise: 'Ninguno registrado', weight: 0 },
      recentWorkouts: recentWorkouts.map(workout => ({
        _id: workout._id,
        name: workout.name,
        date: workout.date,
        exercises: workout.exercises.map(ex => ({
          exercise: {
            name: ex.exercise?.name || 'Ejercicio no encontrado'
          },
          sets: ex.sets
        }))
      }))
    });

  } catch (error) {
    console.error('Error en dashboard:', error);
    res.status(500).json({ message: 'Error al obtener datos del panel' });
  }
};