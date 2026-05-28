import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { HeaderComponent } from './header.component';
import { ToastContainerComponent } from '../shared/notification/toast-container.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, ToastContainerComponent],
  template: `
    <app-sidebar [open]="sidebarOpen()" (closeRequested)="sidebarOpen.set(false)" />

    <div class="lg:ml-64 min-h-screen bg-[#F4F4F4] dark:bg-[#161616]">
      <app-header (menuToggled)="sidebarOpen.update(v => !v)" />

      <main class="px-6 pt-12 pb-8 md:px-8">
        <router-outlet />
      </main>
    </div>

    <app-toast-container />
  `,
})
export class LayoutComponent {
  sidebarOpen = signal(true);
}
