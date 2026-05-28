import { Injectable, inject, signal, computed } from '@angular/core';
import { ProjectImage, Page } from '../models';
import { ImageApiService } from '../api/image-api.service';
import { NotificationService } from '../../shared/notification/notification.service';

@Injectable({ providedIn: 'root' })
export class ImageStore {
  private readonly api = inject(ImageApiService);
  private readonly notify = inject(NotificationService);

  readonly images = signal<ProjectImage[]>([]);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);
  readonly loading = signal(false);
  readonly annotatedImageIds = signal<Set<string>>(new Set());

  readonly isAnnotated = computed(() => (imageId: string) =>
    this.annotatedImageIds().has(imageId),
  );

  load(projectId: string, page = 0) {
    this.loading.set(true);
    this.currentPage.set(page);
    this.api.list(projectId, page, this.pageSize()).subscribe({
      next: (p: Page<ProjectImage>) => {
        this.images.set(p.content);
        this.totalElements.set(p.totalElements);
        this.totalPages.set(p.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  readonly uploading = signal(false);

  upload(projectId: string, file: File, onSuccess?: (img: ProjectImage) => void) {
    this.uploading.set(true);
    this.api.upload(projectId, file).subscribe({
      next: (img) => {
        this.images.update((list) => [img, ...list]);
        this.totalElements.update((n) => n + 1);
        this.uploading.set(false);
        this.notify.success('Image uploadée avec succès');
        onSuccess?.(img);
      },
      error: () => this.uploading.set(false),
    });
  }

  markAnnotated(imageId: string) {
    this.annotatedImageIds.update((set) => new Set([...set, imageId]));
  }

  reset() {
    this.images.set([]);
    this.totalElements.set(0);
    this.totalPages.set(0);
    this.currentPage.set(0);
    this.annotatedImageIds.set(new Set());
  }
}
