'use client';

import { useState } from 'react';
import { useTasks } from '@/contexts/tasks-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Calendar, AlertTriangle, X, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Task } from '@/types/api';
import { cn } from '@/lib/utils';

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
  const { tasks, isLoading, createTask, updateTask, deleteTask, error } = useTasks();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [mobileTab, setMobileTab] = useState<'todo' | 'in_progress' | 'done'>('todo');


  const [editForm, setEditForm] = useState({
    title: '',
    description_md: '',
    status: 'todo' as Task['status'],
    priority: 'medium' as Task['priority'],
    deadline: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');


  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };


  const convertToISODate = (dateString: string): string => {
    if (!dateString) return new Date().toISOString();

    const date = new Date(dateString + 'T00:00:00');
    return date.toISOString();
  };


  const convertFromISODate = (isoString: string): string => {
    if (!isoString) return getTodayDate();
    const date = new Date(isoString);
    return date.toISOString().split('T')[0];
  };

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
      await createTask({
        title: newTaskTitle.trim(),
        deadline: convertToISODate(getTodayDate()),
      });
      setNewTaskTitle('');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenTask = (task: Task) => {
    setSelectedTask(task);
    setEditForm({
      title: task.title,
      description_md: task.description_md || '',
      status: task.status,
      priority: task.priority,
      deadline: convertFromISODate(task.deadline || ''),
      tags: task.tags || [],
    });
    setIsDrawerOpen(true);
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;

    try {

      const updateData = {
        ...editForm,
        deadline: convertToISODate(editForm.deadline),
      };
      await updateTask(selectedTask.id, updateData);
      setIsDrawerOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !editForm.tags.includes(tagInput.trim())) {
      setEditForm({ ...editForm, tags: [...editForm.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditForm({ ...editForm, tags: editForm.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleDeleteClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      await deleteTask(taskToDelete.id);
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
      if (selectedTask?.id === taskToDelete.id) {
        setIsDrawerOpen(false);
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
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

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks by title or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input
            placeholder="New task title..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateTask();
            }}
            className="flex-1 md:w-64"
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
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Desktop: 3-column grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
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
                      <TaskCard key={task.id} task={task} onOpen={handleOpenTask} onDelete={handleDeleteClick} />
                    ))
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mobile: Tabs */}
          <div className="md:hidden">
            <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as typeof mobileTab)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="todo">To Do ({tasksByStatus.todo.length})</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress ({tasksByStatus.in_progress.length})</TabsTrigger>
                <TabsTrigger value="done">Done ({tasksByStatus.done.length})</TabsTrigger>
              </TabsList>
              {(['todo', 'in_progress', 'done'] as const).map((status) => (
                <TabsContent key={status} value={status} className="space-y-3 mt-4">
                  {tasksByStatus[status].length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No tasks</p>
                  ) : (
                    tasksByStatus[status].map((task) => (
                      <TaskCard key={task.id} task={task} onOpen={handleOpenTask} onDelete={handleDeleteClick} />
                    ))
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </>
      )}

      {/* Edit Task Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-6 border-b">
            <SheetTitle className="text-xl">Edit Task</SheetTitle>
            <SheetDescription>
              Make changes to your task. All changes are saved automatically.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-6 px-6 py-6 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Enter task title"
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">
                Description
              </Label>
              <Textarea
                id="description"
                value={editForm.description_md}
                onChange={(e) => setEditForm({ ...editForm, description_md: e.target.value })}
                placeholder="Add task description (Markdown supported)"
                rows={5}
                className="resize-none text-sm"
              />
              <p className="text-xs text-muted-foreground">Supports Markdown formatting</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-semibold">
                  Status
                </Label>
                <Select value={editForm.status} onValueChange={(v: Task['status']) => setEditForm({ ...editForm, status: v })}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        To Do
                      </div>
                    </SelectItem>
                    <SelectItem value="in_progress">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        In Progress
                      </div>
                    </SelectItem>
                    <SelectItem value="done">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        Done
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-semibold">
                  Priority
                </Label>
                <Select value={editForm.priority} onValueChange={(v: Task['priority']) => setEditForm({ ...editForm, priority: v })}>
                  <SelectTrigger id="priority" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        Low
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        High
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Deadline
              </Label>
              <Input
                id="deadline"
                type="date"
                value={editForm.deadline}
                onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                className="text-base"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  variant="secondary"
                  disabled={!tagInput.trim()}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              {editForm.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                  {editForm.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1.5 px-2.5 py-1">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 px-6 py-4 border-t mt-auto bg-background">
            <Button
              onClick={handleUpdateTask}
              className="flex-1 h-11"
              disabled={!editForm.title.trim()}
            >
              Save Changes
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="h-11 w-11"
              onClick={(e) => {
                if (selectedTask) {
                  handleDeleteClick(selectedTask, e);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Delete Task</DialogTitle>
            </div>
            <DialogDescription className="pt-3">
              Are you sure you want to delete <strong>"{taskToDelete?.title}"</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setTaskToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TaskCard({
  task,
  onOpen,
  onDelete
}: {
  task: Task;
  onOpen: (task: Task) => void;
  onDelete: (task: Task, e: React.MouseEvent) => void;
}) {
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Card
      className="hover:bg-muted/50 transition-colors cursor-pointer group"
      onClick={() => onOpen(task)}
    >
      <CardHeader className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm line-clamp-2 flex-1">{task.title}</h3>
          <div className="flex items-center gap-1">
            <Badge className={cn(priorityColors[task.priority], "text-xs")} variant="secondary">
              {task.priority}
            </Badge>
          </div>
        </div>
        {task.description_md && (
          <p className="text-xs text-muted-foreground line-clamp-2">{task.description_md}</p>
        )}
        {task.deadline && (
          <div className={cn(
            "flex items-center gap-1 text-xs",
            isOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground'
          )}>
            <Calendar className="h-3 w-3" />
            {formatDate(task.deadline)}
          </div>
        )}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{task.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
    </Card>
  );
}
