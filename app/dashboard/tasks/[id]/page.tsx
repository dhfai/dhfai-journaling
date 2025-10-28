'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTasks } from '@/contexts/tasks-context';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Trash2, X, Calendar } from 'lucide-react';
import type { Task } from '@/types/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getTaskById, updateTask, deleteTask } = useTasks();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    loadTask();
  }, [params.id]);

  const loadTask = async () => {
    setIsLoading(true);
    const taskData = await getTaskById(params.id as string);
    if (taskData) {
      setTask(taskData);
      setEditedTitle(taskData.title);
      setEditedDescription(taskData.description_md || '');
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!task) return;
    setIsSaving(true);
    try {
      await updateTask(task.id, {
        title: editedTitle,
        description_md: editedDescription,
      });
      setTask({ ...task, title: editedTitle, description_md: editedDescription });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (status: 'todo' | 'in_progress' | 'done') => {
    if (!task) return;
    await updateTask(task.id, { status });
    setTask({ ...task, status });
  };

  const handlePriorityChange = async (priority: 'low' | 'medium' | 'high') => {
    if (!task) return;
    await updateTask(task.id, { priority });
    setTask({ ...task, priority });
  };

  const handleDeadlineChange = async (deadline: string) => {
    if (!task) return;

    // Convert YYYY-MM-DD to ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
    let formattedDeadline = '';
    if (deadline) {
      formattedDeadline = `${deadline}T00:00:00Z`;
    }

    await updateTask(task.id, { deadline: formattedDeadline });
    setTask({ ...task, deadline: formattedDeadline || undefined });
  };

  const handleAddTag = async () => {
    if (!task || !newTag.trim()) return;
    const updatedTags = [...task.tags, newTag.trim()];
    await updateTask(task.id, { tags: updatedTags });
    setTask({ ...task, tags: updatedTags });
    setNewTag('');
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!task) return;
    const updatedTags = task.tags.filter((tag) => tag !== tagToRemove);
    await updateTask(task.id, { tags: updatedTags });
    setTask({ ...task, tags: updatedTags });
  };

  const handleDelete = async () => {
    if (!task || !confirm('Are you sure you want to delete this task?')) return;
    await deleteTask(task.id);
    router.push('/dashboard/tasks');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-10 w-full max-w-2xl" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-muted-foreground">Task not found</p>
        <Button onClick={() => router.push('/dashboard/tasks')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/dashboard/tasks')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Task
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-2xl font-bold"
                placeholder="Task title..."
              />
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isSaving || !editedTitle.trim()}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold cursor-pointer hover:text-muted-foreground" onClick={() => setIsEditing(true)}>
                {task.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Select value={task.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Priority:</span>
                  <Select value={task.priority} onValueChange={handlePriorityChange}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleDeadlineChange(e.target.value)}
                    className="w-40"
                  />
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Description</h3>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )}
            </div>
            {isEditing ? (
              <Textarea
                value={editedDescription}
                onChange={(e: any) => setEditedDescription(e.target.value)}
                placeholder="Write task description in markdown..."
                className="min-h-64 font-mono text-sm"
              />
            ) : task.description_md ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{task.description_md}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No description</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {task.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTag();
                }}
                className="max-w-xs"
              />
              <Button onClick={handleAddTag} disabled={!newTag.trim()}>
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
