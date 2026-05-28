import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { JsonPipe, SlicePipe } from '@angular/common';
import { AnnotationStore } from '../../core/state/annotation.store';
import { ProjectStore } from '../../core/state/project.store';
import { UserStore } from '../../core/state/user.store';
import { ImageApiService } from '../../core/api/image-api.service';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';
import { StatusBadgeComponent } from '../../shared/badge/status-badge.component';
import { ProjectImage } from '../../core/models';

function s3Url(bucket: string, key: string): string {
  const match = bucket.match(/(eu|us|ap|sa|ca|af|me)-(north|south|east|west|central)-\d/);
  const region = match ? match[0] : 'eu-west-3';
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

@Component({
  selector: 'app-annotate-batch',
  standalone: true,
  imports: [RouterLink, SlicePipe, JsonPipe, DynamicFormComponent, StatusBadgeComponent],
  template: `
    <!-- Top bar -->
    <div class="bg-white border-b border-[#E0E0E0] -mx-6 md:-mx-8 px-6 md:px-8 py-3 mb-6 flex items-center gap-4">
      <a [routerLink]="['/projects', projectId, 'images']" class="flex items-center gap-1.5 text-xs text-[#525252] hover:text-primary">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Images
      </a>
      <span class="text-[#C6C6C6]">|</span>
      <span class="text-sm font-medium text-[#161616] truncate">
        {{ projectStore.selectedProject()?.title ?? 'Annotation' }}
      </span>

      <div class="ml-auto flex items-center gap-4">
        <!-- Progress bar -->
        <div class="hidden md:flex items-center gap-2">
          <div class="w-32 h-1.5 bg-[#E0E0E0] overflow-hidden">
            <div
              class="h-full bg-primary transition-all duration-300"
              [style.width.%]="progress()"
            ></div>
          </div>
          <span class="text-xs text-[#525252] tabular-nums">
            {{ annotatedIds().size }}/{{ images().length }} annotée(s)
          </span>
        </div>

        <!-- Image counter -->
        <span class="text-xs font-medium text-[#161616] tabular-nums">
          {{ currentIndex() + 1 }} / {{ images().length }}
        </span>
      </div>
    </div>

    @if (loading()) {
      <div class="flex items-center justify-center py-32">
        <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    } @else if (images().length === 0) {
      <div class="text-center py-24 text-sm text-[#8D8D8D]">
        Aucune image dans ce projet.
        <a [routerLink]="['/projects', projectId, 'images', 'new']" class="text-primary hover:underline ml-1">Ajouter une image →</a>
      </div>
    } @else {
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- ── Panneau gauche : image ── -->
        <div class="bg-white border border-[#E0E0E0] dark:border-[#525252]">
          <div class="px-5 py-3.5 border-b border-[#E0E0E0] flex items-center justify-between">
            <p class="text-xs font-medium text-[#525252] uppercase tracking-[0.1em]">Aperçu de l'image</p>
            @if (annotationStore.currentAnnotation()) {
              <app-status-badge [status]="annotationStore.currentAnnotation()!.status" />
            } @else {
              <span class="text-[10px] font-medium px-2 py-0.5 bg-[#E8E8E8] text-[#525252]">Non annotée</span>
            }
          </div>

          @if (currentImage()) {
            <div class="bg-[#F4F4F4] flex items-center justify-center min-h-52">
              @if (imgError()) {
                <div class="flex flex-col items-center gap-2 py-10 text-[#8D8D8D]">
                  <div class="w-10 h-10 bg-[#E8E8E8] flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <span class="text-xs">Image non accessible</span>
                </div>
              } @else {
                <img
                  [src]="imageUrl()!"
                  [alt]="currentImage()!.s3Key"
                  class="max-w-full max-h-[380px] object-contain"
                  (error)="imgError.set(true)"
                />
              }
            </div>

            <div class="px-5 py-4 space-y-2">
              <div class="flex gap-3 text-xs">
                <span class="text-[#8D8D8D] shrink-0 w-12 uppercase tracking-wide text-[10px]">Clé S3</span>
                <span class="font-mono text-[#525252] break-all">{{ currentImage()!.s3Key }}</span>
              </div>
              <div class="flex gap-3 text-xs">
                <span class="text-[#8D8D8D] shrink-0 w-12 uppercase tracking-wide text-[10px]">Date</span>
                <span class="text-[#525252] tabular-nums">{{ currentImage()!.createdAt | slice:0:10 }}</span>
              </div>
              @if (currentImage()!.metadata && objectKeys(currentImage()!.metadata).length > 0) {
                <details class="pt-1">
                  <summary class="text-[10px] uppercase tracking-wide text-[#8D8D8D] hover:text-primary cursor-pointer select-none">
                    Métadonnées JSON
                  </summary>
                  <pre class="mt-2 bg-[#F4F4F4] border border-[#E0E0E0] p-3 overflow-x-auto text-xs font-mono text-[#525252]">{{ currentImage()!.metadata | json }}</pre>
                </details>
              }
            </div>

            @if (annotationStore.currentAnnotation()) {
              <div class="px-5 py-3 border-t border-[#E0E0E0] bg-[#F4F4F4] flex items-center justify-between">
                <span class="text-xs font-medium text-[#161616]">Déjà annotée</span>
                <span class="text-xs text-[#525252] tabular-nums">
                  {{ annotationStore.currentAnnotation()!.annotatedBy }}
                  · {{ annotationStore.currentAnnotation()!.annotatedAt | slice:0:10 }}
                </span>
              </div>
            }
          }
        </div>

        <!-- ── Panneau droit : formulaire ── -->
        <div class="bg-white border border-[#E0E0E0] flex flex-col">
          <div class="px-5 py-3.5 border-b border-[#E0E0E0]">
            <p class="text-xs font-medium text-[#525252] uppercase tracking-[0.1em]">Formulaire d'annotation</p>
          </div>

          <div class="px-5 py-5 flex-1">
            @if (annotationStore.loading()) {
              <div class="flex items-center justify-center py-12">
                <div class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            } @else if (annotationStore.currentAnnotation()) {
              <div class="mb-4 flex items-start gap-3 p-3 bg-[#FCF4D6] border-l-4 border-l-[#B28600] text-xs text-[#B28600]">
                <svg class="w-3.5 h-3.5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                Annotation existante pré-remplie. Modifiez et soumettez pour mettre à jour.
              </div>
              @if (mergedFields()) {
                <app-dynamic-form
                  [fields]="mergedFields()!.fields"
                  [saving]="annotationStore.saving()"
                  [submitLabel]="isLast() ? 'Enregistrer' : 'Enregistrer et continuer →'"
                  (submitted)="onSubmit($event)"
                />
              }
            } @else if (mergedFields()) {
              <app-dynamic-form
                [fields]="mergedFields()!.fields"
                [saving]="annotationStore.saving()"
                [submitLabel]="isLast() ? 'Enregistrer' : 'Enregistrer et continuer →'"
                (submitted)="onSubmit($event)"
              />
            } @else {
              <div class="text-center py-10">
                <p class="text-sm text-[#8D8D8D]">Formulaire non disponible.<br>
                  <span class="text-xs">Vérifiez que le projet est en statut READY.</span>
                </p>
              </div>
            }
          </div>

          <!-- Navigation bottom bar -->
          <div class="px-5 py-3.5 border-t border-[#E0E0E0] bg-[#F4F4F4] flex items-center justify-between gap-2">
            <button
              (click)="prev()"
              [disabled]="isFirst()"
              class="btn-secondary text-sm disabled:opacity-40"
              style="padding: 0.4rem 1rem;"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Précédente
            </button>

            <span class="text-xs text-[#8D8D8D] tabular-nums hidden sm:block">
              {{ currentIndex() + 1 }} / {{ images().length }}
            </span>

            <button
              (click)="skip()"
              [disabled]="isLast()"
              class="btn-secondary text-sm disabled:opacity-40"
              style="padding: 0.4rem 1rem;"
            >
              Passer
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

      </div>

      @if (isLast() && annotatedIds().size === images().length) {
        <div class="mt-4 flex items-center gap-3 p-4 bg-[#DEFBE6] border-l-4 border-l-[#198038] text-sm text-[#198038]">
          <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          Toutes les images ont été annotées !
          <a [routerLink]="['/projects', projectId, 'annotations']" class="ml-auto font-medium underline">
            Voir les annotations →
          </a>
        </div>
      }
    }
  `,
})
export class AnnotateBatchComponent implements OnInit {
  readonly annotationStore = inject(AnnotationStore);
  readonly projectStore = inject(ProjectStore);
  private readonly userStore = inject(UserStore);
  private readonly imageApi = inject(ImageApiService);
  private readonly route = inject(ActivatedRoute);

  projectId!: string;

  readonly images = signal<ProjectImage[]>([]);
  readonly currentIndex = signal(0);
  readonly imgError = signal(false);
  readonly loading = signal(true);
  readonly annotatedIds = signal<Set<string>>(new Set());

  readonly objectKeys = Object.keys;

  readonly currentImage = computed(() => this.images()[this.currentIndex()] ?? null);

  readonly imageUrl = computed(() => {
    const img = this.currentImage();
    return img ? s3Url(img.s3Bucket, img.s3Key) : null;
  });

  readonly isFirst = computed(() => this.currentIndex() === 0);
  readonly isLast = computed(() => this.currentIndex() >= this.images().length - 1);

  readonly mergedFields = computed(() => {
    const prefilled = this.annotationStore.prefilledForm();
    if (!prefilled) return null;
    const annotation = this.annotationStore.currentAnnotation();
    if (!annotation?.fields?.length) return prefilled;
    const valueMap = new Map(annotation.fields.map((f) => [f.formFieldId, f.value]));
    return {
      ...prefilled,
      fields: prefilled.fields.map((field) => ({
        ...field,
        value: valueMap.has(field.formFieldId) ? valueMap.get(field.formFieldId)! : field.value,
      })),
    };
  });

  readonly progress = computed(() => {
    const total = this.images().length;
    return total === 0 ? 0 : Math.round((this.annotatedIds().size / total) * 100);
  });

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('projectId')!;
    const startId = this.route.snapshot.queryParamMap.get('imageId');

    if (!this.projectStore.selectedProject()) {
      this.projectStore.loadOne(this.projectId);
    }

    this.imageApi.list(this.projectId, 0, 200).subscribe((page) => {
      this.images.set(page.content);
      this.loading.set(false);

      if (startId) {
        const idx = page.content.findIndex((img) => img.id === startId);
        if (idx >= 0) this.currentIndex.set(idx);
      }

      this.loadCurrentImageData();
    });
  }

  private loadCurrentImageData() {
    const img = this.currentImage();
    if (!img) return;
    this.imgError.set(false);
    this.annotationStore.reset();
    this.annotationStore.loadPrefilledForm(this.projectId, img.id);
    this.annotationStore.loadByImage(this.projectId, img.id);
  }

  prev() {
    if (this.isFirst()) return;
    this.currentIndex.update((v) => v - 1);
    this.loadCurrentImageData();
  }

  next() {
    if (this.isLast()) return;
    this.currentIndex.update((v) => v + 1);
    this.loadCurrentImageData();
  }

  skip() {
    this.next();
  }

  onSubmit(values: Record<string, string>) {
    const img = this.currentImage();
    if (!img) return;
    this.annotationStore.save(
      this.projectId,
      img.id,
      {
        annotatedBy: this.userStore.currentUser(),
        fields: Object.entries(values).map(([formFieldId, value]) => ({ formFieldId, value })),
      },
      () => {
        this.annotatedIds.update((set) => new Set([...set, img.id]));
        if (!this.isLast()) this.next();
      },
    );
  }
}
