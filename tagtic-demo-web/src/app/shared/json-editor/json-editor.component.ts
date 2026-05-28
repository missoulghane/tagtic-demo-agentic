import { Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-json-editor',
  standalone: true,
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JsonEditorComponent),
      multi: true,
    },
  ],
  template: `
    <div>
      <textarea
        [(ngModel)]="rawValue"
        (ngModelChange)="onTextChange($event)"
        [class.border-red-400]="error()"
        rows="6"
        class="w-full font-mono text-sm border border-stroke rounded px-3 py-2 focus:outline-none focus:border-primary dark:bg-boxdark dark:border-strokedark resize-y"
        placeholder="{}"
        [disabled]="disabled"
      ></textarea>
      @if (error()) {
        <p class="mt-1 text-xs text-red-600">JSON invalide : {{ error() }}</p>
      }
    </div>
  `,
})
export class JsonEditorComponent implements ControlValueAccessor {
  rawValue = '{}';
  error = signal<string | null>(null);
  disabled = false;

  private onChange: (v: Record<string, unknown>) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(obj: Record<string, unknown>): void {
    this.rawValue = obj ? JSON.stringify(obj, null, 2) : '{}';
    this.error.set(null);
  }

  registerOnChange(fn: (v: Record<string, unknown>) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onTextChange(value: string) {
    try {
      const parsed = JSON.parse(value);
      this.error.set(null);
      this.onChange(parsed);
    } catch (e: unknown) {
      this.error.set((e as Error).message);
    }
    this.onTouched();
  }
}
