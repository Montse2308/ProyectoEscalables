import { Injectable } from "@angular/core"
import type { HttpClient } from "@angular/common/http"
import { BehaviorSubject, type Observable, of } from "rxjs"
import { tap, catchError } from "rxjs/operators"
import type { Router } from "@angular/router"
import { environment } from "../../../environments/environment"
import type { User } from "../models/user.model"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`
  private currentUserSubject: BehaviorSubject<User | null>
  public currentUser: Observable<User | null>

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    const storedUser = localStorage.getItem("currentUser")
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser ? JSON.parse(storedUser) : null)
    this.currentUser = this.currentUserSubject.asObservable()
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value
  }

  register(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user).pipe(
      tap((response) => {
        if (response && response.token) {
          localStorage.setItem("token", response.token)
          localStorage.setItem("currentUser", JSON.stringify(response.user))
          this.currentUserSubject.next(response.user)
        }
      }),
    )
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response) => {
        if (response && response.token) {
          localStorage.setItem("token", response.token)
          localStorage.setItem("currentUser", JSON.stringify(response.user))
          this.currentUserSubject.next(response.user)
        }
      }),
    )
  }

  logout(): void {
    localStorage.removeItem("token")
    localStorage.removeItem("currentUser")
    this.currentUserSubject.next(null)
    this.router.navigate(["/auth/login"])
  }

  getToken(): string | null {
    return localStorage.getItem("token")
  }

  isLoggedIn(): boolean {
    return !!this.getToken()
  }

  isAdmin(): boolean {
    const user = this.currentUserValue
    return user ? user.role === "admin" : false
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        localStorage.setItem("currentUser", JSON.stringify(user))
        this.currentUserSubject.next(user)
      }),
      catchError((error) => {
        this.logout()
        return of(error)
      }),
    )
  }
}
