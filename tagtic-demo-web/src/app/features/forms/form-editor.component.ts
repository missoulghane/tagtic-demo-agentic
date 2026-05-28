import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { FormStore } from '../../core/state/form.store';
import { ProjectStore } from '../../core/state/project.store';
import { UserStore } from '../../core/state/user.store';
import { FormField, FieldType } from '../../core/models';

@Component({
  selector: 'app-form-editor',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  template: `
    @if (formStore.loading()) {
      <div class="flex items-center justify-center py-12">
        <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    } @else if (!formStore.hasForm()) {

      <!-- ── Pas de formulaire ── -->
      <div class="text-center py-12">
        <div class="w-12 h-12 bg-[#F4F4F4] dark:bg-[#393939] mx-auto mb-4 flex items-center justify-center">
          <svg class="w-6 h-6 text-[#8D8D8D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </div>
        <p class="text-sm text-[#525252] dark:text-[#C6C6C6] mb-5">Aucun formulaire configuré pour ce projet</p>
        @if (canEdit() && !showCreateInline()) {
          <button (click)="showCreateInline.set(true)" class="btn-primary">
            Créer le formulaire
          </button>
        }
      </div>

      @if (showCreateInline()) {
        <div class="mt-4 bg-white dark:bg-[#393939] border border-[#E0E0E0] dark:border-[#525252]">
          <div class="px-5 py-3.5 border-b border-[#E0E0E0] dark:border-[#525252] flex items-center justify-between bg-[#F4F4F4] dark:bg-[#393939]">
            <p class="text-sm font-medium text-[#161616] dark:text-white">Créer le formulaire</p>
            <button (click)="showCreateInline.set(false)" class="w-6 h-6 flex items-center justify-center text-[#525252] hover:text-[#161616]">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <form [formGroup]="createFormFg" (ngSubmit)="submitCreateForm()" class="px-5 py-4 space-y-4">
            <div>
              <label class="block text-xs font-medium text-[#161616] dark:text-white mb-1.5">Titre <span class="text-[#DA1E28]">*</span></label>
              <input formControlName="title" type="text" class="cds-field text-sm w-full" placeholder="Titre du formulaire" />
              @if (createFormFg.get('title')?.invalid && createFormFg.get('title')?.touched) {
                <p class="text-xs text-[#DA1E28] mt-1">Titre requis</p>
              }
            </div>
            <div>
              <label class="block text-xs font-medium text-[#161616] dark:text-white mb-1.5">Description</label>
              <textarea formControlName="description" rows="2" class="cds-field text-sm w-full resize-none" placeholder="Description optionnelle"></textarea>
            </div>
            <div class="flex justify-end gap-2 pt-2 border-t border-[#E0E0E0] dark:border-[#525252]">
              <button type="button" (click)="showCreateInline.set(false)" class="btn-secondary text-sm" style="padding: 0.4rem 1rem;">Annuler</button>
              <button type="submit" class="btn-primary text-sm" style="padding: 0.4rem 1rem;">Créer</button>
            </div>
          </form>
        </div>
      }

    } @else {

      <!-- ── Formulaire existant ── -->

      <!-- Bandeau lecture seule -->
      @if (!canEdit()) {
        <div class="mb-5 flex items-start gap-3 p-4 bg-[#FCF4D6] border-l-4 border-l-[#B28600] text-sm text-[#B28600]">
          <svg class="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <span>Formulaire verrouillé — le projet n'est plus en brouillon. Structure en lecture seule.</span>
        </div>
      }

      <!-- En-tête formulaire -->
      <div class="flex items-center justify-between mb-5 pb-4 border-b border-[#E0E0E0] dark:border-[#525252]">
        <div>
          <p class="text-sm font-semibold text-[#161616] dark:text-white">{{ formStore.form()?.title }}</p>
          <p class="text-xs text-[#525252] dark:text-[#8D8D8D] mt-0.5">
            {{ formStore.form()?.description }} · v{{ formStore.form()?.version }}
            · <span class="text-primary">{{ formStore.fieldCount() }} champ(s)</span>
          </p>
        </div>
        @if (canEdit()) {
          <button (click)="toggleAddFields()" class="btn-primary text-sm" style="padding: 0.4rem 1rem;">
            @if (!showAddInline()) {
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Ajouter des champs
            } @else {
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
              </svg>
              Masquer
            }
          </button>
        }
      </div>

      <!-- Section ajout inline -->
      @if (showAddInline() && canEdit()) {
        <div class="mb-6 bg-white dark:bg-[#393939] border border-[#E0E0E0] dark:border-[#525252]">
          <div class="px-5 py-3.5 border-b border-[#E0E0E0] dark:border-[#525252] bg-[#F4F4F4] dark:bg-[#393939] flex items-center justify-between">
            <p class="text-xs font-medium text-[#161616] dark:text-white uppercase tracking-wide">Nouveaux champs</p>
          </div>
          <div class="p-5 space-y-3">
            @for (field of newFieldsArray; track $index; let i = $index) {
              <div class="border border-[#E0E0E0] dark:border-[#525252] bg-[#F4F4F4] dark:bg-[#262626] p-4 relative">
                @if (newFieldsArray.length > 1) {
                  <button
                    (click)="removeNewField(i)"
                    class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-[#8D8D8D] hover:text-[#DA1E28] hover:bg-[#FFF1F1]"
                    title="Supprimer"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                }
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <label class="block text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-wide mb-1.5">Nom *</label>
                    <input [(ngModel)]="field.name" type="text" class="cds-field text-sm w-full" placeholder="nom_champ" />
                  </div>
                  <div>
                    <label class="block text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-wide mb-1.5">Label *</label>
                    <input [(ngModel)]="field.label" type="text" class="cds-field text-sm w-full" placeholder="Label affiché" />
                  </div>
                  <div>
                    <label class="block text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-wide mb-1.5">Type</label>
                    <select [(ngModel)]="field.type" class="cds-field text-sm w-full">
                      <option value="TEXT">TEXT</option>
                      <option value="NUMBER">NUMBER</option>
                      <option value="BOOLEAN">BOOLEAN</option>
                      <option value="DATE">DATE</option>
                      <option value="SELECT">SELECT</option>
                    </select>
                  </div>
                  <div class="flex items-center gap-2 mt-5">
                    <input type="checkbox" [(ngModel)]="field.required" class="w-4 h-4 border-[#8D8D8D] text-primary" />
                    <label class="text-xs text-[#525252] dark:text-[#C6C6C6]">Requis</label>
                  </div>
                  <div>
                    <label class="block text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-wide mb-1.5">Valeur par défaut</label>
                    <input [(ngModel)]="field.defaultValue" type="text" class="cds-field text-sm w-full" placeholder="Optionnel" />
                  </div>
                  <div>
                    <label class="block text-[10px] font-medium text-[#525252] dark:text-[#8D8D8D] uppercase tracking-wide mb-1.5">Clé JSON</label>
                    <input [(ngModel)]="field.jsonMappingKey" type="text" class="cds-field text-sm w-full" placeholder="metadata.key" />
                  </div>
                </div>
              </div>
            }

            <button (click)="addNewFieldRow()" class="btn-secondary w-full text-sm" style="padding: 0.5rem;">
              + Ajouter une ligne
            </button>

            <div class="flex justify-end gap-2 pt-2 border-t border-[#E0E0E0] dark:border-[#525252]">
              <button type="button" (click)="cancelAddFields()" class="btn-secondary text-sm" style="padding: 0.4rem 1rem;">Annuler</button>
              <button type="button" (click)="submitAddFields()" class="btn-primary text-sm" style="padding: 0.4rem 1rem;">
                Enregistrer {{ newFieldsArray.length }} champ{{ newFieldsArray.length > 1 ? 's' : '' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Liste des champs -->
      @if (formStore.fields().length === 0) {
        <div class="text-center py-10 border border-dashed border-[#C6C6C6] dark:border-[#525252]">
          <p class="text-sm text-[#8D8D8D]">Aucun champ — cliquez sur « Ajouter des champs » pour commencer</p>
        </div>
      } @else {
        <div class="border border-[#E0E0E0] dark:border-[#525252]">
          <!-- Header -->
          <div class="bg-[#F4F4F4] dark:bg-[#393939] border-b border-[#E0E0E0] dark:border-[#525252] grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-2.5">
            <p class="text-[10px] font-medium text-[#525252] uppercase tracking-wide">Nom</p>
            <p class="text-[10px] font-medium text-[#525252] uppercase tracking-wide">Label</p>
            <p class="text-[10px] font-medium text-[#525252] uppercase tracking-wide">Type</p>
            <p class="text-[10px] font-medium text-[#525252] uppercase tracking-wide">Requis</p>
            <p class="text-[10px] font-medium text-[#525252] uppercase tracking-wide hidden md:block">Défaut</p>
            <p class="text-[10px] font-medium text-[#525252] uppercase tracking-wide text-right">#</p>
          </div>
          @for (field of sortedFields(); track field.id) {
            <div class="border-b border-[#E0E0E0] dark:border-[#525252] last:border-b-0 grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 items-center hover:bg-[#F4F4F4] dark:hover:bg-[#393939] transition-colors">
              <p class="text-sm font-medium text-[#161616] dark:text-white font-mono text-xs">{{ field.name }}</p>
              <p class="text-sm text-[#525252] dark:text-[#C6C6C6]">{{ field.label }}</p>
              <span class="text-[10px] font-medium px-1.5 py-0.5 bg-[#D0E2FF] text-[#0043CE] w-fit">{{ field.type }}</span>
              <span class="text-xs text-[#525252]">{{ field.required ? 'Oui' : '—' }}</span>
              <span class="text-xs text-[#8D8D8D] hidden md:block">{{ field.defaultValue || '—' }}</span>
              <span class="text-[10px] text-[#8D8D8D] text-right tabular-nums">#{{ field.orderIndex }}</span>
            </div>
          }
        </div>
      }
    }
  `,
})
export class FormEditorComponent implements OnInit {
  readonly formStore = inject(FormStore);
  readonly projectStore = inject(ProjectStore);
  private readonly userStore = inject(UserStore);
  private readonly route = inject(ActivatedRoute);

