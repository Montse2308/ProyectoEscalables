export interface Exercise {
  _id: string;
  name: string;
  muscleGroup: string;
  movementType: string;
  description?: string;
  isCompound: boolean;
  isPowerlifting: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
