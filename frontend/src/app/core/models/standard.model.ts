import type { Exercise } from "./exercise.model"

export interface StrengthLevel {
  beginner: number
  novice: number
  intermediate: number
  advanced: number
  elite: number
}

export interface WeightCategory {
  minWeight: number
  maxWeight: number
  strengthLevels: StrengthLevel
}

export interface Standard {
  _id: string
  exercise: Exercise
  gender: string
  weightCategories: WeightCategory[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}
