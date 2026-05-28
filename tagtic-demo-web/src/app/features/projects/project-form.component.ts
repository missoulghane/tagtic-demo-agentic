import { Component, inject, OnInit, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProjectStore } from '../../core/state/project.store';
import { UserStore } from '../../core/state/user.store';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <!-- Top bar -->
    <div class="bg-white dark:bg-[#262626] border-b border-[#E0E0E0] dark:border-[#525252] -mx-6 md:-mx-8 px-6 md:px-8 py-3 mb-6 flex items-center gap-3">
      <a routerLink="/projects" class="flex items-center gap-1.5 text-xs text-[#525252] hover:text-primary">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Projets
      </a>
      <span class="text-[#C6C6C6]">|</span>
      <span class="text-sm font-semibold text-[#161616] dark:text-white">
        {{ isEdit() ? 'Modifier le projet' : 'Nouveau projet' }}
      </span>
    </div>

    <div>
      <div class="bg-white dark:bg-[#262626] border border-[#E0E0E0] dark:border-[#525252]">

        <!-- Header -->
        <div class="px-6 py-5 border-b border-[#E0E0E0] dark:border-[#525252]">
          <h1 class="text-base font-semibold text-[#161616] dark:text-white">
            {{ isEdit() ? 'Modifier le projet' : 'Créer un projet' }}
          </h1>
          <p class="text-xs text-[#525252] dark:text-[#8D8D8D] mt-1">{{ headerDesc() }}</p>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="submit()" class="px-6 py-5 space-y-5">

          <div>
            <label class="block text-xs font-medium text-[#161616] dark:text-white mb-2">
              Titre <span class="text-[#DA1E28]">*</span>
            </label>
            <input
              formControlName="title"
              type="text"
              class="cds-field text-sm w-full"
              placeholder="Ex. Détection de plaques d'immatriculation"
            />
            @if (form.get('title')?.invalid && form.get('title')?.touched) {
              <p class="mt-1.5 text-xs text-[#DA1E28] flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
                Le titre est requis
              </p>
            }
          </div>

          <div>
            <label class="block text-xs font-medium text-[#161616] dark:text-white mb-2">Description</label>
            <textarea
              formControlName="description"
              rows="4"
              class="cds-field text-sm w-full resize-none"
              placeholder="Décrivez l'objectif et le contexte de ce projet d'annotation…"
            ></textarea>
          </div>

          @if (!isEdit()) {
            <div class="flex items-start gap-3 p-4 bg-[#EDF5FF] border-l-4 border-l-[#0F62FE] text-sm text-[#0043CE]">
              <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Le projet sera créé en statut <strong>BROUILLON</strong>. Configurez le formulaire d'annotation avant de le publier.</span>
            </div>
          }

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-[#E0E0E0] dark:border-[#525252]">
            <a routerLink="/projects" class="btn-secondary">Annuler</a>
            <button
              type="submit"
              [disabled]="form.invalid || saving()"
              class="btn-primary"
            >
              @if (saving()) {
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Enregistrement…
              } @else {
                {{ isEdit() ? 'Mettre à jour' : 'Créer le projet' }}
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ProjectFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectStore = inject(ProjectStore);
  private readonly userStore = inject(UserStore);

  readonly isEdit = computed(() => !!this.route.snapshot.paramMap.get('projectId'));
  readonly saving = computed(() => this.projectStore.loadingSelected());
  readonly headerDesc = computed(() =>
    this.isEdit()
      ? 'Modifiez les informations de base. Le statut et les données associées restent inchangés.'
      : "Renseignez les informations de base. Vous configurerez le formulaire d'annotation ensuite.",
  );

  readonly form = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl(''),
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('projectId');
    if (id) {
      this.projectStore.loadOne(id);
      const p = this.projectStore.selectedProject();
      if (p) {
        this.form.setValue({ title: p.title, description: p.description });
      } else {
        const interval = setInterval(() => {
          const loaded = this.projectStore.selectedProject();
          if (loaded) {
            this.form.setValue({ title: loaded.title, description: loaded.description });
            clearInterval(interval);
          }
        }, 100);
      }
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { title, description } = this.form.value;
    const id = this.route.snapshot.paramMap.get('projectId');

    if (id) {
      this.projectStore.update(id, { title: title!, description: description ?? '' }, () => {
        this.router.navigate(['/projects', id]);
      });
    } else {
      this.projectStore.create(
        { title: title!, description: description ?? '', createdBy: this.userStore.currentUser() },
        (p) => this.router.navigate(['/projects', p.id]),
      );
    }
  }
}
