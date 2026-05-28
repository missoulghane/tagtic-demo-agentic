import { Injectable, inject, signal } from '@angular/core';
import { Annotation, PrefilledAnnotationForm, SaveAnnotationRequest } from '../models';
import { AnnotationApiService } from '../api/annotation-api.service';
import { NotificationService } from '../../shared/notification/notification.service';

@Injectable({ providedIn: 'root' })
export class AnnotationStore {
  private readonly api = inject(AnnotationApiService);
  private readonly notify = inject(NotificationService);

  readonly annotations = signal<Annotation[]>([]);
  readonly prefilledForm = signal<PrefilledAnnotationForm | null>(null);
  readonly currentAnnotation = signal<Annotation | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);

  loadPrefilledForm(projectId: string, imageId: string) {
    this.loading.set(true);
    this.api.getPrefilledForm(projectId, imageId).subscribe({
      next: (f) => {
        this.prefilledForm.set(f);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadByImage(projectId: string, imageId: string) {
    this.api.getByImage(projectId, imageId).subscribe({
      next: (a) => this.currentAnnotation.set(a),
      error: () => this.currentAnnotation.set(null),
    });
  }

  loadByProject(projectId: string) {
    this.loading.set(true);
    this.api.listByProject(projectId).subscribe({
      next: (list) => {
        this.annotations.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  save(
    projectId: string,
    imageId: string,
    req: SaveAnnotationRequest,
    onSuccess?: (a: Annotation) => void,
  ) {
    this.saving.set(true);
    this.api.save(projectId, imageId, req).subscribe({
      next: (a) => {
        this.currentAnnotation.set(a);
        this.saving.set(false);
        this.notify.success('Annotation sauvegardée');
        onSuccess?.(a);
      },
      error: () => this.saving.set(false),
    });
  }

  reset() {
    this.prefilledForm.set(null);
    this.currentAnnotation.set(null);
    this.annotations.set([]);
  }
}
