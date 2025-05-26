import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Dashboard } from '../models/dashboard.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboardData() {
    return this.http.get<Dashboard>(this.apiUrl);
  }
}