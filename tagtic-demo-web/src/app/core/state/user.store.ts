import { Injectable, signal, effect } from '@angular/core';

const STORAGE_KEY = 'tagtic_current_user';

@Injectable({ providedIn: 'root' })
export class UserStore {
  readonly currentUser = signal<string>(localStorage.getItem(STORAGE_KEY) ?? 'Utilisateur');

  constructor() {
    effect(() => {
      localStorage.setItem(STORAGE_KEY, this.currentUser());
    });
  }

  setCurrentUser(name: string) {
    this.currentUser.set(name.trim() || 'Utilisateur');
  }
}
