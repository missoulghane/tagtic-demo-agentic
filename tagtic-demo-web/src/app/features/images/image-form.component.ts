import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ImageApiService } from '../../core/api/image-api.service';
import { ImageStore } from '../../core/state/image.store';
import { ProjectStore } from '../../core/state/project.store';
import { NotificationService } from '../../shared/notification/notification.service';
import { firstValueFrom } from 'rxjs';

interface FileEntry {
  id: number;
  file: File;
  preview: string | null;
  status: 'pending' | 'uploading' | 'done' | 'error';
}

let _nextId = 0;

@Component({
  selector: 'app-image-form',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- Top bar -->
    <div class="bg-white dark:bg-[#262626] border-b border-[#E0E0E0] dark:border-[#525252] -mx-6 md:-mx-8 px-6 md:px-8 py-3 mb-6 flex items-center gap-3">
      <a [routerLink]="['/projects', projectId, 'images']" class="flex items-center gap-1.5 text-xs text-[#525252] hover:text-primary">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Images
      </a>
      <span class="text-[#C6C6C6]">|</span>
      <span class="text-sm font-semibold text-[#161616] dark:text-white">Ajouter des images</span>
    </div>

    <div class="bg-white dark:bg-[#262626] border border-[#E0E0E0] dark:border-[#525252]">

      <!-- Header -->
      <div class="px-6 py-5 border-b border-[#E0E0E0] dark:border-[#525252]">
        <h1 class="text-base font-semibold text-[#161616] dark:text-white">Ajouter des images</h1>
        <p class="text-xs text-[#525252] dark:text-[#8D8D8D] mt-1">
          Sélectionnez un ou plusieurs fichiers image — le stockage S3 est géré automatiquement.
        </p>
      </div>

      <div class="px-6 py-5 space-y-4">

        <!-- Drop zone -->
        <div
          class="relative border border-dashed transition-colors"
          [class.border-primary]="isDragging()"
          [class.bg-[#EDF5FF]]="isDragging()"
          [class.border-[#8D8D8D]]="!isDragging()"
          (dragover)="onDragOver($event)"
          (dragleave)="isDragging.set(false)"
          (drop)="onDrop($event)"
        >
          <input
            type="file"
            accept="image/*"
            multiple
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            [disabled]="uploading()"
            (change)="onFileChange($event)"
          />
          <div class="flex flex-col items-center justify-center py-10 px-6 text-center pointer-events-none">
            <div class="w-10 h-10 bg-[#F4F4F4] dark:bg-[#393939] flex items-center justify-center mb-3">
              <svg class="w-5 h-5 text-[#8D8D8D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
            </div>
            <p class="text-sm font-medium text-[#161616] dark:text-white">
              {{ dropZoneLabel() }}
            </p>
            <p class="text-xs text-[#8D8D8D] mt-1">ou cliquez pour parcourir · sélection multiple autorisée</p>
            <p class="text-[10px] text-[#C6C6C6] mt-2 uppercase tracking-wide">PNG · JPG · JPEG · WEBP · GIF</p>
          </div>
        </div>

        <!-- File list -->
        @if (files().length > 0) {
          <div class="border border-[#E0E0E0] dark:border-[#525252]">

            <!-- List header -->
            <div class="bg-[#F4F4F4] dark:bg-[#393939] border-b border-[#E0E0E0] dark:border-[#525252] px-4 py-2.5 flex items-center justify-between">
              <p class="text-[10px] font-medium text-[#525252] uppercase tracking-[0.1em]">
                {{ files().length }} fichier(s) sélectionné(s)
              </p>
              @if (!uploading()) {
                <button
                  (click)="clearAll()"
                  class="text-xs text-[#525252] hover:text-[#DA1E28]"
                >Tout retirer</button>
              }
            </div>

            <!-- Rows -->
            @for (entry of files(); track entry.id) {
              <div class="flex items-center gap-3 px-4 py-3 border-b border-[#E0E0E0] dark:border-[#525252] last:border-b-0">

                <!-- Thumbnail -->
                <div class="w-10 h-10 shrink-0 bg-[#F4F4F4] dark:bg-[#393939] border border-[#E0E0E0] overflow-hidden flex items-center justify-center">
                  @if (entry.preview) {
                    <img [src]="entry.preview" class="w-full h-full object-cover" alt="" />
                  } @else {
                    <svg class="w-4 h-4 text-[#C6C6C6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  }
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-[#161616] dark:text-white truncate">{{ entry.file.name }}</p>
                  <p class="text-xs text-[#8D8D8D]">{{ formatSize(entry.file.size) }} · {{ entry.file.type || 'image' }}</p>
                </div>

                <!-- Status -->
                <div class="shrink-0 flex items-center gap-2">
                  @switch (entry.status) {
                    @case ('pending') {
                      <span class="text-[10px] px-2 py-0.5 bg-[#E8E8E8] text-[#525252]">En attente</span>
                    }
                    @case ('uploading') {
                      <span class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                      <span class="text-[10px] text-[#525252]">Upload…</span>
                    }
                    @case ('done') {
                      <span class="text-[10px] px-2 py-0.5 bg-[#DEFBE6] text-[#198038] flex items-center gap-1">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                        Uploadée
                      </span>
                    }
                    @case ('error') {
                      <span class="text-[10px] px-2 py-0.5 bg-[#FFF1F1] text-[#DA1E28] flex items-center gap-1">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                        </svg>
                        Erreur
                      </span>
                    }
                  }

                  @if (!uploading() && entry.status === 'pending') {
                    <button
                      (click)="removeFile(entry.id)"
                      class="w-6 h-6 flex items-center justify-center text-[#8D8D8D] hover:text-[#DA1E28] hover:bg-[#FFF1F1]"
                      title="Retirer"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  }
                </div>

              </div>
            }

            <!-- Progress bar (pendant l'upload) -->
            @if (uploading()) {
              <div class="px-4 py-3 border-t border-[#E0E0E0] bg-[#F4F4F4]">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs text-[#525252]">Upload en cours…</span>
                  <span class="text-xs text-[#525252] tabular-nums">{{ doneCount() }} / {{ pendingTotal() }}</span>
                </div>
                <div class="w-full h-1 bg-[#E0E0E0] overflow-hidden">
                  <div
                    class="h-full bg-primary transition-all duration-300"
                    [style.width.%]="uploadProgress()"
                  ></div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-2 border-t border-[#E0E0E0] dark:border-[#525252]">
          <a [routerLink]="['/projects', projectId, 'images']" class="btn-secondary" [class.pointer-events-none]="uploading()">
            Annuler
          </a>
          <button
            (click)="submitAll()"
            [disabled]="pendingFiles().length === 0 || uploading()"
            class="btn-primary"
          >
            @if (uploading()) {
              <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Upload en cours…
            } @else {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
              Uploader {{ uploadLabel() }}
            }
          </button>
        </div>

      </div>
    </div>
  `,
})
export class ImageFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly imageApi = inject(ImageApiService);
  readonly imageStore = inject(ImageStore);
  readonly projectStore = inject(ProjectStore);
  private readonly notify = inject(NotificationService);

  projectId!: string;

  readonly files = signal<FileEntry[]>([]);
  readonly isDragging = signal(false);
  readonly uploading = signal(false);

  readonly pendingFiles = computed(() => this.files().filter((f) => f.status === 'pending'));
  readonly doneCount = computed(() => this.files().filter((f) => f.status === 'done').length);
  readonly pendingTotal = computed(() => this.files().filter((f) => f.status !== 'pending').length + this.pendingFiles().length);

  readonly uploadProgress = computed(() => {
    const total = this.files().length;
    if (total === 0) return 0;
    const done = this.files().filter((f) => f.status === 'done' || f.status === 'error').length;
    return Math.round((done / total) * 100);
  });

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('projectId')!;
    if (!this.projectStore.selectedProject()) {
      this.projectStore.loadOne(this.projectId);
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) this.addFiles(input.files);
    input.value = '';
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    const dt = event.dataTransfer;
    if (dt?.files) {
      const images = Array.from(dt.files).filter((f) => f.type.startsWith('image/'));
      const list = new DataTransfer();
      images.forEach((f) => list.items.add(f));
      this.addFiles(list.files);
    }
  }

  private addFiles(fileList: FileList) {
    const entries: FileEntry[] = [];
    Array.from(fileList).forEach((file) => {
      const entry: FileEntry = { id: _nextId++, file, preview: null, status: 'pending' };
      entries.push(entry);
      const reader = new FileReader();
      reader.onload = (e) => {
        this.files.update((list) =>
          list.map((f) => (f.id === entry.id ? { ...f, preview: e.target?.result as string } : f)),
        );
      };
      reader.readAsDataURL(file);
    });
    this.files.update((list) => [...list, ...entries]);
  }

  removeFile(id: number) {
    this.files.update((list) => list.filter((f) => f.id !== id));
  }

  clearAll() {
    this.files.set([]);
  }

  async submitAll() {
    const toUpload = this.pendingFiles();
    if (toUpload.length === 0) return;

    this.uploading.set(true);

    for (const entry of toUpload) {
      this.setStatus(entry.id, 'uploading');
      try {
        const img = await firstValueFrom(this.imageApi.upload(this.projectId, entry.file));
        this.imageStore.images.update((list) => [img, ...list]);
        this.imageStore.totalElements.update((n) => n + 1);
        this.setStatus(entry.id, 'done');
      } catch {
        this.setStatus(entry.id, 'error');
      }
    }

    this.uploading.set(false);

    const errors = this.files().filter((f) => f.status === 'error').length;
    const done = this.files().filter((f) => f.status === 'done').length;

    if (errors === 0) {
      this.notify.success(`${done} image(s) uploadée(s) avec succès`);
      this.router.navigate(['/projects', this.projectId, 'images']);
    } else {
      this.notify.warning(`${done} uploadée(s), ${errors} en erreur`);
    }
  }

  private setStatus(id: number, status: FileEntry['status']) {
    this.files.update((list) =>
      list.map((f) => (f.id === id ? { ...f, status } : f)),
    );
  }

  dropZoneLabel(): string {
    return this.files().length > 0 ? "Ajouter d'autres fichiers" : 'Glissez des images ici';
  }

  uploadLabel(): string {
    const n = this.pendingFiles().length;
    return n > 1 ? `${n} images` : "l'image";
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }
}
