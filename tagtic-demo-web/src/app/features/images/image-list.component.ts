import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { ImageStore } from '../../core/state/image.store';
import { AnnotationStore } from '../../core/state/annotation.store';
import { ProjectStore } from '../../core/state/project.store';

@Component({
  selector: 'app-image-list',
  standalone: true,
  imports: [RouterLink, SlicePipe],
  template: `
    <!-- Toolbar -->
    <div class="flex items-center justify-between mb-4">
      <p class="text-xs text-[#525252] dark:text-[#8D8D8D]">
        {{ imageStore.totalElements() }} image(s) au total
      </p>
      <div class="flex items-center gap-2">
        @if (imageStore.images().length > 0) {
          <a
            [routerLink]="canAnnotate() ? ['/projects', projectId, 'annotate'] : null"
            [title]="canAnnotate() ? 'Annoter toutes les images en séquence' : 'Le projet doit être en statut READY ou IN_PROGRESS'"
            class="btn-secondary text-sm"
            [class.opacity-40]="!canAnnotate()"
            [class.pointer-events-none]="!canAnnotate()"
            [class.cursor-not-allowed]="!canAnnotate()"
            style="padding: 0.4rem 1rem;"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
            Annoter en lot
          </a>
        }
        <a
          [routerLink]="['/projects', projectId, 'images', 'new']"
          class="btn-primary text-sm"
          style="padding: 0.4rem 1rem;"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Ajouter une image
        </a>
      </div>
    </div>

    @if (imageStore.loading()) {
      <div class="flex items-center justify-center py-12">
        <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    } @else {
      <div class="border border-[#E0E0E0] dark:border-[#525252]">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-[#F4F4F4] dark:bg-[#393939] border-b border-[#E0E0E0] dark:border-[#525252]">
                <th class="px-4 py-2.5 text-left text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em] font-normal">Bucket</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em] font-normal">Clé S3</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em] font-normal hidden md:table-cell">Ajoutée le</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em] font-normal">État</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em] font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (img of imageStore.images(); track img.id) {
                <tr class="border-b border-[#E0E0E0] dark:border-[#525252] hover:bg-[#F4F4F4] dark:hover:bg-[#393939] transition-colors">
                  <td class="px-4 py-3 font-mono text-xs text-[#525252] dark:text-[#C6C6C6] max-w-[140px] truncate">{{ img.s3Bucket }}</td>
                  <td class="px-4 py-3 font-mono text-xs text-[#525252] dark:text-[#C6C6C6] max-w-[180px] truncate">{{ img.s3Key }}</td>
                  <td class="px-4 py-3 text-xs text-[#525252] dark:text-[#C6C6C6] tabular-nums hidden md:table-cell">{{ img.createdAt | slice:0:10 }}</td>
                  <td class="px-4 py-3">
                    @if (annotatedIds().has(img.id)) {
                      <span class="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 bg-[#DEFBE6] text-[#198038]">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                        Annotée
                      </span>
                    } @else {
                      <span class="text-xs text-[#8D8D8D]">—</span>
                    }
                  </td>
                  <td class="px-4 py-3">
                    @if (canAnnotate() || annotatedIds().has(img.id)) {
                    <a
                      [routerLink]="['/projects', projectId, 'annotate']"
                      [queryParams]="{ imageId: img.id }"
                      class="text-xs font-medium"
                      [class]="annotatedIds().has(img.id) ? 'text-[#525252] hover:text-primary' : 'text-primary hover:underline'"
                    >
                      {{ annotatedIds().has(img.id) ? 'Voir annotation' : 'Annoter' }}
                    </a>
                  } @else {
                    <span class="text-xs text-[#C6C6C6]" title="Projet non actif">—</span>
                  }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-4 py-14 text-center text-sm text-[#8D8D8D]">
                    Aucune image.
                    <a [routerLink]="['/projects', projectId, 'images', 'new']" class="text-primary hover:underline ml-1">
                      Ajouter la première image →
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (imageStore.totalPages() > 1) {
          <div class="flex items-center justify-between px-4 py-3 border-t border-[#E0E0E0] dark:border-[#525252]">
            <p class="text-xs text-[#525252]">Page {{ imageStore.currentPage() + 1 }} / {{ imageStore.totalPages() }}</p>
            <div class="flex gap-2">
              <button
                (click)="loadPage(imageStore.currentPage() - 1)"
                [disabled]="imageStore.currentPage() === 0"
                class="btn-secondary text-xs"
                style="padding: 0.3rem 0.875rem;"
              >← Précédent</button>
              <button
                (click)="loadPage(imageStore.currentPage() + 1)"
                [disabled]="imageStore.currentPage() >= imageStore.totalPages() - 1"
                class="btn-secondary text-xs"
                style="padding: 0.3rem 0.875rem;"
              >Suivant →</button>
            </div>
          </div>
        }
      </div>
    }
  `,
})
export class ImageListComponent implements OnInit {
  readonly imageStore = inject(ImageStore);
  readonly annotationStore = inject(AnnotationStore);
  private readonly projectStore = inject(ProjectStore);
  private readonly route = inject(ActivatedRoute);

  projectId!: string;
  readonly annotatedIds = signal<Set<string>>(new Set());

  readonly canAnnotate = computed(() => {
    const status = this.projectStore.selectedProject()?.status;
    return status === 'READY' || status === 'IN_PROGRESS';
  });

  ngOnInit() {
    this.projectId = this.route.snapshot.parent?.paramMap.get('projectId') ?? '';
    this.imageStore.load(this.projectId);
    this.annotationStore.loadByProject(this.projectId);
    this.annotatedIds.set(new Set(this.annotationStore.annotations().map((a) => a.imageId)));
  }

  loadPage(page: number) {
    this.imageStore.load(this.projectId, page);
  }
}
