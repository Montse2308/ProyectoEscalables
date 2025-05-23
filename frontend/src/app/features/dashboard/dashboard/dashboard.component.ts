import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  // Implement OnInit

  loading: boolean = true;
  error: string | null = null;
  user: { name: string } | null = null;
  totalWorkouts: number = 0;
  weeklyWorkouts: number = 0;
  strongestLift: { exercise: string; weight: number } = {
    exercise: '',
    weight: 0,
  };
  recentWorkouts: any[] = [];

  ngOnInit(): void {
    // Simulate data loading
    setTimeout(() => {
      this.loading = false;
      this.user = { name: 'John Doe' };
      this.totalWorkouts = 150;
      this.weeklyWorkouts = 3;
      this.strongestLift = { exercise: 'Deadlift', weight: 180 };
      this.recentWorkouts = [
        {
          _id: '1',
          name: 'Full Body Workout',
          date: new Date(),
          exercises: [
            { exercise: { name: 'Squats' }, sets: [{}, {}, {}] },
            { exercise: { name: 'Bench Press' }, sets: [{}, {}, {}] },
          ],
        },
        {
          _id: '2',
          name: 'Leg Day',
          date: new Date('2025-05-20'),
          exercises: [
            { exercise: { name: 'Leg Press' }, sets: [{}, {}, {}, {}] },
            { exercise: { name: 'Calf Raises' }, sets: [{}, {}] },
          ],
        },
      ];
    }, 1500);
  }
}
