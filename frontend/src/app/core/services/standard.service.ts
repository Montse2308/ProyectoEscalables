import { Injectable } from "@angular/core"
import type { HttpClient } from "@angular/common/http"
import type { Observable } from "rxjs"
import { environment } from "../../../environments/environment"
import type { Standard } from "../models/standard.model"

@Injectable({
  providedIn: "root",
})
export class StandardService {
  private apiUrl = `${environment.apiUrl}/standards`

  constructor(private http: HttpClient) {}

  getStandards(): Observable<Standard[]> {
    return this.http.get<Standard[]>(this.apiUrl)
  }

  getStandard(id: string): Observable<Standard> {
    return this.http.get<Standard>(`${this.apiUrl}/${id}`)
  }

  createStandard(standard: any): Observable<Standard> {
    return this.http.post<Standard>(this.apiUrl, standard)
  }

  updateStandard(id: string, standard: any): Observable<Standard> {
    return this.http.put<Standard>(`${this.apiUrl}/${id}`, standard)
  }

  deleteStandard(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`)
  }
}
