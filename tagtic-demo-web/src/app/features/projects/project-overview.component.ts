import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { ProjectStore } from '../../core/state/project.store';
import { FormStore } from '../../core/state/form.store';
import { AnnotationStore } from '../../core/state/annotation.store';
import { ImageStore } from '../../core/state/image.store';
import { StatusBadgeComponent } from '../../shared/badge/status-badge.component';
import { ProjectStatus } from '../../core/models';

interface StatusAction {
  label: string;
  targetStatus: ProjectStatus;
  condition: () => boolean;
  tooltip: () => string;
}

@Component({
  selector: 'app-project-overview',
  standalone: true,
  imports: [SlicePipe, StatusBadgeComponent],
  template: `
    <div class="space-y-8">

      <!-- Metadata grid -->
      <div>
        <p class="text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em] mb-4">Informations</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">

          <div class="border-b border-[#E0E0E0] dark:border-[#525252] pb-3">
            <p class="text-[10px] text-[#8D8D8D] uppercase tracking-wide mb-1">Titre</p>
            <p class="text-sm text-[#161616] dark:text-white font-medium">{{ project()?.title }}</p>
          </div>

          <div class="border-b border-[#E0E0E0] dark:border-[#525252] pb-3">
            <p class="text-[10px] text-[#8D8D8D] uppercase tracking-wide mb-1">Statut</p>
            @if (project()?.status) {
              <app-status-badge [status]="project()!.status" />
            }
          </div>

          <div class="border-b border-[#E0E0E0] dark:border-[#525252] pb-3 md:col-span-2">
            <p class="text-[10px] text-[#8D8D8D] uppercase tracking-wide mb-1">Description</p>
            <p class="text-sm text-[#525252] dark:text-[#C6C6C6]">{{ project()?.description || '—' }}</p>
          </div>

          <div class="border-b border-[#E0E0E0] dark:border-[#525252] pb-3">
            <p class="text-[10px] text-[#8D8D8D] uppercase tracking-wide mb-1">Créé par</p>
            <p class="text-sm text-[#525252] dark:text-[#C6C6C6]">{{ project()?.createdBy }}</p>
          </div>

          <div class="border-b border-[#E0E0E0] dark:border-[#525252] pb-3">
            <p class="text-[10px] text-[#8D8D8D] uppercase tracking-wide mb-1">Date de création</p>
            <p class="text-sm text-[#525252] dark:text-[#C6C6C6] tabular-nums">{{ project()?.createdAt | slice:0:10 }}</p>
          </div>

          <div class="border-b border-[#E0E0E0] dark:border-[#525252] pb-3">
            <p class="text-[10px] text-[#8D8D8D] uppercase tracking-wide mb-1">Dernière modification</p>
            <p class="text-sm text-[#525252] dark:text-[#C6C6C6] tabular-nums">{{ project()?.updatedAt | slice:0:10 }}</p>
          </div>

        </div>
      </div>

      <!-- Lifecycle actions -->
      <div>
        <p class="text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em] mb-4">Cycle de vie</p>
        <div class="flex flex-wrap gap-2">
          @for (action of statusActions; track action.targetStatus) {
            @if (action.targetStatus !== project()?.status) {
              <button
                (click)="changeStatus(action.targetStatus)"
                [disabled]="!action.condition()"
                [title]="action.tooltip()"
                class="btn-secondary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {{ action.label }}
              </button>
            }
          }
        </div>
        @if (!formStore.canPublish() && project()?.status === 'DRAFT') {
          <p class="mt-3 text-xs text-[#8D8D8D] flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-[#B28600]" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            Créez un formulaire avec au moins 1 champ pour pouvoir passer à READY
          </p>
        }
      </div>

    </div>
  `,
})
export class ProjectOverviewComponent {
  private readonly route = inject(ActivatedRoute);
  readonly projectStore = inject(ProjectStore);
  readonly formStore = inject(FormStore);
  readonly annotationStore = inject(AnnotationStore);
  readonly imageStore = inject(ImageStore);

  readonly project = computed(() => this.projectStore.selectedProject());

  readonly statusActions: StatusAction[] = [
    {
      label: 'Publier (READY)',
      targetStatus: 'READY',
      condition: () => this.formStore.canPublish(),
      tooltip: () => this.formStore.canPublish() ? 'Publier le projet' : 'Créez un formulaire avec au moins 1 champ',
    },
    {
      label: 'Démarrer (IN_PROGRESS)',
      targetStatus: 'IN_PROGRESS',
      condition: () => this.project()?.status === 'READY',
      tooltip: () => 'Démarrer les annotations',
    },
    {
      label: 'Terminer (COMPLETED)',
      targetStatus: 'COMPLETED',
      condition: () => this.project()?.status === 'IN_PROGRESS',
      tooltip: () => 'Marquer le projet comme terminé',
    },
    {
      label: 'Archiver',
      targetStatus: 'ARCHIVED',
      condition: () => this.project()?.status !== 'ARCHIVED',
      tooltip: () => 'Archiver le projet',
    },
  ];

  changeStatus(status: ProjectStatus) {
    const id = this.route.snapshot.parent?.paramMap.get('projectId');
    if (!id) return;
    this.projectStore.changeStatus(id, status);
  }
}
