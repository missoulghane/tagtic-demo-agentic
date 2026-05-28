import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SlicePipe, JsonPipe } from '@angular/common';
import { AnnotationStore } from '../../core/state/annotation.store';
import { ImageStore } from '../../core/state/image.store';
import { UserStore } from '../../core/state/user.store';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';
import { StatusBadgeComponent } from '../../shared/badge/status-badge.component';

function s3Url(bucket: string, key: string): string {
  const match = bucket.match(/(eu|us|ap|sa|ca|af|me)-(north|south|east|west|central)-\d/);
  const region = match ? match[0] : 'eu-west-3';
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

@Component({
  selector: 'app-annotate',
  standalone: true,
  imports: [RouterLink, SlicePipe, JsonPipe, DynamicFormComponent, StatusBadgeComponent],
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
      <span class="text-sm font-semibold text-[#161616] dark:text-white">Annotation</span>
    </div>

    @if (annotationStore.loading()) {
      <div class="flex items-center justify-center py-24">
        <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    } @else {
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- ── Panneau gauche : image ── -->
        <div class="bg-white dark:bg-[#262626] border border-[#E0E0E0] dark:border-[#525252]">
          <div class="px-5 py-3.5 border-b border-[#E0E0E0] dark:border-[#525252] flex items-center justify-between">
            <p class="text-xs font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em]">Aperçu de l'image</p>
            @if (annotationStore.currentAnnotation()) {
              <app-status-badge [status]="annotationStore.currentAnnotation()!.status" />
            }
          </div>

          @if (image()) {
            <!-- Image -->
            <div class="bg-[#F4F4F4] dark:bg-[#393939] flex items-center justify-center min-h-52">
              @if (imgError()) {
                <div class="flex flex-col items-center gap-2 py-12 text-[#8D8D8D]">
                  <div class="w-10 h-10 bg-[#E8E8E8] dark:bg-[#525252] flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <span class="text-xs">Image non accessible</span>
                  <a [href]="imageUrl()!" target="_blank" class="text-xs text-primary hover:underline">Ouvrir le lien S3</a>
                </div>
              } @else {
                <img
                  [src]="imageUrl()!"
                  [alt]="image()!.s3Key"
                  class="max-w-full max-h-[420px] object-contain"
                  (error)="imgError.set(true)"
                />
              }
            </div>

            <!-- Metadata -->
            <div class="px-5 py-4 space-y-2.5">
              <div class="flex gap-3 text-xs">
                <span class="text-[#8D8D8D] shrink-0 w-12 uppercase tracking-wide text-[10px]">Bucket</span>
                <span class="font-mono text-[#525252] dark:text-[#C6C6C6] truncate">{{ image()!.s3Bucket }}</span>
              </div>
              <div class="flex gap-3 text-xs">
                <span class="text-[#8D8D8D] shrink-0 w-12 uppercase tracking-wide text-[10px]">Clé</span>
                <span class="font-mono text-[#525252] dark:text-[#C6C6C6] break-all">{{ image()!.s3Key }}</span>
              </div>
              <div class="flex gap-3 text-xs">
                <span class="text-[#8D8D8D] shrink-0 w-12 uppercase tracking-wide text-[10px]">Date</span>
                <span class="text-[#525252] dark:text-[#C6C6C6] tabular-nums">{{ image()!.createdAt | slice:0:10 }}</span>
              </div>
              @if (image()!.metadata && objectKeys(image()!.metadata).length > 0) {
                <details class="pt-1">
                  <summary class="text-[10px] uppercase tracking-wide text-[#8D8D8D] hover:text-primary cursor-pointer select-none">
                    Métadonnées JSON
                  </summary>
                  <pre class="mt-2 bg-[#F4F4F4] dark:bg-[#393939] border border-[#E0E0E0] dark:border-[#525252] p-3 overflow-x-auto text-xs leading-relaxed font-mono text-[#525252] dark:text-[#C6C6C6]">{{ image()!.metadata | json }}</pre>
                </details>
              }
            </div>

            <!-- Annotation existante -->
            @if (annotationStore.currentAnnotation()) {
              <div class="px-5 py-3.5 border-t border-[#E0E0E0] dark:border-[#525252] bg-[#F4F4F4] dark:bg-[#393939] flex items-center justify-between">
                <span class="text-xs font-medium text-[#161616] dark:text-white">Dernière annotation</span>
                <span class="text-xs text-[#525252] dark:text-[#8D8D8D]">
                  {{ annotationStore.currentAnnotation()!.annotatedBy }}
                  · <span class="tabular-nums">{{ annotationStore.currentAnnotation()!.annotatedAt | slice:0:10 }}</span>
                </span>
              </div>
            }
          } @else {
            <div class="px-5 py-14 text-center text-sm text-[#8D8D8D]">
              Informations image non disponibles
            </div>
          }
        </div>

        <!-- ── Panneau droit : formulaire ── -->
        <div class="bg-white dark:bg-[#262626] border border-[#E0E0E0] dark:border-[#525252]">
          <div class="px-5 py-3.5 border-b border-[#E0E0E0] dark:border-[#525252]">
            <p class="text-xs font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em]">Formulaire d'annotation</p>
          </div>

          <div class="px-5 py-5">
            @if (isReadOnly()) {
              <div class="mb-4 flex items-start gap-3 p-4 bg-[#FCF4D6] border-l-4 border-l-[#B28600] text-sm text-[#B28600]">
                <svg class="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <span>Annotation existante pré-remplie. Modifiez les valeurs et soumettez pour la mettre à jour.</span>
              </div>
            }

            @if (mergedFields()) {
              <app-dynamic-form
                [fields]="mergedFields()!.fields"
                [saving]="annotationStore.saving()"
                submitLabel="Sauvegarder l'annotation"
                (submitted)="onSubmit($event)"
              />
            } @else {
              <div class="text-center py-10">
                <p class="text-sm text-[#8D8D8D]">
                  Formulaire non disponible.<br>
                  <span class="text-xs">Vérifiez que le projet est en statut READY.</span>
                </p>
              </div>
            }
          </div>
        </div>

      </div>
    }
  `,
})
export class AnnotateComponent implements OnInit {
  readonly annotationStore = inject(AnnotationStore);
  private readonly imageStore = inject(ImageStore);
  private readonly userStore = inject(UserStore);
  private readonly route = inject(ActivatedRoute);

  projectId!: string;
  imageId!: string;

  readonly imgError = signal(false);
  readonly objectKeys = Object.keys;

  readonly image = computed(() =>
    this.imageStore.images().find((img) => img.id === this.imageId) ?? null,
  );

  readonly imageUrl = computed(() => {
    const img = this.image();
    return img ? s3Url(img.s3Bucket, img.s3Key) : null;
  });

  readonly isReadOnly = computed(() => this.annotationStore.currentAnnotation() !== null);

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

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('projectId')!;
    this.imageId = this.route.snapshot.paramMap.get('imageId')!;

    this.annotationStore.loadPrefilledForm(this.projectId, this.imageId);
    this.annotationStore.loadByImage(this.projectId, this.imageId);

    if (this.imageStore.images().length === 0) {
      this.imageStore.load(this.projectId);
    }
  }

  onSubmit(values: Record<string, string>) {
    this.annotationStore.save(this.projectId, this.imageId, {
      annotatedBy: this.userStore.currentUser(),
      fields: Object.entries(values).map(([formFieldId, value]) => ({
        formFieldId,
        value,
      })),
    });
  }
}
