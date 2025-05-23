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
        'Identifica tendencias, fortalezas y debilidades. Toma decisiones informadas para mejorar.',
      link: '/dashboard',
    },
    {
      icon: 'fitness_center',
      title: 'Base de Datos de Ejercicios',
      description:
        'Accede a una amplia biblioteca de ejercicios con instrucciones y consejos.',
      link: '/exercises',
    },
  ];

  testimonials = [
    {
      quote:
        'FuerzApp ha transformado completamente cómo abordo mi entrenamiento. El seguimiento detallado me permite ver mi progreso real.',
      name: 'Ana García',
      role: 'Atleta de Powerlifting',
      image: 'assets/images/testimonial-ana.jpg',
    },
    {
      quote:
        'Las calculadoras son una maravilla. Me ayudan a estructurar mis sesiones y a no estancarme en mis levantamientos.',
      name: 'Carlos Rivera',
      role: 'Entrenador Personal',
      image: 'assets/images/testimonial-carlos.jpg',
    },
    {
      quote:
        'Simple, efectiva y potente. Es la única aplicación que necesito para mis entrenamientos de fuerza.',
      name: 'Sofía López',
      role: 'Entusiasta del Fitness',
      image: 'assets/images/testimonial-sofia.jpg',
    },
  ];
  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToFeature(link: string): void {
    this.router.navigate([link]);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
