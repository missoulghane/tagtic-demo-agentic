import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { AnnotationStore } from '../../core/state/annotation.store';
import { StatusBadgeComponent } from '../../shared/badge/status-badge.component';

@Component({
  selector: 'app-annotation-list',
  standalone: true,
  imports: [RouterLink, SlicePipe, StatusBadgeComponent],
  template: `
    <div class="flex items-center justify-between mb-4">
      <p class="text-xs text-[#525252] dark:text-[#8D8D8D]">
        {{ annotationStore.annotations().length }} annotation(s)
      </p>
    </div>

    @if (annotationStore.loading()) {
      <div class="flex items-center justify-center py-12">
        <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    } @else {
      <div class="border border-[#E0E0E0] dark:border-[#525252]">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-[#F4F4F4] dark:bg-[#393939] border-b border-[#E0E0E0] dark:border-[#525252]">
                <th class="px-4 py-2.5 text-left text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em] font-normal">Image</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em] font-normal">Annoté par</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em] font-normal hidden md:table-cell">Date</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em] font-normal">Statut</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em] font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (a of annotationStore.annotations(); track a.id) {
                <tr class="border-b border-[#E0E0E0] dark:border-[#525252] hover:bg-[#F4F4F4] dark:hover:bg-[#393939] transition-colors">
                  <td class="px-4 py-3 font-mono text-xs text-[#525252] dark:text-[#C6C6C6] max-w-[140px] truncate">{{ a.imageId }}</td>
                  <td class="px-4 py-3 text-sm text-[#161616] dark:text-white">{{ a.annotatedBy }}</td>
                  <td class="px-4 py-3 text-xs text-[#525252] dark:text-[#C6C6C6] tabular-nums hidden md:table-cell">{{ a.annotatedAt | slice:0:10 }}</td>
                  <td class="px-4 py-3"><app-status-badge [status]="a.status" /></td>
                  <td class="px-4 py-3">
                    <a
                      [routerLink]="['/projects', a.projectId, 'images', a.imageId, 'annotate']"
                      class="text-xs text-primary hover:underline font-medium"
                    >Consulter →</a>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-4 py-14 text-center text-sm text-[#8D8D8D]">
                    Aucune annotation pour ce projet
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `,
})
export class AnnotationListComponent implements OnInit {
  readonly annotationStore = inject(AnnotationStore);
  private readonly route = inject(ActivatedRoute);

  ngOnInit() {
    const projectId = this.route.snapshot.parent?.paramMap.get('projectId') ?? '';
    this.annotationStore.loadByProject(projectId);
  }
}
