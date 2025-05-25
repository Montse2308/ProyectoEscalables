// frontend/src/app/core/models/standard.model.ts
import type { Exercise } from "./exercise.model";

// Esta interfaz define los factores para cada nivel de fuerza
export interface StrengthLevelRatios {
  principiante: number; // Ej. 0.5
  novato: number;       // Ej. 0.75
  intermedio: number;   // Ej. 1.25
  avanzado: number;     // Ej. 1.75
  elite: number;        // Ej. 2.00
}

// La interfaz Standard ahora contendrá directamente los ratios por género.
// Ya no necesitamos WeightCategory para definir los estándares base.
// WeightCategory podría seguir siendo útil para la *visualización* si se agrupan los usuarios,
// pero no para definir el estándar en sí. Por ahora, lo simplificaremos.
export interface Standard {
  _id: string;
  exercise: Exercise;         // Referencia al ejercicio
  gender: 'male' | 'female';  // Género para el que aplican estos ratios
  ratios: StrengthLevelRatios; // Los factores de relación de peso corporal
  createdBy?: string; // ID del admin que lo creó
  createdAt?: Date;
  updatedAt?: Date;
}

// Las interfaces StrengthLevel y WeightCategory originales ya no son necesarias
// para definir la estructura del estándar en la base de datos con este nuevo enfoque.
// Podrían reutilizarse o adaptarse en StandardsViewComponent si se quiere mostrar
// una tabla con ejemplos de pesos para diferentes categorías de peso corporal,
// pero el estándar en sí solo guarda los ratios.