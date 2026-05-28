import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { ProjectStore } from '../../core/state/project.store';
import { StatusBadgeComponent } from '../../shared/badge/status-badge.component';
import { AnnotationProject } from '../../core/models';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [RouterLink, FormsModule, SlicePipe, StatusBadgeComponent],
  template: `
    <!-- Top bar -->
    <div class="bg-white dark:bg-[#262626] border-b border-[#E0E0E0] dark:border-[#525252] -mx-6 md:-mx-8 px-6 md:px-8 py-3 mb-6 flex items-center justify-between">
      <h1 class="text-sm font-semibold text-[#161616] dark:text-white">Projets</h1>
      <a routerLink="/projects/new" class="btn-primary" style="padding: 0.35rem 1rem; font-size: 13px;">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Nouveau projet
      </a>
    </div>

    <!-- Toolbar / Filters -->
    <div class="bg-white dark:bg-[#262626] border border-[#E0E0E0] dark:border-[#525252] border-b-0 px-4 py-3 flex flex-wrap items-center gap-3">
      <div class="relative">
        <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8D8D8D] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
        </svg>
        <input
          type="text"
          [(ngModel)]="searchQuery"
          placeholder="Rechercher par titre…"
          class="h-8 w-56 border border-[#8D8D8D] bg-white pl-8 pr-3 text-sm text-[#161616] placeholder:text-[#A8A8A8] outline-none focus:ring-2 focus:ring-primary focus:ring-inset dark:bg-[#393939] dark:border-[#6F6F6F] dark:text-[#F4F4F4]"
        />
      </div>
      <select
        [(ngModel)]="statusFilter"
        class="h-8 w-44 border border-[#8D8D8D] bg-white px-3 text-sm text-[#161616] outline-none focus:ring-2 focus:ring-primary focus:ring-inset dark:bg-[#393939] dark:border-[#6F6F6F] dark:text-[#F4F4F4]"
      >
        <option value="">Tous les statuts</option>
        <option value="DRAFT">Brouillon</option>
        <option value="READY">Prêt</option>
        <option value="IN_PROGRESS">En cours</option>
        <option value="COMPLETED">Terminé</option>
        <option value="ARCHIVED">Archivé</option>
      </select>
      @if (searchQuery || statusFilter) {
        <button (click)="clearFilters()" class="text-xs text-[#525252] hover:text-primary underline">
          Effacer
        </button>
      }
      <span class="ml-auto text-xs text-[#8D8D8D]">{{ filtered().length }} résultat(s)</span>
    </div>

    <!-- DataTable -->
    <div class="bg-white dark:bg-[#262626] border border-[#E0E0E0] dark:border-[#525252]">
      @if (projectStore.loading()) {
        <div class="flex items-center justify-center py-16">
          <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-[#F4F4F4] dark:bg-[#393939] border-b border-[#E0E0E0] dark:border-[#525252]">
                <th class="px-5 py-2.5 text-left text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em] font-normal">Titre</th>
                <th class="px-5 py-2.5 text-left text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em] font-normal hidden md:table-cell">Description</th>
                <th class="px-5 py-2.5 text-left text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em] font-normal">Statut</th>
                <th class="px-5 py-2.5 text-left text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em] font-normal hidden lg:table-cell">Créateur</th>
                <th class="px-5 py-2.5 text-left text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em] font-normal hidden lg:table-cell">Date</th>
                <th class="px-5 py-2.5 text-left text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em] font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (p of paginated(); track p.id) {
                <tr class="border-b border-[#E0E0E0] dark:border-[#525252] hover:bg-[#F4F4F4] dark:hover:bg-[#393939] transition-colors">
                  <td class="px-5 py-3.5">
                    <a [routerLink]="['/projects', p.id]" class="font-medium text-[#161616] dark:text-white hover:text-primary line-clamp-1">
                      {{ p.title }}
                    </a>
                  </td>
                  <td class="px-5 py-3.5 text-[#525252] dark:text-[#C6C6C6] text-xs hidden md:table-cell">
                    <span class="line-clamp-1">{{ p.description || '—' }}</span>
                  </td>
                  <td class="px-5 py-3.5"><app-status-badge [status]="p.status" /></td>
                  <td class="px-5 py-3.5 text-[#525252] dark:text-[#C6C6C6] text-xs hidden lg:table-cell">{{ p.createdBy }}</td>
                  <td class="px-5 py-3.5 text-[#525252] dark:text-[#C6C6C6] text-xs tabular-nums hidden lg:table-cell">{{ p.createdAt | slice:0:10 }}</td>
                  <td class="px-5 py-3.5">
                    <div class="flex items-center gap-4">
                      <a [routerLink]="['/projects', p.id]" class="text-xs text-primary hover:underline font-medium">
                        Détail
                      </a>
                      <a [routerLink]="['/projects', p.id, 'edit']" class="text-xs text-[#525252] dark:text-[#C6C6C6] hover:text-primary font-medium">
                        Éditer
                      </a>
                      <button
                        (click)="deleteProject(p)"
                        class="text-xs text-[#DA1E28] hover:text-[#BA1B23] font-medium"
                      >Supprimer</button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-5 py-14 text-center text-sm text-[#8D8D8D]">
                    Aucun projet trouvé
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex items-center justify-between px-5 py-3 border-t border-[#E0E0E0] dark:border-[#525252]">
            <p class="text-xs text-[#525252]">Page {{ currentPage() + 1 }} / {{ totalPages() }}</p>
            <div class="flex gap-2">
              <button
                (click)="prevPage()"
                [disabled]="currentPage() === 0"
                class="btn-secondary text-xs"
                style="padding: 0.3rem 0.875rem;"
              >← Précédent</button>
              <button
                (click)="nextPage()"
                [disabled]="currentPage() >= totalPages() - 1"
                class="btn-secondary text-xs"
                style="padding: 0.3rem 0.875rem;"
              >Suivant →</button>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class ProjectListComponent implements OnInit {
  readonly projectStore = inject(ProjectStore);

  searchQuery = '';
  statusFilter = '';
  currentPage = signal(0);
  readonly pageSize = 10;

  ngOnInit() {
    this.projectStore.loadAll();
  }

  readonly filtered = computed(() => {
    let list = this.projectStore.projects();
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }
    if (this.statusFilter) {
      list = list.filter((p) => p.status === this.statusFilter);
    }
    return list;
  });

  readonly totalPages = computed(() => Math.ceil(this.filtered().length / this.pageSize));

  readonly paginated = computed(() => {
    const start = this.currentPage() * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  prevPage() { this.currentPage.update((p) => Math.max(0, p - 1)); }
  nextPage() { this.currentPage.update((p) => Math.min(this.totalPages() - 1, p + 1)); }

  clearFilters() {
    this.searchQuery = '';
    this.statusFilter = '';
    this.currentPage.set(0);
  }

  deleteProject(p: AnnotationProject) {
    if (!confirm(`Supprimer le projet « ${p.title} » ?`)) return;
    this.projectStore.delete(p.id);
  }
}
