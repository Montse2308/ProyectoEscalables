// frontend/src/app/core/models/template.model.ts
import type { Exercise } from "./exercise.model";

export interface TemplateExercise {
  exercise: Exercise; // Aquí Exercise debe ser la interfaz completa o una referencia con los campos necesarios
  sets: number;
  reps: number;
  restTime: number;
  notes?: string;
}

export interface Template {
  _id: string;
  name: string;
  description?: string;
  user: string | { _id: string; name: string }; // Puede ser ID o User populado
  exercises: TemplateExercise[];
  // isPublic: boolean; // ELIMINADO
  createdAt: Date;
  updatedAt: Date;
}