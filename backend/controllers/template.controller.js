const Template = require("../models/template.model");

exports.getTemplates = async (req, res) => {
  try {
    const templates = await Template.find({ user: req.user._id })
      .populate("exercises.exercise", "name muscleGroups exerciseType movementType isPowerlifting") 
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(templates);
  } catch (error) {
    console.error("Error en getTemplates:", error);
    res.status(500).json({ message: "Error del servidor al obtener plantillas", error: error.message });
  }
};

exports.getTemplate = async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("exercises.exercise", "name muscleGroups exerciseType movementType isPowerlifting")
      .populate("user", "name");

    if (!template) {
      return res.status(404).json({ message: "Plantilla no encontrada o no tienes acceso." });
    }

    res.status(200).json(template);
  } catch (error) {
    console.error("Error en getTemplate (ID):", error);
    res.status(500).json({ message: "Error del servidor al obtener la plantilla", error: error.message });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const { name, description, exercises } = req.body;
    
    const templateData = {
      name,
      description,
      exercises,
      user: req.user._id,
    };

    const template = new Template(templateData);
    await template.save();

    const populatedTemplate = await Template.findById(template._id)
      .populate("exercises.exercise", "name muscleGroups exerciseType movementType isPowerlifting") 
      .populate("user", "name");

    res.status(201).json(populatedTemplate);
  } catch (error) {
    console.error("Error en createTemplate:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: "Error de validación al crear plantilla", errors: messages });
    }
    res.status(500).json({ message: "Error del servidor al crear la plantilla", error: error.message });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const { name, description, exercises } = req.body;
    const updateData = { name, description, exercises, updatedAt: Date.now() };

    const template = await Template.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    )
      .populate("exercises.exercise", "name muscleGroups exerciseType movementType isPowerlifting") // Añadido isPowerlifting
      .populate("user", "name");

    if (!template) {
      return res.status(404).json({ message: "Plantilla no encontrada o no tienes permiso para actualizarla." });
    }

    res.status(200).json(template);
  } catch (error) {
    console.error("Error en updateTemplate:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: "Error de validación al actualizar plantilla", errors: messages });
    }
    res.status(500).json({ message: "Error del servidor al actualizar la plantilla", error: error.message });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!template) {
      return res.status(404).json({ message: "Plantilla no encontrada o no tienes permiso para eliminarla." });
    }

    res.status(200).json({ message: "Plantilla eliminada correctamente." });
  } catch (error) {
    console.error("Error en deleteTemplate:", error);
    res.status(500).json({ message: "Error del servidor al eliminar la plantilla", error: error.message });
  }
};