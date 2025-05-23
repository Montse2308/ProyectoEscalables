const User = require("../models/user.model")

// Get user by ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id
    const updateData = req.body

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password
    delete updateData.email
    delete updateData.role

    const user = await User.findByIdAndUpdate(
      userId,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true },
    ).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({ message: "User deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const users = await User.find().select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit)

    const total = await User.countDocuments()

    res.status(200).json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
