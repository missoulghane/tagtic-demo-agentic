import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside
      class="sidebar fixed left-0 top-0 z-40 h-screen w-64 bg-[#161616] flex flex-col"
      [class.-translate-x-full]="!open()"
    >
      <!-- Brand -->
      <div class="flex items-center justify-between px-4 h-12 border-b border-[#393939] shrink-0">
        <a routerLink="/dashboard" class="flex items-center gap-3">
          <div class="w-6 h-6 bg-primary flex items-center justify-center shrink-0">
            <svg viewBox="0 0 16 16" fill="white" class="w-3.5 h-3.5">
              <rect x="1" y="1" width="6" height="6"/>
              <rect x="9" y="1" width="6" height="6"/>
              <rect x="1" y="9" width="6" height="6"/>
              <rect x="9" y="9" width="6" height="6"/>
            </svg>
          </div>
          <div>
            <span class="text-sm font-semibold text-white tracking-widest">TAGTIC</span>
            <span class="block text-[10px] text-[#8D8D8D] -mt-0.5 leading-none">Annotation Platform</span>
          </div>
        </a>
        <button
          (click)="closeRequested.emit()"
          class="w-8 h-8 flex items-center justify-center text-[#8D8D8D] hover:text-white hover:bg-[#353535] lg:hidden"
          aria-label="Fermer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto py-3">
        <p class="px-4 mb-1 text-[10px] font-medium text-[#6F6F6F] uppercase tracking-[0.12em]">
          Navigation
        </p>
        @for (item of navItems; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="border-l-[3px] border-primary bg-[#353535] text-white"
            [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }"
            class="flex items-center gap-3 h-10 pl-[13px] pr-4 border-l-[3px] border-transparent text-[#C6C6C6] hover:bg-[#262626] hover:text-white transition-colors text-sm"
          >
            <span class="w-4 h-4 shrink-0" [innerHTML]="item.icon"></span>
            {{ item.label }}
          </a>
        }
      </nav>

      <!-- Footer -->
      <div class="px-4 py-3 border-t border-[#393939] shrink-0">
        <p class="text-[10px] text-[#6F6F6F] font-mono">v1.0.0-demo</p>
      </div>
    </aside>

    <!-- Backdrop mobile -->
    @if (open()) {
      <div
        class="fixed inset-0 z-30 bg-black/50 lg:hidden"
        (click)="closeRequested.emit()"
      ></div>
    }
  `,
})
export class SidebarComponent {
  open = input<boolean>(true);
  closeRequested = output<void>();

  readonly navItems: NavItem[] = [
    {
      label: 'Tableau de bord',
      path: '/dashboard',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z"/></svg>`,
    },
    {
      label: 'Projets',
      path: '/projects',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>`,
    },
  ];
}
