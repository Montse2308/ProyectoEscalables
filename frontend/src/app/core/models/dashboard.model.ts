import { User } from './user.model';
import { Workout } from './workout.model';

export interface StrongestLift {
  exercise: string;
  weight: number;
}

export interface Dashboard {
  user?: User; 
  totalWorkouts: number;
  weeklyWorkouts: number;
  strongestLift: StrongestLift;
  recentWorkouts: Workout[];
}