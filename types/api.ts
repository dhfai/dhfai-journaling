export interface User {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  is_verified: boolean;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name?: string;
  bio?: string;
  avatar?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | string;
  phone_number?: string;
  country?: string;
  city?: string;
  timezone?: string;
  language?: string;
  theme?: 'light' | 'dark' | 'system' | string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  status?: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

export interface OtpRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ProfileUpdateRequest {
  full_name?: string;
  bio?: string;
  avatar?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | string;
  phone_number?: string;
  country?: string;
  city?: string;
  timezone?: string;
  language?: string;
  theme?: 'light' | 'dark' | 'system' | string;
}

export interface ProfileResponse {
  user: User;
  profile: Profile;
}

export interface TodoItemInBlock {
  id: string;
  text: string;
  done: boolean;
}

export interface Block {
  id: string;
  type: 'paragraph' | 'heading' | 'todo';
  order: number;
  content_md?: string;
  items?: TodoItemInBlock[];
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  blocks: Block[];
  tags: string[];
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteRequest {
  title: string;
  tags?: string[];
}

export interface UpdateNoteRequest {
  title?: string;
  tags?: string[];
  is_pinned?: boolean;
}

export interface CreateBlockRequest {
  type: 'paragraph' | 'heading' | 'todo';
  content_md?: string;
  items?: TodoItemInBlock[];
}

export interface UpdateBlockRequest {
  content_md?: string;
  items?: TodoItemInBlock[];
}

export interface ReorderBlocksRequest {
  order: string[];
}

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  done: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoRequest {
  title: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  done?: boolean;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string | null;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description_md?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description_md?: string;
  priority?: 'low' | 'medium' | 'high';
  deadline?: string;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description_md?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  deadline?: string | null;
  tags?: string[];
}

// Error types for better error handling
export interface ApiError {
  success: false;
  error: string;
  status?: number;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;
