import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { map, catchError, throwError } from 'rxjs';
import { ApiError, ApiResponse } from '../models';
import { NotificationService } from '../../shared/notification/notification.service';

export const apiResponseInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);

  return next(req).pipe(
    map((event) => {
      if (event instanceof HttpResponse) {
        const body = event.body as ApiResponse<unknown>;
        if (body && typeof body === 'object' && 'success' in body) {
          if (body.success) {
            return event.clone({ body: body.data });
          } else {
            const err = body.error;
            throw new ApiError(err?.code ?? 'UNKNOWN', err?.message ?? 'Une erreur est survenue');
          }
        }
      }
      return event;
    }),
    catchError((err) => {
      if (err instanceof ApiError) {
        notify.error(err.message);
        return throwError(() => err);
      }
      // 404 = ressource absente, état métier valide — pas de toast
      if (err?.status === 404) {
        return throwError(() => err);
      }
      const message = err?.message ?? 'Erreur réseau';
      notify.error(message);
      return throwError(() => err);
    }),
  );
};
