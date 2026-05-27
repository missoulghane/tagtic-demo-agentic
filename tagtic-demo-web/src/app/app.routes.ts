import { Routes } from '@angular/router';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProjetsComponent } from './pages/projets/projets.component';
import { FormulaireComponent } from './pages/formulaire/formulaire.component';
import { EchantillonsComponent } from './pages/echantillons/echantillons.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: '',
        component: DashboardComponent,
        pathMatch: 'full',
        title: 'Dashboard | Tagtic',
      },
      {
        path: 'projets',
        component: ProjetsComponent,
        title: 'Projets | Tagtic',
      },
      {
        path: 'formulaire',
        component: FormulaireComponent,
        title: 'Formulaire | Tagtic',
      },
      {
        path: 'echantillons',
        component: EchantillonsComponent,
        title: 'Échantillons | Tagtic',
      },
    ],
  },
  {
    path: 'signin',
    component: SignInComponent,
    title: 'Connexion | Tagtic',
  },
  {
    path: 'signup',
    component: SignUpComponent,
    title: 'Inscription | Tagtic',
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Page introuvable | Tagtic',
  },
];
