import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AnnotationProject,
  CreateProjectRequest,
  UpdateProjectRequest,
  ChangeStatusRequest,
  ProjectStatus,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ProjectApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/projects`;

  list(): Observable<AnnotationProject[]> {
    return this.http.get<AnnotationProject[]>(this.base);
  }

  get(id: string): Observable<AnnotationProject> {
    return this.http.get<AnnotationProject>(`${this.base}/${id}`);
  }

  create(req: CreateProjectRequest): Observable<AnnotationProject> {
    return this.http.post<AnnotationProject>(this.base, req);
  }

  update(id: string, req: UpdateProjectRequest): Observable<AnnotationProject> {
    return this.http.put<AnnotationProject>(`${this.base}/${id}`, req);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  changeStatus(id: string, status: ProjectStatus): Observable<AnnotationProject> {
    const req: ChangeStatusRequest = { status };
    return this.http.patch<AnnotationProject>(`${this.base}/${id}/status`, req);
  }
}
