import { Component } from '@angular/core';

@Component({
  selector: 'app-card-title',
  imports: [],
  template: `<h5 class="mb-2 text-base font-semibold text-gray-800 dark:text-white/90"><ng-content /></h5>`,
})
export class CardTitleComponent {}
