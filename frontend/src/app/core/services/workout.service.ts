import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Workout } from '../models/workout.model';

export interface PaginatedWorkoutsResponse {
  workouts: Workout[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class WorkoutService {
  private apiUrl = `${environment.apiUrl}/workouts`;

  constructor(private http: HttpClient) {}

  getWorkouts(): Observable<Workout[]> {
    return this.http.get<Workout[]>(this.apiUrl);
  }

  getRecentWorkouts(limit = 6): Observable<Workout[]> {
    return this.http.get<Workout[]>(`${this.apiUrl}/recent?limit=${limit}`);
  }

  getWorkout(id: string): Observable<Workout> {
    return this.http.get<Workout>(`${this.apiUrl}/${id}`);
  }

  createWorkout(workout: any): Observable<Workout> {
    return this.http.post<Workout>(this.apiUrl, workout);
  }

  updateWorkout(id: string, workout: any): Observable<Workout> {
    return this.http.put<Workout>(`${this.apiUrl}/${id}`, workout);
  }

  deleteWorkout(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  startWorkoutFromTemplate(templateId: string): Observable<Workout> {
    return this.http.post<Workout>(
      `${this.apiUrl}/from-template/${templateId}`,
      {}
    );
  }

  getUserMetrics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/metrics`);
  }
}
