import type { Exercise } from "./exercise.model"

export interface TemplateExercise {
  exercise: Exercise
  sets: number
  reps: number
  restTime: number
  notes?: string
}

export interface Template {
  _id: string
  name: string
  description?: string
  user: string
  exercises: TemplateExercise[]
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}
