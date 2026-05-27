import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq-item-one',
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <button
        class="flex w-full items-center justify-between p-5 text-left text-base font-medium text-gray-800 dark:text-white/90"
        (click)="toggleAccordion()"
      >
        {{ title }}
        <svg
          class="size-5 shrink-0 transition-transform"
          [class.rotate-180]="isOpen"
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      @if (isOpen) {
        <div class="border-t border-gray-200 px-5 pb-5 pt-4 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-400">
          {{ content }}
        </div>
      }
    </div>
  `,
})
export class FaqItemOneComponent {
  @Input() title: string = '';
  @Input() content: string = '';
  @Input() isOpen: boolean = false;
  @Input() toggleAccordion: () => void = () => {};
}
