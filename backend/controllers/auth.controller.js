const jwt = require("jsonwebtoken")
const User = require("../models/user.model")

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, gender, age, weight, height } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      gender,
      age,
      weight,
      height,
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    })

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    })

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
