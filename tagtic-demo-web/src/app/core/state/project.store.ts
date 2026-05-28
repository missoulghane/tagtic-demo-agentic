import { Injectable, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AnnotationProject, ProjectStatus } from '../models';
import { ProjectApiService } from '../api/project-api.service';
import { NotificationService } from '../../shared/notification/notification.service';

@Injectable({ providedIn: 'root' })
export class ProjectStore {
  private readonly api = inject(ProjectApiService);
  private readonly notify = inject(NotificationService);

  readonly projects = signal<AnnotationProject[]>([]);
  readonly selectedProject = signal<AnnotationProject | null>(null);
  readonly loading = signal(false);
  readonly loadingSelected = signal(false);

  loadAll() {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (list) => {
        this.projects.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadOne(id: string) {
    this.loadingSelected.set(true);
    this.api.get(id).subscribe({
      next: (p) => {
        this.selectedProject.set(p);
        this.loadingSelected.set(false);
      },
      error: () => this.loadingSelected.set(false),
    });
  }

  create(req: Parameters<ProjectApiService['create']>[0], onSuccess?: (p: AnnotationProject) => void) {
    this.api.create(req).subscribe({
      next: (p) => {
        this.projects.update((list) => [p, ...list]);
        this.notify.success('Projet créé avec succès');
        onSuccess?.(p);
      },
    });
  }

  update(id: string, req: Parameters<ProjectApiService['update']>[1], onSuccess?: () => void) {
    this.api.update(id, req).subscribe({
      next: (p) => {
        this._replace(p);
        if (this.selectedProject()?.id === id) this.selectedProject.set(p);
        this.notify.success('Projet mis à jour');
        onSuccess?.();
      },
    });
  }

  delete(id: string, onSuccess?: () => void) {
    this.api.delete(id).subscribe({
      next: () => {
        this.projects.update((list) => list.filter((p) => p.id !== id));
        if (this.selectedProject()?.id === id) this.selectedProject.set(null);
        this.notify.success('Projet supprimé');
        onSuccess?.();
      },
    });
  }

  changeStatus(id: string, status: ProjectStatus, onSuccess?: () => void) {
    this.api.changeStatus(id, status).subscribe({
      next: (p) => {
        this._replace(p);
        if (this.selectedProject()?.id === id) this.selectedProject.set(p);
        this.notify.success(`Statut mis à jour : ${status}`);
        onSuccess?.();
      },
    });
  }

  private _replace(p: AnnotationProject) {
    this.projects.update((list) => list.map((item) => (item.id === p.id ? p : item)));
  }
}
