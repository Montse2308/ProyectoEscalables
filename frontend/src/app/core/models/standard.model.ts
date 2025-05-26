import type { Exercise } from "./exercise.model";

export interface StrengthLevelRatios {
  principiante: number; 
  novato: number;       
  intermedio: number;   
  avanzado: number;     
  elite: number;        
}

export interface Standard {
  _id: string;
  exercise: Exercise;       
  gender: 'male' | 'female';
  ratios: StrengthLevelRatios;
  createdBy?: string; 
  createdAt?: Date;
  updatedAt?: Date;
}
