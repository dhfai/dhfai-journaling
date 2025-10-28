"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useNotes } from '@/contexts/notes-context';
import { Block } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pin, MoreHorizontal, Tag, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { BlockEditor } from '@/components/notes/block-editor';
import { BlockTypeSelector } from '@/components/notes/block-type-selector';
import { Skeleton } from '@/components/ui/skeleton';
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

export default function NoteEditorPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;

  const {
    currentNote,
    isLoadingNote,
    fetchNoteById,
    updateNote,
    deleteNote,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    clearCurrentNote,
  } = useNotes();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (noteId) {
      fetchNoteById(noteId);
    }
    return () => clearCurrentNote();
  }, [noteId, fetchNoteById, clearCurrentNote]);

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
    }
  }, [currentNote]);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title !== currentNote?.title) {
      updateNote(noteId, { title });
    }
  };

  const handleTogglePin = async () => {
    if (currentNote) {
      await updateNote(noteId, { is_pinned: !currentNote.is_pinned });
    }
  };

  const handleDeleteNote = async () => {
    if (confirm('Are you sure you want to delete this note?')) {
      const success = await deleteNote(noteId);
      if (success) {
        router.push('/dashboard/notes');
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && currentNote) {
      const newTags = [...currentNote.tags, tagInput.trim()];
      updateNote(noteId, { tags: newTags });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (currentNote) {
      const newTags = currentNote.tags.filter(tag => tag !== tagToRemove);
      updateNote(noteId, { tags: newTags });
    }
  };

  const handleAddBlock = async (type: Block['type']) => {
    await addBlock(noteId, type);
  };

  const handleUpdateBlock = async (blockId: string, content?: string, items?: any[]) => {
    await updateBlock(noteId, blockId, content, items);
  };

  const handleDeleteBlock = async (blockId: string) => {
    await deleteBlock(noteId, blockId);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && currentNote) {
      const oldIndex = currentNote.blocks.findIndex(b => b.id === active.id);
      const newIndex = currentNote.blocks.findIndex(b => b.id === over.id);

      const reorderedBlocks = arrayMove(currentNote.blocks, oldIndex, newIndex);
      const blockIds = reorderedBlocks.map(b => b.id);

      await reorderBlocks(noteId, blockIds);
    }
  };

  if (isLoadingNote) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b px-6 py-4">
          <Skeleton className="h-8 w-48 mb-2" />
        </div>
        <div className="flex-1 overflow-auto px-6 py-4 max-w-4xl mx-auto w-full">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      </div>
    );
  }

  if (!currentNote) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Note not found</p>
          <Button onClick={() => router.push('/dashboard/notes')}>
            Go back to notes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/notes')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleTogglePin}>
              <Pin className="w-4 h-4 mr-2" />
              {currentNote.is_pinned ? 'Unpin' : 'Pin'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsEditingTags(!isEditingTags)}>
              <Tag className="w-4 h-4 mr-2" />
              Manage tags
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDeleteNote} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete note
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-auto px-6 py-8 max-w-4xl mx-auto w-full">
        {isEditingTitle ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleBlur();
              if (e.key === 'Escape') {
                setTitle(currentNote.title);
                setIsEditingTitle(false);
              }
            }}
            className="text-4xl font-bold border-none shadow-none px-0 mb-4 focus-visible:ring-0"
            autoFocus
          />
        ) : (
          <h1
            onClick={() => setIsEditingTitle(true)}
            className="text-4xl font-bold mb-4 cursor-text hover:bg-accent/50 px-2 py-1 -mx-2 rounded"
          >
            {currentNote.title}
          </h1>
        )}

        {isEditingTags && (
          <div className="mb-4 p-3 border rounded-lg">
            <div className="flex gap-2 mb-2 flex-wrap">
              {currentNote.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTag();
                }}
                placeholder="Add tag..."
                className="flex-1"
              />
              <Button onClick={handleAddTag} size="sm">Add</Button>
            </div>
          </div>
        )}

        {currentNote.tags.length > 0 && !isEditingTags && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {currentNote.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={currentNote.blocks.map(b => b.id)}
            strategy={verticalListSortingStrategy}
          >
            {currentNote.blocks
              .sort((a, b) => a.order - b.order)
              .map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  onUpdate={(content, items) => handleUpdateBlock(block.id, content, items)}
                  onDelete={() => handleDeleteBlock(block.id)}
                  onAddBlockBelow={handleAddBlock}
                />
              ))}
          </SortableContext>
        </DndContext>

        <div className="mt-4">
          <BlockTypeSelector onSelect={handleAddBlock} />
        </div>
      </div>
    </div>
  );
}

interface SortableBlockProps {
  block: Block;
  onUpdate: (content?: string, items?: any[]) => void;
  onDelete: () => void;
  onAddBlockBelow: (type: Block['type']) => void;
}

function SortableBlock({ block, onUpdate, onDelete, onAddBlockBelow }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <BlockEditor
        block={block}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddBlockBelow={onAddBlockBelow}
        dragHandleProps={listeners}
      />
    </div>
  );
}
