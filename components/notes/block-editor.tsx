"use client";

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Block, TodoItemInBlock } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { GripVertical, Trash2, Plus, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BlockEditorProps {
  block: Block;
  onUpdate: (content?: string, items?: TodoItemInBlock[]) => void;
  onDelete: () => void;
  onAddBlockBelow: (type: Block['type']) => void;
  dragHandleProps?: any;
}

export function BlockEditor({ block, onUpdate, onDelete, onAddBlockBelow, dragHandleProps }: BlockEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(block.content_md || '');
  const [items, setItems] = useState<TodoItemInBlock[]>(block.items || []);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(content.length, content.length);
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (block.type === 'todo') {
      onUpdate(undefined, items);
    } else {
      if (content !== block.content_md) {
        console.log('Saving content:', content);
        onUpdate(content);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
      onAddBlockBelow('paragraph');
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setContent(block.content_md || '');
    }
  };

  const handleTodoToggle = (itemId: string) => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    setItems(updatedItems);
    onUpdate(undefined, updatedItems);
  };

  const handleTodoTextChange = (itemId: string, text: string) => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, text } : item
    );
    setItems(updatedItems);
  };

  const handleTodoBlur = () => {
    onUpdate(undefined, items);
  };

  const handleAddTodoItem = () => {
    const newItem: TodoItemInBlock = {
      id: `todo-${Date.now()}`,
      text: '',
      done: false
    };
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    onUpdate(undefined, updatedItems);
  };

  const handleDeleteTodoItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    onUpdate(undefined, updatedItems);
  };

  const handleDragEndTodoItems = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);

      const reorderedItems = arrayMove(items, oldIndex, newIndex);
      setItems(reorderedItems);
      onUpdate(undefined, reorderedItems);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="group flex gap-2 py-2">
      <div
        {...dragHandleProps}
        className="flex items-start pt-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        {block.type === 'todo' ? (
          <div className="space-y-1">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEndTodoItems}
            >
              <SortableContext
                items={items.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {items.map((item) => (
                  <SortableTodoItem
                    key={item.id}
                    item={item}
                    onToggle={() => handleTodoToggle(item.id)}
                    onTextChange={(text) => handleTodoTextChange(item.id, text)}
                    onBlur={handleTodoBlur}
                    onDelete={() => handleDeleteTodoItem(item.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddTodoItem}
              className="w-full justify-start text-muted-foreground hover:bg-accent/50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add item
            </Button>
          </div>
        ) : (
          <>
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder={block.type === 'heading' ? 'Heading' : 'Type something...'}
                className={`w-full bg-transparent border-none outline-none resize-none ${
                  block.type === 'heading' ? 'text-2xl font-bold' : 'text-base'
                }`}
                rows={1}
                style={{ minHeight: '1.5em' }}
              />
            ) : (
              <div
                onClick={() => setIsEditing(true)}
                className={`cursor-text min-h-[1.5em] ${
                  !content && 'text-muted-foreground'
                }`}
              >
                {content ? (
                  <div className={`prose prose-sm dark:prose-invert max-w-none ${
                    block.type === 'heading' ? 'text-2xl font-bold' : ''
                  }`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    {block.type === 'heading' ? 'Heading' : 'Type something...'}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-start pt-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100"
          onClick={onDelete}
          title="Delete block"
        >
          <Trash2 className="w-3 h-3 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

interface SortableTodoItemProps {
  item: TodoItemInBlock;
  onToggle: () => void;
  onTextChange: (text: string) => void;
  onBlur: () => void;
  onDelete: () => void;
}

function SortableTodoItem({ item, onToggle, onTextChange, onBlur, onDelete }: SortableTodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center gap-2 group/item py-1"
    >
      <div
        {...listeners}
        className="cursor-grab active:cursor-grabbing opacity-0 group-hover/item:opacity-100 transition-opacity"
      >
        <GripVertical className="w-3 h-3 text-muted-foreground" />
      </div>

      <Checkbox
        checked={item.done}
        onCheckedChange={onToggle}
      />

      <Input
        value={item.text}
        onChange={(e) => onTextChange(e.target.value)}
        onBlur={onBlur}
        placeholder="Todo item"
        className={`flex-1 border-none shadow-none focus-visible:ring-0 px-2 ${
          item.done ? 'line-through text-muted-foreground' : ''
        }`}
      />

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover/item:opacity-100"
        onClick={onDelete}
        title="Delete item"
      >
        <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>
  );
}
