import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserStore } from '../core/state/user.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule],
  template: `
    <header class="fixed top-0 right-0 left-0 lg:left-64 z-30 h-12 bg-white border-b border-[#E0E0E0] flex items-center">
      <div class="flex items-center justify-between w-full px-4">

        <!-- Burger (mobile) -->
        <button
          (click)="menuToggled.emit()"
          class="w-8 h-8 flex items-center justify-center text-[#525252] hover:bg-[#E8E8E8] hover:text-[#161616] lg:hidden"
          aria-label="Menu"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <div class="flex-1 lg:hidden"></div>

        <!-- User zone -->
        <div class="flex items-center">
          @if (!editing()) {
            <button
              (click)="startEdit()"
              class="flex items-center gap-2 h-12 px-3 text-sm text-[#525252] hover:bg-[#F4F4F4] hover:text-[#161616] transition-colors"
              title="Changer d'utilisateur"
            >
              <span class="w-6 h-6 bg-primary text-white text-[10px] font-semibold flex items-center justify-center shrink-0 select-none">
                {{ initial() }}
              </span>
              <span class="hidden md:block text-sm text-[#161616]">{{ userStore.currentUser() }}</span>
              <svg class="w-3 h-3 text-[#8D8D8D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
            </button>
          } @else {
            <form (ngSubmit)="confirmEdit()" class="flex items-center gap-1.5 px-2">
              <input
                [(ngModel)]="editValue"
                name="user"
                class="cds-field h-8 w-36 text-sm"
                placeholder="Votre nom"
                (keydown.escape)="cancelEdit()"
                autofocus
              />
              <button type="submit" class="btn-primary" style="padding: 0.25rem 0.75rem; font-size: 12px;">OK</button>
              <button type="button" (click)="cancelEdit()" class="btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 12px;">✕</button>
            </form>
          }
        </div>

      </div>
    </header>
  `,
})
export class HeaderComponent {
  readonly userStore = inject(UserStore);
  menuToggled = output<void>();

  editing = signal(false);
  editValue = '';

  initial() {
    return (this.userStore.currentUser()[0] ?? 'U').toUpperCase();
  }

  startEdit() {
    this.editValue = this.userStore.currentUser();
    this.editing.set(true);
  }

  confirmEdit() {
    if (this.editValue.trim()) {
      this.userStore.setCurrentUser(this.editValue);
    }
    this.editing.set(false);
  }

  cancelEdit() {
    this.editing.set(false);
  }
}
