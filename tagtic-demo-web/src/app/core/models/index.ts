export type ProjectStatus = 'DRAFT' | 'READY' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
export type AnnotationStatus = 'PENDING' | 'VALIDATED' | 'REJECTED';
export type FieldType = 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'SELECT';

export interface AnnotationProject {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnnotationForm {
  id: string;
  projectId: string;
  title: string;
  description: string;
  version: number;
  createdBy: string;
  createdAt: string;
}

export interface FormField {
  id: string;
  formId: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  orderIndex: number;
  defaultValue?: string;
  jsonMappingKey?: string;
  validationRules?: Record<string, unknown>;
}

export interface ProjectImage {
  id: string;
  projectId: string;
  s3Bucket: string;
  s3Key: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AnnotationFieldValue {
  id: string;
  formFieldId: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: FieldType;
  value: string;
  autoFilled: boolean;
  sourceMetadataKey?: string;
}

export interface Annotation {
  id: string;
  projectId: string;
  imageId: string;
  annotatedBy: string;
  annotatedAt: string;
  status: AnnotationStatus;
  fields?: AnnotationFieldValue[];
}

export interface PrefilledField {
  formFieldId: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  value: string | null;
  autoFilled: boolean;
  options?: string[];
  defaultValue?: string;
  validationRules?: Record<string, unknown>;
}

export interface PrefilledAnnotationForm {
  imageId: string;
  fields: PrefilledField[];
}

/* ---- Request DTOs ---- */

export interface CreateProjectRequest {
  title: string;
  description: string;
  createdBy: string;
}

export interface UpdateProjectRequest {
  title: string;
  description: string;
}

export interface ChangeStatusRequest {
  status: ProjectStatus;
}

export interface CreateFormRequest {
  title: string;
  description: string;
  createdBy: string;
}

export interface AddFieldsRequest {
  fields: Omit<FormField, 'id' | 'formId'>[];
}

export interface AddImageRequest {
  s3Bucket: string;
  s3Key: string;
  metadata: Record<string, unknown>;
}

export interface SaveAnnotationRequest {
  annotatedBy: string;
  fields: { formFieldId: string; value: string }[];
}

/* ---- API envelope ---- */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/* ---- Pagination ---- */

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
