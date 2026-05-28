import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        (click)="onBackdrop($event)"
      >
        <div
          class="bg-white dark:bg-boxdark rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto"
          [style.max-width]="maxWidth()"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-stroke dark:border-strokedark">
            <h3 class="text-lg font-semibold text-black dark:text-white">{{ title() }}</h3>
            <button
              (click)="closed.emit()"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Fermer"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <!-- Body -->
          <div class="px-6 py-5">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  open = input<boolean>(false);
  title = input<string>('');
  maxWidth = input<string>('540px');
  closed = output<void>();

  onBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }
}
