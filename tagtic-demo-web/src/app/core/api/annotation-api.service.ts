import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Annotation, PrefilledAnnotationForm, SaveAnnotationRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class AnnotationApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/projects`;

  getPrefilledForm(projectId: string, imageId: string): Observable<PrefilledAnnotationForm> {
    return this.http.get<PrefilledAnnotationForm>(
      `${this.base}/${projectId}/images/${imageId}/annotation-form`,
    );
  }

  save(projectId: string, imageId: string, req: SaveAnnotationRequest): Observable<Annotation> {
    return this.http.post<Annotation>(
      `${this.base}/${projectId}/images/${imageId}/annotations`,
      req,
    );
  }

  listByProject(projectId: string): Observable<Annotation[]> {
    return this.http.get<Annotation[]>(`${this.base}/${projectId}/annotations`);
  }

  getByImage(projectId: string, imageId: string): Observable<Annotation | null> {
    return this.http.get<Annotation>(
      `${this.base}/${projectId}/images/${imageId}/annotation`,
    ).pipe(
      catchError((err) => {
        if (err?.status === 404) return of(null);
        throw err;
      }),
    );
  }
}
