const Template = require("../models/template.model")

// Get all templates for current user
exports.getTemplates = async (req, res) => {
  try {
    const templates = await Template.find({
      $or: [{ user: req.user._id }, { isPublic: true }],
    })
      .populate("exercises.exercise")
      .populate("user", "name")
      .sort({ createdAt: -1 })

    res.status(200).json(templates)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get template by ID
exports.getTemplate = async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      $or: [{ user: req.user._id }, { isPublic: true }],
    })
      .populate("exercises.exercise")
      .populate("user", "name")

    if (!template) {
      return res.status(404).json({ message: "Template not found" })
    }

    res.status(200).json(template)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create new template
exports.createTemplate = async (req, res) => {
  try {
    const templateData = {
      ...req.body,
      user: req.user._id,
    }

    const template = new Template(templateData)
    await template.save()

    const populatedTemplate = await Template.findById(template._id)
      .populate("exercises.exercise")
      .populate("user", "name")

    res.status(201).json(populatedTemplate)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update template
exports.updateTemplate = async (req, res) => {
  try {
    const template = await Template.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true },
    )
      .populate("exercises.exercise")
      .populate("user", "name")

    if (!template) {
      return res.status(404).json({ message: "Template not found" })
    }

    res.status(200).json(template)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete template
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!template) {
      return res.status(404).json({ message: "Template not found" })
    }

    res.status(200).json({ message: "Template deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
