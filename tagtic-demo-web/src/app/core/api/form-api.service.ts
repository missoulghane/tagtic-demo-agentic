import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AnnotationForm, FormField, CreateFormRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class FormApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/projects`;

  createForm(projectId: string, req: CreateFormRequest): Observable<AnnotationForm> {
    return this.http.post<AnnotationForm>(`${this.base}/${projectId}/form`, req);
  }

  getForm(projectId: string): Observable<AnnotationForm> {
    return this.http.get<AnnotationForm>(`${this.base}/${projectId}/form`);
  }

  addFields(projectId: string, fields: Omit<FormField, 'id' | 'formId'>[]): Observable<FormField[]> {
    return this.http.post<FormField[]>(`${this.base}/${projectId}/form/fields`, fields);
  }

  listFields(projectId: string): Observable<FormField[]> {
    return this.http.get<FormField[]>(`${this.base}/${projectId}/form/fields`);
  }
}
