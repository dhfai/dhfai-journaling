'use client';

import { useState } from 'react';
import { useTasks } from '@/contexts/tasks-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Calendar } from 'lucide-react';
import Link from 'next/link';
import type { Task } from '@/types/api';

const priorityColors = {
  low: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
  high: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
};

const statusLabels = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export default function TasksPage() {
  const { tasks, isLoading, createTask, error } = useTasks();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const filteredTasks = tasks?.filter((task) => {
    const query = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(query) ||
      task.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const tasksByStatus = {
    todo: filteredTasks?.filter((task) => task.status === 'todo') || [],
    in_progress: filteredTasks?.filter((task) => task.status === 'in_progress') || [],
    done: filteredTasks?.filter((task) => task.status === 'done') || [],
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;

    setIsCreating(true);
    try {
      await createTask({ title: newTaskTitle.trim() });
      setNewTaskTitle('');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage your complex tasks with status tracking</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks by title or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="New task title..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateTask();
            }}
            className="w-64"
          />
          <Button onClick={handleCreateTask} disabled={isCreating || !newTaskTitle.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-24 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <p className="text-destructive font-semibold">Failed to load tasks</p>
            <p className="text-sm text-muted-foreground max-w-md">
              {error.message || 'An error occurred while fetching tasks'}
            </p>
            {error.message?.includes('deadline') && (
              <p className="text-xs text-amber-600 max-w-md">
                💡 Tip: There might be invalid data in your database. Try clearing all tasks from the backend or fix the deadline field format.
              </p>
            )}
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['todo', 'in_progress', 'done'] as const).map((status) => (
            <Card key={status} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{statusLabels[status]}</CardTitle>
                <CardDescription>{tasksByStatus[status].length} tasks</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                {tasksByStatus[status].length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No tasks</p>
                ) : (
                  tasksByStatus[status].map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Link href={`/dashboard/tasks/${task.id}`}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardHeader className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm line-clamp-2">{task.title}</h3>
            <Badge className={priorityColors[task.priority]} variant="secondary">
              {task.priority}
            </Badge>
          </div>
          {task.description_md && (
            <p className="text-xs text-muted-foreground line-clamp-2">{task.description_md}</p>
          )}
          {task.deadline && (
            <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
              <Calendar className="h-3 w-3" />
              {formatDate(task.deadline)}
            </div>
          )}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
      </Card>
    </Link>
  );
}
