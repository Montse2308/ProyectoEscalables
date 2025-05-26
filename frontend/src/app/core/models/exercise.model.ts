export interface Exercise {
  _id: string;
  name: string;
  muscleGroups: string[]; 
  exerciseType: 'compound' | 'specific'; 
  movementType: string;
  description?: string;
  isPowerlifting: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}