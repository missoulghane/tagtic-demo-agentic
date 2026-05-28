import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, filter, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProjectImage, Page } from '../models';

@Injectable({ providedIn: 'root' })
export class ImageApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/projects`;

  upload(projectId: string, file: File): Observable<ProjectImage> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<ProjectImage>(`${this.base}/${projectId}/images/upload`, formData);
  }

  list(projectId: string, page = 0, size = 10): Observable<Page<ProjectImage>> {
    return this.http.get<Page<ProjectImage>>(
      `${this.base}/${projectId}/images?page=${page}&size=${size}`,
    );
  }

  get(imageId: string): Observable<ProjectImage> {
    return this.http.get<ProjectImage>(`${environment.apiBaseUrl}/images/${imageId}`);
  }

  getContent(imageId: string): Observable<Blob> {
    return this.http.get(`${environment.apiBaseUrl}/images/${imageId}/content`, {
      responseType: 'blob',
    });
  }
}
