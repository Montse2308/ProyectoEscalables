import { Component, type OnInit } from '@angular/core';
import { TemplateService } from '../../../core/services/template.service';
import { Template } from '../../../core/models/template.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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
      error: (error) => {
        this.error = error.error.message || 'Failed to load templates';
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

    this.loading = true;
    this.templateService.deleteTemplate(this.templateToDelete._id).subscribe({
      next: () => {
        this.loading = false;
        this.confirmDelete = false;
        this.templateToDelete = null;
        this.loadTemplates();
      },
      error: (error) => {
        this.error = error.error.message || 'Failed to delete template';
        this.loading = false;
      },
    });
  }

  getExerciseCount(template: Template): number {
    return template.exercises.length;
  }
}
