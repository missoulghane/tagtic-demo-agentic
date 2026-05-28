import { Component, inject, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ProjectStore } from '../../core/state/project.store';
import { StatusBadgeComponent } from '../../shared/badge/status-badge.component';
import { ProjectStatus } from '../../core/models';

interface KpiCard {
  label: string;
  status: ProjectStatus;
  tagClass: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, SlicePipe, NgApexchartsModule, StatusBadgeComponent],
  template: `
    <!-- Top bar -->
    <div class="bg-white dark:bg-[#262626] border-b border-[#E0E0E0] dark:border-[#525252] -mx-6 md:-mx-8 px-6 md:px-8 py-3 mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <h1 class="text-sm font-semibold text-[#161616] dark:text-white">Tableau de bord</h1>
        <span class="text-[#C6C6C6]">|</span>
        <span class="text-xs text-[#525252] dark:text-[#8D8D8D]">{{ projectStore.projects().length }} projet(s)</span>
      </div>
    </div>

    <!-- KPI tiles — séparés par 1px de bordure -->
    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-px bg-[#E0E0E0] dark:bg-[#525252] mb-8 border border-[#E0E0E0] dark:border-[#525252]">
      @for (card of kpiCards; track card.status) {
        <div class="bg-white dark:bg-[#262626] p-5">
          <p class="text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em] mb-2">
            {{ card.label }}
          </p>
          <p class="text-4xl font-light text-[#161616] dark:text-white tabular-nums">
            {{ countByStatus(card.status) }}
          </p>
          <div class="mt-3">
            <span class="text-[10px] font-medium px-1.5 py-0.5" [class]="card.tagClass">
              {{ card.status }}
            </span>
          </div>
        </div>
      }
    </div>

    <!-- Chart + Recent projects -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">

      <!-- Donut chart -->
      <div class="bg-white dark:bg-[#262626] border border-[#E0E0E0] dark:border-[#525252]">
        <div class="px-5 py-4 border-b border-[#E0E0E0] dark:border-[#525252]">
          <p class="text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em]">Répartition par statut</p>
        </div>
        <div class="px-5 py-4">
          <apx-chart
            [series]="chartSeries()"
            [chart]="chartOptions.chart"
            [labels]="chartOptions.labels"
            [colors]="chartOptions.colors"
            [legend]="chartOptions.legend"
            [dataLabels]="chartOptions.dataLabels"
            [plotOptions]="chartOptions.plotOptions"
          />
        </div>
      </div>

      <!-- Recent projects table -->
      <div class="xl:col-span-2 bg-white dark:bg-[#262626] border border-[#E0E0E0] dark:border-[#525252]">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-[#E0E0E0] dark:border-[#525252]">
          <p class="text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em]">Projets récents</p>
          <a routerLink="/projects" class="text-xs text-primary hover:text-[#0043CE] font-medium">Voir tout →</a>
        </div>

        @if (projectStore.loading()) {
          <div class="flex items-center justify-center py-14">
            <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-[#F4F4F4] dark:bg-[#393939] border-b border-[#E0E0E0] dark:border-[#525252]">
                  <th class="px-5 py-2.5 text-left text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em] font-normal">Titre</th>
                  <th class="px-5 py-2.5 text-left text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em] font-normal">Statut</th>
                  <th class="px-5 py-2.5 text-left text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em] font-normal hidden md:table-cell">Créateur</th>
                  <th class="px-5 py-2.5 text-left text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-[0.1em] font-normal hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                @for (p of recentProjects(); track p.id) {
                  <tr class="border-b border-[#E0E0E0] dark:border-[#525252] hover:bg-[#F4F4F4] dark:hover:bg-[#393939] transition-colors">
                    <td class="px-5 py-3">
                      <a [routerLink]="['/projects', p.id]" class="text-sm font-medium text-[#161616] dark:text-white hover:text-primary">
                        {{ p.title }}
                      </a>
                    </td>
                    <td class="px-5 py-3"><app-status-badge [status]="p.status" /></td>
                    <td class="px-5 py-3 text-[#525252] dark:text-[#C6C6C6] text-xs hidden md:table-cell">{{ p.createdBy }}</td>
                    <td class="px-5 py-3 text-[#525252] dark:text-[#C6C6C6] text-xs tabular-nums hidden md:table-cell">{{ p.createdAt | slice:0:10 }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-5 py-12 text-center text-sm text-[#8D8D8D]">
                      Aucun projet — <a routerLink="/projects/new" class="text-primary hover:underline">créer le premier</a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  readonly projectStore = inject(ProjectStore);

  ngOnInit() {
    this.projectStore.loadAll();
  }

  readonly kpiCards: KpiCard[] = [
    { label: 'Brouillon',  status: 'DRAFT',       tagClass: 'bg-[#E8E8E8] text-[#525252]' },
    { label: 'Prêt',       status: 'READY',        tagClass: 'bg-[#D0E2FF] text-[#0043CE]' },
    { label: 'En cours',   status: 'IN_PROGRESS',  tagClass: 'bg-[#FCF4D6] text-[#B28600]' },
    { label: 'Terminé',    status: 'COMPLETED',    tagClass: 'bg-[#DEFBE6] text-[#198038]' },
    { label: 'Archivé',    status: 'ARCHIVED',     tagClass: 'bg-[#E8E8E8] text-[#8D8D8D]' },
  ];

  countByStatus(status: ProjectStatus): number {
    return this.projectStore.projects().filter((p) => p.status === status).length;
  }

  readonly recentProjects = computed(() =>
    [...this.projectStore.projects()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 8),
  );

  readonly chartSeries = computed(() => [
    this.countByStatus('DRAFT') + this.countByStatus('READY'),
    this.countByStatus('IN_PROGRESS') + this.countByStatus('COMPLETED'),
    this.countByStatus('ARCHIVED'),
  ]);

  readonly chartOptions = {
    chart: { type: 'donut' as const, height: 220, background: 'transparent', toolbar: { show: false } },
    labels: ['En attente', 'Actifs', 'Archivés'],
    colors: ['#B28600', '#0F62FE', '#8D8D8D'],
    legend: { position: 'bottom' as const, fontSize: '12px', fontFamily: 'IBM Plex Sans, Inter, sans-serif' },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: '68%' } } },
    stroke: { width: 0 },
  };
}
