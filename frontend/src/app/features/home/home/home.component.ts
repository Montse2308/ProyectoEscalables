import { Component, type OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;

  features = [
    {
      icon: 'calculate',
      title: 'Calculadoras Avanzadas',
      description:
        'Calcula tu 1RM, puntuación Wilks y nivel de fuerza con precisión científica.',
      link: '/calculators',
    },
    {
      icon: 'fitness_center',
      title: 'Seguimiento de Entrenamientos',
      description:
        'Registra tus entrenamientos y observa tu progreso a lo largo del tiempo.',
      link: '/workouts',
    },
    {
      icon: 'assignment',
      title: 'Plantillas Personalizadas',
      description:
        'Crea y comparte rutinas de entrenamiento adaptadas a tus objetivos.',
      link: '/templates',
    },
    {
      icon: 'trending_up',
      title: 'Análisis de Progreso',
      description:
        'Visualiza tu evolución con gráficos detallados y métricas avanzadas.',
      link: '/dashboard',
    },
    {
      icon: 'leaderboard',
      title: 'Estándares de Fuerza',
      description:
        'Compara tu rendimiento con estándares internacionales de powerlifting.',
      link: '/standards',
    },
    {
      icon: 'person',
      title: 'Perfil Personalizado',
      description:
        'Gestiona tu información personal y configuraciones de entrenamiento.',
      link: '/profile',
    },
  ];

  stats = [
    { number: '10,000+', label: 'Usuarios Activos' },
    { number: '500,000+', label: 'Entrenamientos Registrados' },
    { number: '50,000+', label: 'PRs Alcanzados' },
    { number: '1,000+', label: 'Plantillas Creadas' },
  ];

  testimonials = [
    {
      name: 'Carlos Mendoza',
      role: 'Powerlifter Competitivo',
      image: '/assets/images/testimonial-1.jpg',
      quote:
        'FuerzApp me ha ayudado a mejorar mis marcas personales de forma consistente. Las calculadoras son increíblemente precisas.',
    },
    {
      name: 'Ana García',
      role: 'Entrenadora Personal',
      image: '/assets/images/testimonial-2.jpg',
      quote:
        'Uso FuerzApp con todos mis clientes. La capacidad de crear plantillas personalizadas es fantástica.',
    },
    {
      name: 'Miguel Torres',
      role: 'Atleta Amateur',
      image: '/assets/images/testimonial-3.jpg',
      quote:
        'El seguimiento del progreso es muy motivador. Ver mis gráficos de evolución me impulsa a entrenar más duro.',
    },
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToFeature(link: string): void {
    if (this.isLoggedIn || link === '/calculators') {
      this.router.navigate([link]);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}
