import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Project {
  nom: string;
  documents: number;
  annotations: number;
  progression: number;
  statut: 'En cours' | 'Terminé' | 'Nouveau';
  date: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  projects: Project[] = [
    { nom: 'Corpus Juridique 2024', documents: 150, annotations: 1423, progression: 95, statut: 'Terminé', date: '15 déc. 2024' },
    { nom: 'Archives Historiques', documents: 200, annotations: 843, progression: 42, statut: 'En cours', date: '8 jan. 2025' },
    { nom: 'Presse Scientifique', documents: 80, annotations: 412, progression: 52, statut: 'En cours', date: '15 jan. 2025' },
    { nom: 'Documents Administratifs', documents: 120, annotations: 169, progression: 14, statut: 'En cours', date: '1 fév. 2025' },
    { nom: 'Rapports Techniques', documents: 50, annotations: 0, progression: 0, statut: 'Nouveau', date: '10 fév. 2025' },
  ];

  statutClass(statut: string): string {
    switch (statut) {
      case 'Terminé': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'En cours': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default:         return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  }

  progressionClass(progression: number): string {
    if (progression >= 80) return 'bg-green-500';
    if (progression >= 40) return 'bg-blue-500';
    if (progression > 0)   return 'bg-orange-400';
    return 'bg-gray-300 dark:bg-gray-700';
  }
}
