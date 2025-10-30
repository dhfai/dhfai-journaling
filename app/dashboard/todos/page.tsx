'use client';

import { useState } from 'react';
import { useTodos } from '@/contexts/todos-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import type { Todo } from '@/types/api';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const priorityColors = {
  low: 'bg-green-500/10 text-green-600 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  high: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export default function TodosPage() {
  const { todos, isLoading, createTodo, updateTodo, toggleTodo, deleteTodo } = useTodos();
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    // console.log('handleCreate called, title:', newTodoTitle);

    if (!newTodoTitle.trim()) {
      // console.log('Title empty, returning');
      return;
    }

    // console.log('Creating todo...');
    const result = await createTodo({
      title: newTodoTitle.trim(),
      priority: 'medium',
    });

    // console.log('Create result:', result);
    if (result) {
      setNewTodoTitle('');
    }
  };

  const handleToggle = async (id: string, done: boolean) => {
    await toggleTodo(id, !done);
  };

  const handlePriorityChange = async (id: string, priority: 'low' | 'medium' | 'high') => {
    await updateTodo(id, { priority });
  };

  const handleDueDateChange = async (id: string, date: string) => {
    let formattedDate = '';
    if (date) {
      formattedDate = `${date}T00:00:00Z`;
    }
    await updateTodo(id, { due_date: formattedDate });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this todo?')) {
      await deleteTodo(id);
    }
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
  };

  const saveEdit = async (id: string) => {
    if (editTitle.trim() && editTitle !== todos?.find((t) => t.id === id)?.title) {
      await updateTodo(id, { title: editTitle.trim() });
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const filteredTodos = todos?.filter((todo) => {
    if (filter === 'active') return !todo.done;
    if (filter === 'completed') return todo.done;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Todos</h2>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Todos</h2>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          placeholder="Add a new todo..."
          value={newTodoTitle}
          onChange={(e) => {
            // console.log('Input onChange:', e.target.value);
            setNewTodoTitle(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              // console.log('Enter pressed, value:', newTodoTitle);
            }
          }}
          className="flex-1"
        />
        <Button type="submit" onClick={() => // console.log('Button clicked, title:', newTodoTitle)}>
          Add Todo
        </Button>
      </form>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        {filteredTodos?.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            No todos found. Create one above!
          </Card>
        )}

        {filteredTodos?.map((todo) => (
          <Card key={todo.id} className="p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={todo.done}
                onCheckedChange={() => handleToggle(todo.id, todo.done)}
                className="mt-1"
              />

              <div className="flex-1 space-y-2">
                {editingId === todo.id ? (
                  <div className="flex gap-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(todo.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      autoFocus
                    />
                    <Button size="sm" onClick={() => saveEdit(todo.id)}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div
                    className={`text-sm ${todo.done ? 'line-through text-muted-foreground' : ''}`}
                    onDoubleClick={() => startEdit(todo)}
                  >
                    {todo.title}
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <Select
                    value={todo.priority}
                    onValueChange={(v) =>
                      handlePriorityChange(todo.id, v as 'low' | 'medium' | 'high')
                    }
                  >
                    <SelectTrigger className="w-[110px] h-7">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <input
                      type="date"
                      value={todo.due_date ? format(parseISO(todo.due_date), 'yyyy-MM-dd') : ''}
                      onChange={(e) => handleDueDateChange(todo.id, e.target.value)}
                      className="text-xs border rounded px-2 py-1 h-7"
                    />
                  </div>

                  <Badge variant="outline" className={priorityColors[todo.priority]}>
                    {todo.priority}
                  </Badge>

                  {todo.due_date && (
                    <Badge variant="outline" className="text-xs">
                      {format(parseISO(todo.due_date), 'MMM dd, yyyy')}
                    </Badge>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(todo.id)}
                    className="ml-auto h-7 text-xs text-red-600"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
