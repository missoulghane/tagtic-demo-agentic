import {
  Component,
  input,
  output,
  OnChanges,
  SimpleChanges,
  inject,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { PrefilledField } from '../../core/models';

declare const flatpickr: (el: HTMLElement, opts: Record<string, unknown>) => { destroy(): void };

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    @if (form) {
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
        @for (field of fields(); track field.formFieldId) {
          <div>
            <label class="flex items-center gap-2 text-xs font-medium text-[#161616] dark:text-white mb-1.5">
              {{ field.label }}
              @if (field.required) { <span class="text-[#DA1E28]">*</span> }
              @if (field.autoFilled) {
                <span class="text-[10px] font-medium px-1.5 py-0.5 bg-[#D0E2FF] text-[#0043CE]" title="Rempli automatiquement depuis les métadonnées">
                  auto
                </span>
              }
            </label>

            @switch (field.type) {
              @case ('BOOLEAN') {
                <label class="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    [formControlName]="field.formFieldId"
                    class="w-4 h-4 border-[#8D8D8D] text-primary"
                  />
                  <span class="text-sm text-[#525252] dark:text-[#C6C6C6]">{{ field.label }}</span>
                </label>
              }
              @case ('SELECT') {
                <select
                  [formControlName]="field.formFieldId"
                  class="cds-field text-sm w-full"
                >
                  <option value="">— Sélectionner —</option>
                  @for (opt of field.options ?? []; track opt) {
                    <option [value]="opt">{{ opt }}</option>
                  }
                </select>
              }
              @case ('DATE') {
                <input
                  type="text"
                  [id]="'fp-' + field.formFieldId"
                  [formControlName]="field.formFieldId"
                  placeholder="AAAA-MM-JJ"
                  class="cds-field text-sm w-full"
                  readonly
                />
              }
              @case ('NUMBER') {
                <input
                  type="number"
                  [formControlName]="field.formFieldId"
                  class="cds-field text-sm w-full"
                />
              }
              @default {
                <input
                  type="text"
                  [formControlName]="field.formFieldId"
                  class="cds-field text-sm w-full"
                />
              }
            }

            @if (form.get(field.formFieldId)?.invalid && form.get(field.formFieldId)?.touched) {
              <p class="mt-1.5 text-xs text-[#DA1E28] flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                Ce champ est requis
              </p>
            }
          </div>
        }

        <div class="pt-3 border-t border-[#E0E0E0] dark:border-[#525252]">
          <button
            type="submit"
            [disabled]="saving()"
            class="btn-primary w-full"
          >
            @if (saving()) {
              <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Enregistrement…
            } @else {
              {{ submitLabel() }}
            }
          </button>
        </div>
      </form>
    }
  `,
})
export class DynamicFormComponent implements OnChanges, AfterViewInit, OnDestroy {
  private readonly elRef = inject(ElementRef);

  fields = input<PrefilledField[]>([]);
  saving = input<boolean>(false);
  submitLabel = input<string>('Enregistrer');
  submitted = output<Record<string, string>>();

  form!: FormGroup;
  private fpInstances: { destroy(): void }[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['fields']) {
      this._buildForm();
    }
  }

  ngAfterViewInit() {
    this._initFlatpickr();
  }

  ngOnDestroy() {
    this.fpInstances.forEach((fp) => fp.destroy());
  }

  private _buildForm() {
    const controls: Record<string, AbstractControl> = {};
    for (const field of this.fields()) {
      const validators = field.required ? [Validators.required] : [];
      const initial = field.value ?? field.defaultValue ?? (field.type === 'BOOLEAN' ? 'false' : '');
      controls[field.formFieldId] = new FormControl(
        field.type === 'BOOLEAN' ? initial === 'true' : initial,
        validators,
      );
    }
    this.form = new FormGroup(controls);
  }

  private _initFlatpickr() {
    this.fpInstances.forEach((fp) => fp.destroy());
    this.fpInstances = [];

    for (const field of this.fields()) {
      if (field.type !== 'DATE') continue;
      const el: HTMLElement | null = this.elRef.nativeElement.querySelector(
        `#fp-${field.formFieldId}`,
      );
      if (!el) continue;
      try {
        const fp = flatpickr(el, { dateFormat: 'Y-m-d', allowInput: true });
        this.fpInstances.push(fp);
      } catch {
        /* flatpickr may not be available */
      }
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.value as Record<string, unknown>;
    const result: Record<string, string> = {};
    for (const [key, val] of Object.entries(raw)) {
      result[key] = String(val ?? '');
    }
    this.submitted.emit(result);
  }
}
