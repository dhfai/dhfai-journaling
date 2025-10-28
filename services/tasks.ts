import { apiClient } from '@/lib/api-client';
import type { Task, CreateTaskRequest, UpdateTaskRequest, ApiResponse } from '@/types/api';

export class TasksService {
  private static readonly BASE_PATH = '/tasks';

  static async createTask(data: CreateTaskRequest): Promise<ApiResponse<Task>> {
    return await apiClient.post<Task>(this.BASE_PATH, data, true);
  }

  static async getAllTasks(): Promise<ApiResponse<Task[]>> {
    return await apiClient.get<Task[]>(this.BASE_PATH, true);
  }

  static async getTaskById(id: string): Promise<ApiResponse<Task>> {
    return await apiClient.get<Task>(`${this.BASE_PATH}/${id}`, true);
  }

  static async updateTask(id: string, data: UpdateTaskRequest): Promise<ApiResponse<{ message: string }>> {
    return await apiClient.patch<{ message: string }>(`${this.BASE_PATH}/${id}`, data, true);
  }

  static async deleteTask(id: string): Promise<ApiResponse<{ message: string }>> {
    return await apiClient.delete<{ message: string }>(`${this.BASE_PATH}/${id}`, true);
  }
}
