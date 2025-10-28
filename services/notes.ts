import { apiClient } from '@/lib/api-client';
import {
  ApiResponse,
  Note,
  Block,
  CreateNoteRequest,
  UpdateNoteRequest,
  CreateBlockRequest,
  UpdateBlockRequest,
  ReorderBlocksRequest,
} from '@/types/api';

export class NotesService {
  private static readonly BASE_PATH = '/notes';

  static async createNote(data: CreateNoteRequest): Promise<ApiResponse<Note>> {
    return await apiClient.post<Note>(this.BASE_PATH, data, true);
  }

  static async getAllNotes(): Promise<ApiResponse<Note[]>> {
    return await apiClient.get<Note[]>(this.BASE_PATH, true);
  }

  static async getNoteById(id: string): Promise<ApiResponse<Note>> {
    return await apiClient.get<Note>(`${this.BASE_PATH}/${id}`, true);
  }

  static async updateNote(id: string, data: UpdateNoteRequest): Promise<ApiResponse<{ message: string }>> {
    return await apiClient.patch<{ message: string }>(`${this.BASE_PATH}/${id}`, data, true);
  }

  static async deleteNote(id: string): Promise<ApiResponse<{ message: string }>> {
    return await apiClient.delete<{ message: string }>(`${this.BASE_PATH}/${id}`, true);
  }

  static async addBlock(noteId: string, data: CreateBlockRequest): Promise<ApiResponse<Block>> {
    return await apiClient.post<Block>(`${this.BASE_PATH}/${noteId}/blocks`, data, true);
  }

  static async updateBlock(
    noteId: string,
    blockId: string,
    data: UpdateBlockRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return await apiClient.patch<{ message: string }>(
      `${this.BASE_PATH}/${noteId}/blocks/${blockId}`,
      data,
      true
    );
  }

  static async deleteBlock(
    noteId: string,
    blockId: string
  ): Promise<ApiResponse<{ message: string }>> {
    return await apiClient.delete<{ message: string }>(
      `${this.BASE_PATH}/${noteId}/blocks/${blockId}`,
      true
    );
  }

  static async reorderBlocks(
    noteId: string,
    data: ReorderBlocksRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return await apiClient.patch<{ message: string }>(
      `${this.BASE_PATH}/${noteId}/blocks/order`,
      data,
      true
    );
  }
}
