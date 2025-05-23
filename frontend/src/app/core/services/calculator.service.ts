import { Injectable } from "@angular/core"
import type { HttpClient } from "@angular/common/http"
import type { Observable } from "rxjs"
import { environment } from "../../../environments/environment"

@Injectable({
  providedIn: "root",
})
export class CalculatorService {
  private apiUrl = `${environment.apiUrl}/calculators`

  constructor(private http: HttpClient) {}

  calculate1RM(weight: number, reps: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/one-rm`, { weight, reps })
  }

  calculateWilks(bodyWeight: number, liftedWeight: number, gender: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/wilks`, { bodyWeight, liftedWeight, gender })
  }

  calculateStrengthLevel(exercise: string, oneRM: number, bodyWeight: number, gender: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/strength-level`, { exercise, oneRM, bodyWeight, gender })
  }
}