  showCreateInline = signal(false);
  showAddInline = signal(false);

  readonly canEdit = computed(
    () => this.projectStore.selectedProject()?.status === 'DRAFT',
  );

  readonly sortedFields = computed(() =>
    [...this.formStore.fields()].sort((a, b) => a.orderIndex - b.orderIndex),
  );

  readonly createFormFg = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl(''),
  });

  newFieldsArray: Partial<FormField & { name: string; label: string; type: FieldType; required: boolean; defaultValue: string; jsonMappingKey: string }>[] = [];

  ngOnInit() {
    this.addNewFieldRow();
  }

  private projectId(): string {
    return this.route.snapshot.parent?.paramMap.get('projectId') ?? '';
  }

  toggleAddFields() {
    this.showAddInline.update((v) => !v);
    if (!this.showAddInline()) {
      this.newFieldsArray = [];
      this.addNewFieldRow();
    }
  }

  cancelAddFields() {
    this.showAddInline.set(false);
    this.newFieldsArray = [];
    this.addNewFieldRow();
  }

  addNewFieldRow() {
    this.newFieldsArray.push({
      name: '', label: '', type: 'TEXT', required: false,
      orderIndex: this.formStore.fieldCount() + this.newFieldsArray.length + 1,
      defaultValue: '', jsonMappingKey: '',
    });
  }

  removeNewField(i: number) {
    this.newFieldsArray.splice(i, 1);
    if (this.newFieldsArray.length === 0) this.addNewFieldRow();
  }

  submitCreateForm() {
    if (this.createFormFg.invalid) { this.createFormFg.markAllAsTouched(); return; }
    const { title, description } = this.createFormFg.value;
    this.formStore.createForm(
      this.projectId(),
      { title: title!, description: description ?? '', createdBy: this.userStore.currentUser() },
      () => this.showCreateInline.set(false),
    );
  }

  submitAddFields() {
    const valid = this.newFieldsArray.filter((f) => f.name && f.label);
    if (valid.length === 0) return;
    const fields = valid.map((f, idx) => ({
      name: f.name!,
      label: f.label!,
      type: f.type ?? 'TEXT' as FieldType,
      required: f.required ?? false,
      orderIndex: this.formStore.fieldCount() + idx + 1,
      defaultValue: f.defaultValue || undefined,
      jsonMappingKey: f.jsonMappingKey || undefined,
    }));
    this.formStore.addFields(this.projectId(), fields, () => this.cancelAddFields());
  }
}
