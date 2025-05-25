// frontend/src/app/features/templates/template-list/template-list.component.ts
import { Component, type OnInit } from '@angular/core';
import { TemplateService } from '../../../core/services/template.service';
import { Template } from '../../../core/models/template.model'; // Asegúrate que este modelo no tenga isPublic
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common'; // Importar DatePipe

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DatePipe], // Añadir DatePipe a imports
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss'],
})
export class TemplateListComponent implements OnInit {
  templates: Template[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  filteredTemplates: Template[] = [];
  confirmDelete = false;
  templateToDelete: Template | null = null;

  constructor(
    private templateService: TemplateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading = true;
    this.templateService.getTemplates().subscribe({
      next: (data) => {
        this.templates = data;
        this.filterTemplates();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cargar las plantillas.';
        this.loading = false;
      },
    });
  }

  onSearchChange(): void {
    this.filterTemplates();
  }

  filterTemplates(): void {
    if (!this.searchTerm.trim()) {
      this.filteredTemplates = [...this.templates];
    } else {
      const search = this.searchTerm.toLowerCase().trim();
      this.filteredTemplates = this.templates.filter(
        (template) =>
          template.name.toLowerCase().includes(search) ||
          (template.description &&
            template.description.toLowerCase().includes(search))
      );
    }
  }

  createTemplate(): void {
    this.router.navigate(['/templates/new']);
  }

  editTemplate(id: string): void {
    this.router.navigate(['/templates/edit', id]);
  }

  viewTemplate(id: string): void {
    this.router.navigate(['/templates/view', id]);
  }

  confirmDeleteTemplate(template: Template): void {
    this.templateToDelete = template;
    this.confirmDelete = true;
  }

  cancelDelete(): void {
    this.templateToDelete = null;
    this.confirmDelete = false;
  }

  deleteTemplate(): void {
    if (!this.templateToDelete) return;

    this.loading = true; // Puedes usar un loading específico para el borrado si quieres
    this.templateService.deleteTemplate(this.templateToDelete._id).subscribe({
      next: () => {
        this.loading = false;
        this.confirmDelete = false;
        this.templateToDelete = null;
        this.loadTemplates(); // Recargar la lista
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al eliminar la plantilla.';
        this.loading = false;
      },
    });
  }

  getExerciseCount(template: Template): number {
    return template.exercises ? template.exercises.length : 0;
  }
}