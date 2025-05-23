import { Injectable } from "@angular/core"
import type { HttpClient } from "@angular/common/http"
import type { Observable } from "rxjs"
import { environment } from "../../../environments/environment"
import type { User } from "../models/user.model"

@Injectable({
  providedIn: "root",
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`

  constructor(private http: HttpClient) {}

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`)
  }

  updateProfile(userData: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, userData)
  }
}
