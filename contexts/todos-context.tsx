'use client';

import { createContext, useContext, ReactNode } from 'react';
import useSWR, { mutate } from 'swr';
import { TodosService } from '@/services/todos';
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '@/types/api';
import { toast } from 'sonner';

interface TodosContextType {
  todos: Todo[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  createTodo: (data: CreateTodoRequest) => Promise<Todo | null>;
  updateTodo: (id: string, data: UpdateTodoRequest) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string, done: boolean) => Promise<void>;
  refreshTodos: () => Promise<void>;
}

const TodosContext = createContext<TodosContextType | undefined>(undefined);

const TODOS_KEY = '/api/todos';

const todosFetcher = async () => {
  try {
    const response = await TodosService.getAllTodos();
    if (response.success && response.data) {
      return response.data;
    }
    if (!response.success && response.error) {
      throw new Error(response.error);
    }
    return [];
  } catch (error: any) {
    console.error('Error fetching todos:', error);
    throw error;
  }
};

export function TodosProvider({ children }: { children: ReactNode }) {
  const { data: todos, error, isLoading } = useSWR<Todo[]>(TODOS_KEY, todosFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  });

  const createTodo = async (data: CreateTodoRequest): Promise<Todo | null> => {
    try {
      // console.log('TodosContext: createTodo called with data:', data);
      const response = await TodosService.createTodo(data);
      // console.log('TodosContext: createTodo response:', response);

      if (!response.success) {
        toast.error(response.error || 'Failed to create todo');
        return null;
      }

      if (!response.data) {
        return null;
      }

      const newTodo = response.data;
      await mutate(TODOS_KEY, (currentTodos: Todo[] = []) => [newTodo, ...currentTodos], false);
      await mutate(TODOS_KEY);
      toast.success('Todo created successfully');
      return newTodo;
    } catch (error: any) {
      console.error('Failed to create todo:', error);
      toast.error(error.message || 'Failed to create todo');
      return null;
    }
  };

  const updateTodo = async (id: string, data: UpdateTodoRequest): Promise<void> => {
    try {
      await mutate(
        TODOS_KEY,
        async (currentTodos: Todo[] = []) => {
          return currentTodos.map((todo) => {
            if (todo.id === id) {
              const updated: Todo = {
                ...todo,
                ...data,
                due_date: data.due_date === '' ? undefined : (data.due_date ?? todo.due_date),
                updated_at: new Date().toISOString()
              };
              return updated;
            }
            return todo;
          });
        },
        false
      );

      await TodosService.updateTodo(id, data);
      await mutate(TODOS_KEY);
      toast.success('Todo updated successfully');
    } catch (error: any) {
      console.error('Failed to update todo:', error);
      await mutate(TODOS_KEY);
      toast.error(error.message || 'Failed to update todo');
      throw error;
    }
  };

  const toggleTodo = async (id: string, done: boolean): Promise<void> => {
    try {
      await mutate(
        TODOS_KEY,
        (currentTodos: Todo[] = []) => {
          return currentTodos.map((todo) =>
            todo.id === id ? { ...todo, done, updated_at: new Date().toISOString() } : todo
          );
        },
        false
      );

      await TodosService.updateTodo(id, { done });
      await mutate(TODOS_KEY);
    } catch (error: any) {
      console.error('Failed to toggle todo:', error);
      await mutate(TODOS_KEY);
      toast.error(error.message || 'Failed to toggle todo');
      throw error;
    }
  };

  const deleteTodo = async (id: string): Promise<void> => {
    try {
      await mutate(
        TODOS_KEY,
        (currentTodos: Todo[] = []) => currentTodos.filter((todo) => todo.id !== id),
        false
      );

      await TodosService.deleteTodo(id);
      await mutate(TODOS_KEY);
      toast.success('Todo deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete todo:', error);
      await mutate(TODOS_KEY);
      toast.error(error.message || 'Failed to delete todo');
      throw error;
    }
  };

  const refreshTodos = async (): Promise<void> => {
    await mutate(TODOS_KEY);
  };

  return (
    <TodosContext.Provider
      value={{
        todos,
        isLoading,
        error,
        createTodo,
        updateTodo,
        deleteTodo,
        toggleTodo,
        refreshTodos,
      }}
    >
      {children}
    </TodosContext.Provider>
  );
}

export function useTodos() {
  const context = useContext(TodosContext);
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodosProvider');
  }
  return context;
}
