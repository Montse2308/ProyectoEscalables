import type { Exercise } from "./exercise.model"

export interface Set {
  reps: number
  weight: number
  rpe?: number
  notes?: string
}

export interface ExercisePerformed {
  exercise: Exercise
  sets: Set[]
}

export interface Workout {
  _id: string
  user: string
  date: Date
  name: string
  exercises: ExercisePerformed[]
  duration?: number
  notes?: string
  fromTemplate?: string
  isCompleted?: boolean
  createdAt: Date
  updatedAt: Date
}
