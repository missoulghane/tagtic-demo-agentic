import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { ProjectStatus, AnnotationStatus } from '../../core/models';

type BadgeStatus = ProjectStatus | AnnotationStatus;

const LABELS: Record<BadgeStatus, string> = {
  DRAFT:       'Brouillon',
  READY:       'Prêt',
  IN_PROGRESS: 'En cours',
  COMPLETED:   'Terminé',
  ARCHIVED:    'Archivé',
  PENDING:     'En attente',
  VALIDATED:   'Validé',
  REJECTED:    'Rejeté',
};

const CLASSES: Record<BadgeStatus, string> = {
  DRAFT:       'bg-[#E8E8E8] text-[#525252]',
  READY:       'bg-[#D0E2FF] text-[#0043CE]',
  IN_PROGRESS: 'bg-[#FCF4D6] text-[#B28600]',
  COMPLETED:   'bg-[#DEFBE6] text-[#198038]',
  ARCHIVED:    'bg-[#E8E8E8] text-[#8D8D8D]',
  PENDING:     'bg-[#FCF4D6] text-[#B28600]',
  VALIDATED:   'bg-[#DEFBE6] text-[#198038]',
  REJECTED:    'bg-[#FFF1F1] text-[#DA1E28]',
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span
      class="inline-flex items-center px-2 py-0.5 text-[11px] font-medium tracking-wide"
      [ngClass]="cls()"
    >
      {{ label() }}
    </span>
  `,
})
export class StatusBadgeComponent {
  status = input.required<BadgeStatus>();

  label() { return LABELS[this.status()] ?? this.status(); }
  cls()   { return CLASSES[this.status()] ?? 'bg-[#E8E8E8] text-[#525252]'; }
}
