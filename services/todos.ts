import { apiClient } from '@/lib/api-client';
import type { Todo, CreateTodoRequest, UpdateTodoRequest, ApiResponse } from '@/types/api';

export class TodosService {
  private static readonly BASE_PATH = '/todos';

  static async createTodo(data: CreateTodoRequest): Promise<ApiResponse<Todo>> {
    return await apiClient.post<Todo>(this.BASE_PATH, data, true);
  }

  static async getAllTodos(): Promise<ApiResponse<Todo[]>> {
    return await apiClient.get<Todo[]>(this.BASE_PATH, true);
  }

  static async updateTodo(id: string, data: UpdateTodoRequest): Promise<ApiResponse<{ message: string }>> {
    return await apiClient.patch<{ message: string }>(`${this.BASE_PATH}/${id}`, data, true);
  }

  static async deleteTodo(id: string): Promise<ApiResponse<{ message: string }>> {
    return await apiClient.delete<{ message: string }>(`${this.BASE_PATH}/${id}`, true);
  }
}
