import type { Exercise } from "./exercise.model";
// import type { Template } from "./template.model"; // Template no es usado directamente aquí

export interface Set {
  reps: number;
  weight: number;
  // rpe?: number; // ELIMINADO
  restTime?: number; // AÑADIDO: Descanso después de esta serie (en segundos)
  notes?: string;
}

export interface ExercisePerformed {
  exercise: Exercise;
  sets: Set[];
}

export interface Workout {
  _id: string;
  user: string; 
  date: Date;
  name: string;
  exercises: ExercisePerformed[];
  duration?: number; // Se calculará y guardará
  notes?: string;
  fromTemplate?: string | { _id: string; name: string; };
  isCompleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}