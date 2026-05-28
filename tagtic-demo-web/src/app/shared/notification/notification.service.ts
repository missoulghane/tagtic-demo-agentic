import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _counter = 0;
  readonly toasts = signal<Toast[]>([]);

  success(message: string) {
    this._push('success', message);
  }

  error(message: string) {
    this._push('error', message);
  }

  info(message: string) {
    this._push('info', message);
  }

  warning(message: string) {
    this._push('warning', message);
  }

  dismiss(id: number) {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private _push(type: ToastType, message: string) {
    const id = ++this._counter;
    this.toasts.update((list) => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), 5000);
  }
}
