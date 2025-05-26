import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Import Router
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  isLoggedIn: boolean = false;

  stats = [
    { number: '200+', label: 'Entrenamientos Registrados' },
    { number: '50K+', label: 'Kg Levantados' },
    { number: '1000+', label: 'Usuarios Activos' },
  ];

  features = [
    {
      icon: 'track_changes',
      title: 'Seguimiento Detallado',
      description:
        'Registra tus series, repeticiones y pesos con facilidad. Visualiza tu progreso con gráficos intuitivos.',
      link: '/workouts/new',
    },
    {
      icon: 'calculate',
      title: 'Calculadoras Avanzadas',
      description:
        'Calcula tu 1RM, volumen total, intensidad y más para optimizar tu entrenamiento.',
      link: '/calculators',
    },
    {
      icon: 'analytics',
      title: 'Análisis de Rendimiento',
      description:
        'Tu panel central para revisas tus estadísticas, entrenamientos recientes y analiza tu rendimiento.',
      link: '/dashboard',
    },
    {
      icon: 'fitness_center',
      title: 'Estandares de Fuerza',
      description:
        'Accede a una extensa base de datos de estándares de fuerza para comparar tu rendimiento.',
      link: '/standards',
    },
  ];

  testimonials = [
    {
      quote:
        'FuerzApp ha transformado completamente cómo abordo mi entrenamiento. El seguimiento detallado me permite ver mi progreso real.',
      name: 'Ana García',
      role: 'Atleta de Powerlifting',
      image: 'images/testimonial-1.jpg',
    },
    {
      quote:
        'Las calculadoras son una maravilla. Me ayudan a estructurar mis sesiones y a no estancarme en mis levantamientos.',
      name: 'Carlos Rivera',
      role: 'Entrenador Personal',
      image: 'images/testimonial-2.jpg',
    },
    {
      quote:
        'Simple, efectiva y potente. Es la única aplicación que necesito para mis entrenamientos de fuerza.',
      name: 'Andrés López',
      role: 'Entusiasta del Fitness',
      image: 'images/testimonial-3.jpg',
    },
  ];
  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToFeature(link: string): void {
    this.router.navigate([link]);
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
