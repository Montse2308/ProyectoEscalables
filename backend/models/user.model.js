const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    age: {
      type: Number,
      min: 13,
      max: 100,
    },
    weight: {
      type: Number,
      min: 30,
      max: 300,
    },
    height: {
      type: Number,
      min: 100,
      max: 250,
    },
    bodyMeasurements: {
      chest: Number,
      waist: Number,
      hips: Number,
      arms: Number,
      legs: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model("User", userSchema)

module.exports = User
