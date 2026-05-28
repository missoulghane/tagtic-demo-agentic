import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ProjectStore } from '../../core/state/project.store';
import { FormStore } from '../../core/state/form.store';
import { StatusBadgeComponent } from '../../shared/badge/status-badge.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, StatusBadgeComponent],
  template: `
    <!-- Top bar -->
    <div class="bg-white dark:bg-[#262626] border-b border-[#E0E0E0] dark:border-[#525252] -mx-6 md:-mx-8 px-6 md:px-8 py-3 mb-6 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3 min-w-0">
        <a routerLink="/projects" class="flex items-center gap-1.5 text-xs text-[#525252] hover:text-primary shrink-0">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Projets
        </a>
        <span class="text-[#C6C6C6] shrink-0">|</span>
        <span class="text-sm font-semibold text-[#161616] dark:text-white truncate">
          {{ projectStore.selectedProject()?.title ?? 'Chargement…' }}
        </span>
        @if (projectStore.selectedProject()?.status) {
          <app-status-badge [status]="projectStore.selectedProject()!.status" />
        }
      </div>
      @if (projectStore.selectedProject(); as project) {
        <a [routerLink]="['/projects', project.id, 'edit']" class="btn-secondary shrink-0" style="padding: 0.35rem 0.875rem; font-size: 12px;">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
          </svg>
          Modifier
        </a>
      }
    </div>

    @if (projectStore.loadingSelected()) {
      <div class="flex items-center justify-center py-24">
        <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    } @else if (projectStore.selectedProject(); as project) {

      <!-- Tabs -->
      <div class="bg-white dark:bg-[#262626] border border-[#E0E0E0] dark:border-[#525252]">
        <div class="border-b border-[#E0E0E0] dark:border-[#525252] px-2">
          <nav class="flex" role="tablist">
            @for (tab of tabs; track tab.path) {
              <a
                [routerLink]="tab.path"
                routerLinkActive="border-b-2 border-primary text-[#161616] dark:text-white"
                class="flex items-center gap-1.5 px-4 py-3 text-sm text-[#525252] dark:text-[#C6C6C6] hover:text-[#161616] dark:hover:text-white border-b-2 border-transparent transition-colors"
              >
                {{ tab.label }}
              </a>
            }
          </nav>
        </div>
        <div class="p-6">
          <router-outlet />
        </div>
      </div>

    } @else {
      <div class="text-center py-20 text-[#8D8D8D]">Projet introuvable</div>
    }
  `,
})
export class ProjectDetailComponent implements OnInit {
  readonly projectStore = inject(ProjectStore);
  readonly formStore = inject(FormStore);
  private readonly route = inject(ActivatedRoute);

  readonly tabs = [
    { label: 'Aperçu',       path: 'overview' },
    { label: 'Formulaire',   path: 'form' },
    { label: 'Images',       path: 'images' },
    { label: 'Annotations',  path: 'annotations' },
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('projectId')!;
    this.projectStore.loadOne(id);
    this.formStore.loadForm(id);
  }
}
