export interface User {
  id: string;
  email: string;
  name: string;
  roleId: string;
}

export interface Camera {
  id: string;
  name: string;
  ip: string;
  location?: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  nombre: string;
}

export interface Task {
  id: string;
  nombre: string;
  fechaInicio: string;
  horasEstimadas: number;
  userId: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
