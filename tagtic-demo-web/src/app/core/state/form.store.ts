import { Injectable, inject, signal, computed } from '@angular/core';
import { AnnotationForm, FormField } from '../models';
import { FormApiService } from '../api/form-api.service';
import { NotificationService } from '../../shared/notification/notification.service';

@Injectable({ providedIn: 'root' })
export class FormStore {
  private readonly api = inject(FormApiService);
  private readonly notify = inject(NotificationService);

  readonly form = signal<AnnotationForm | null>(null);
  readonly fields = signal<FormField[]>([]);
  readonly loading = signal(false);

  readonly hasForm = computed(() => this.form() !== null);
  readonly fieldCount = computed(() => this.fields().length);
  readonly canPublish = computed(() => this.hasForm() && this.fieldCount() > 0);

  loadForm(projectId: string) {
    this.loading.set(true);
    this.api.getForm(projectId).subscribe({
      next: (f) => {
        this.form.set(f);
        this.loading.set(false);
        this.loadFields(projectId);
      },
      error: () => {
        this.form.set(null);
        this.loading.set(false);
      },
    });
  }

  loadFields(projectId: string) {
    this.api.listFields(projectId).subscribe({
      next: (f) => this.fields.set(f),
    });
  }

  createForm(projectId: string, req: Parameters<FormApiService['createForm']>[1], onSuccess?: () => void) {
    this.api.createForm(projectId, req).subscribe({
      next: (f) => {
        this.form.set(f);
        this.notify.success('Formulaire créé');
        onSuccess?.();
      },
    });
  }

  addFields(projectId: string, newFields: Omit<FormField, 'id' | 'formId'>[], onSuccess?: () => void) {
    this.api.addFields(projectId, newFields).subscribe({
      next: (saved) => {
        this.fields.update((list) => [...list, ...saved]);
        this.notify.success('Champs ajoutés');
        onSuccess?.();
      },
    });
  }

  reset() {
    this.form.set(null);
    this.fields.set([]);
  }
}
