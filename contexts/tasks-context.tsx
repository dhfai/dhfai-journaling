'use client';

import { createContext, useContext, ReactNode } from 'react';
import useSWR, { mutate } from 'swr';
import { TasksService } from '@/services/tasks';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types/api';
import { toast } from 'sonner';

interface TasksContextType {
  tasks: Task[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  createTask: (data: CreateTaskRequest) => Promise<Task | null>;
  updateTask: (id: string, data: UpdateTaskRequest) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTaskById: (id: string) => Promise<Task | null>;
  refreshTasks: () => Promise<void>;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

const TASKS_KEY = '/api/tasks';

const tasksFetcher = async () => {
  try {
    const response = await TasksService.getAllTasks();
    if (response.success && response.data) {
      return response.data;
    }
    // If backend returns error, throw it
    if (!response.success && response.error) {
      throw new Error(response.error);
    }
    return [];
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export function TasksProvider({ children }: { children: ReactNode }) {
  const { data: tasks, error, isLoading } = useSWR<Task[]>(TASKS_KEY, tasksFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  });

  const createTask = async (data: CreateTaskRequest): Promise<Task | null> => {
    try {
      const response = await TasksService.createTask(data);

      if (!response.success) {
        toast.error(response.error || 'Failed to create task');
        return null;
      }

      if (!response.data) {
        return null;
      }

      const newTask = response.data;
      await mutate(TASKS_KEY, (currentTasks: Task[] = []) => [newTask, ...currentTasks], false);
      await mutate(TASKS_KEY);
      toast.success('Task created successfully');
      return newTask;
    } catch (error: any) {
      console.error('Failed to create task:', error);
      toast.error(error.message || 'Failed to create task');
      return null;
    }
  };

  const updateTask = async (id: string, data: UpdateTaskRequest): Promise<void> => {
    try {
      await mutate(
        TASKS_KEY,
        async (currentTasks: Task[] = []) => {
          return currentTasks.map((task) => {
            if (task.id === id) {
              const updated: Task = {
                ...task,
                ...data,
                // Empty string means remove deadline
                deadline: data.deadline === '' ? undefined : (data.deadline ?? task.deadline),
                updated_at: new Date().toISOString()
              };
              return updated;
            }
            return task;
          });
        },
        false
      );

      await TasksService.updateTask(id, data);
      await mutate(TASKS_KEY);
      toast.success('Task updated successfully');
    } catch (error: any) {
      console.error('Failed to update task:', error);
      await mutate(TASKS_KEY);
      toast.error(error.message || 'Failed to update task');
      throw error;
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    try {
      await mutate(
        TASKS_KEY,
        (currentTasks: Task[] = []) => currentTasks.filter((task) => task.id !== id),
        false
      );

      await TasksService.deleteTask(id);
      await mutate(TASKS_KEY);
      toast.success('Task deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      await mutate(TASKS_KEY);
      toast.error(error.message || 'Failed to delete task');
      throw error;
    }
  };

  const getTaskById = async (id: string): Promise<Task | null> => {
    try {
      const response = await TasksService.getTaskById(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch task');
      }
      return response.data || null;
    } catch (error: any) {
      console.error('Failed to fetch task:', error);
      toast.error(error.message || 'Failed to fetch task');
      return null;
    }
  };

  const refreshTasks = async (): Promise<void> => {
    await mutate(TASKS_KEY);
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        isLoading,
        error,
        createTask,
        updateTask,
        deleteTask,
        getTaskById,
        refreshTasks,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
}
