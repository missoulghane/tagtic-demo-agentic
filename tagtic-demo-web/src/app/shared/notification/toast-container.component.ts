import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { NotificationService, Toast } from './notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80">
      @for (toast of notify.toasts(); track toast.id) {
        <div
          class="flex items-stretch border bg-white text-sm"
          [ngClass]="containerClass(toast)"
          role="alert"
        >
          <div class="flex-1 px-4 py-3 flex items-start gap-3">
            <span [innerHTML]="icon(toast)" class="shrink-0 mt-0.5 w-4 h-4"></span>
            <span class="flex-1 leading-snug text-[13px]">{{ toast.message }}</span>
          </div>
          <button
            (click)="notify.dismiss(toast.id)"
            class="w-10 flex items-center justify-center text-current opacity-50 hover:opacity-100 border-l border-current/20 shrink-0"
            aria-label="Fermer"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly notify = inject(NotificationService);

  containerClass(toast: Toast): string {
    const map: Record<string, string> = {
      success: 'border-l-4 border-l-[#198038] border-[#DEFBE6] text-[#198038] bg-[#F2FBF4]',
      error:   'border-l-4 border-l-[#DA1E28] border-[#FFF1F1] text-[#DA1E28] bg-[#FFF1F1]',
      info:    'border-l-4 border-l-[#0F62FE] border-[#EDF5FF] text-[#0043CE] bg-[#EDF5FF]',
      warning: 'border-l-4 border-l-[#B28600] border-[#FCF4D6] text-[#B28600] bg-[#FCF4D6]',
    };
    return map[toast.type] ?? map['info'];
  }

  icon(toast: Toast): string {
    const map: Record<string, string> = {
      success: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`,
      error:   `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>`,
      info:    `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`,
      warning: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,
    };
    return map[toast.type] ?? map['info'];
  }
}
