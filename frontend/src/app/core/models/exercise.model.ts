// frontend/src/app/models/exercise.model.ts
export interface Exercise {
  _id: string;
  name: string;
  // muscleGroup: string; // Se reemplaza por muscleGroups
  muscleGroups: string[]; // Array para múltiples grupos
  exerciseType: 'compound' | 'specific'; // Nuevo campo para tipo de ejercicio
  movementType: string;
  description?: string;
  // isCompound: boolean; // Se elimina
  isPowerlifting: boolean;
  createdBy: string; // Asumiendo que es un ID de usuario
  createdAt: Date;
  updatedAt: Date;
}