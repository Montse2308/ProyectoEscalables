import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface CalculatorInfo {
  name: string;
  description: string;
  link: string;
  icon: string; // Opcional: un ícono para visualización
}

@Component({
  selector: 'app-calculators-hub',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './calculators-hub.component.html',
  styleUrls: ['./calculators-hub.component.scss'],
})
export class CalculatorsHubComponent {
  calculators: CalculatorInfo[] = [
    {
      name: 'Calculadora de 1RM',
      description: 'Estima tu Repetición Máxima (1RM) basado en el peso y las repeticiones realizadas.',
      link: '/calculators/one-rm',
      icon: 'fitness_center', // Ejemplo de ícono de Material Icons
    },
    {
      name: 'Calculadora de Wilks',
      description: 'Compara tu fuerza relativa con otros levantadores de diferentes pesos corporales.',
      link: '/calculators/wilks',
      icon: 'leaderboard',
    },
    {
      name: 'Calculadora de Fuerza por Ejercicio', // Anteriormente "Exercise Strength Calculator"
      description: 'Calcula tu nivel de fuerza (e.g., principiante, intermedio) para un ejercicio específico.',
      link: '/calculators/exercise-strength',
      icon: 'calculate',
    },
    {
      name: 'Calculadora de Powerlifting', // Anteriormente "Strength Level Calculator"
      description: 'Mide tu nivel en powerlifting con puntos IPF según tu peso, género y marcas.',
      link: '/calculators/strength-level',
      icon: 'emoji_events',
    },
  ];
}