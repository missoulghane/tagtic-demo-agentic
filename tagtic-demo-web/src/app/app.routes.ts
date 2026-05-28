import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./features/projects/project-list.component').then((m) => m.ProjectListComponent),
      },
      /* ── Création projet ── */
      {
        path: 'projects/new',
        loadComponent: () =>
          import('./features/projects/project-form.component').then((m) => m.ProjectFormComponent),
      },
      /* ── Édition projet ── */
      {
        path: 'projects/:projectId/edit',
        loadComponent: () =>
          import('./features/projects/project-form.component').then((m) => m.ProjectFormComponent),
      },
      /* ── Détail projet + onglets ── */
      {
        path: 'projects/:projectId',
        loadComponent: () =>
          import('./features/projects/project-detail.component').then((m) => m.ProjectDetailComponent),
        children: [
          {
            path: 'overview',
            loadComponent: () =>
              import('./features/projects/project-overview.component').then((m) => m.ProjectOverviewComponent),
          },
          {
            path: 'form',
            loadComponent: () =>
              import('./features/forms/form-editor.component').then((m) => m.FormEditorComponent),
          },
          {
            path: 'images',
            loadComponent: () =>
              import('./features/images/image-list.component').then((m) => m.ImageListComponent),
          },
          {
            path: 'annotations',
            loadComponent: () =>
              import('./features/annotations/annotation-list.component').then((m) => m.AnnotationListComponent),
          },
          { path: '', redirectTo: 'overview', pathMatch: 'full' },
        ],
      },
      /* ── Ajout image (hors onglets) ── */
      {
        path: 'projects/:projectId/images/new',
        loadComponent: () =>
          import('./features/images/image-form.component').then((m) => m.ImageFormComponent),
      },
      /* ── Annotation image par image ── */
      {
        path: 'projects/:projectId/images/:imageId/annotate',
        loadComponent: () =>
          import('./features/annotations/annotate.component').then((m) => m.AnnotateComponent),
      },
      /* ── Annotation en lot (toutes les images) ── */
      {
        path: 'projects/:projectId/annotate',
        loadComponent: () =>
          import('./features/annotations/annotate-batch.component').then((m) => m.AnnotateBatchComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
