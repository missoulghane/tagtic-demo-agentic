import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-sidebar-history',
  imports: [CommonModule],
  template: `
    <aside
      class="fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l border-gray-200 bg-white transition-transform duration-300 dark:border-gray-800 dark:bg-gray-900 xl:relative xl:inset-y-auto xl:right-auto xl:translate-x-0"
      [class.-translate-x-full]="!isSidebarOpen"
      [class.translate-x-0]="isSidebarOpen"
    >
      <div class="flex items-center justify-between border-b border-gray-200 p-5 dark:border-gray-800">
        <h4 class="text-base font-semibold text-gray-800 dark:text-white/90">Chats History</h4>
        <button (click)="closeSidebar.emit()" class="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">No history yet.</p>
      </div>
    </aside>
  `,
})
export class AiSidebarHistoryComponent {
  @Input() isSidebarOpen: boolean = true;
  @Output() closeSidebar = new EventEmitter<void>();
}
