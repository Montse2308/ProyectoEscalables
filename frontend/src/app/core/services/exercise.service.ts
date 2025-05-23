import { Injectable } from "@angular/core"
import type { HttpClient } from "@angular/common/http"
import type { Observable } from "rxjs"
import { environment } from "../../../environments/environment"
import type { Exercise } from "../models/exercise.model"

@Injectable({
  providedIn: "root",
})
export class ExerciseService {
  private apiUrl = `${environment.apiUrl}/exercises`

  constructor(private http: HttpClient) {}

  getExercises(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(this.apiUrl)
  }

  getExercise(id: string): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.apiUrl}/${id}`)
  }

  createExercise(exercise: any): Observable<Exercise> {
    return this.http.post<Exercise>(this.apiUrl, exercise)
  }

  updateExercise(id: string, exercise: any): Observable<Exercise> {
    return this.http.put<Exercise>(`${this.apiUrl}/${id}`, exercise)
  }

  deleteExercise(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`)
  }
}
