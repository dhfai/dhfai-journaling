"use client";

import { useEffect, useState } from 'react';
import { useNotes } from '@/contexts/notes-context';
import { Block } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pin, MoreHorizontal, Tag, Trash2, X, Eye, Edit3 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
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

interface NoteEditorProps {
  noteId: string;
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const {
    currentNote,
    isLoadingNote,
    fetchNoteById,
    updateNote,
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
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Jarak minimal untuk mulai drag (prevent accidental drags)
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // Delay 200ms untuk touch (mencegah scroll)
        tolerance: 5, // Toleransi gerakan 5px
      },
    }),
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && currentNote) {
      const oldIndex = currentNote.blocks.findIndex(block => block.id === active.id);
      const newIndex = currentNote.blocks.findIndex(block => block.id === over.id);

      const newBlocks = arrayMove(currentNote.blocks, oldIndex, newIndex);
      const blockIds = newBlocks.map(block => block.id);

      reorderBlocks(noteId, blockIds);
    }
  };

  if (isLoadingNote) {
    return (
      <div className="flex-1 p-6 overflow-auto">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!currentNote) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Note not found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b px-6 py-4 bg-background">
        <div className="flex items-center justify-between mb-3">
          {isEditingTitle ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleBlur();
              }}
              className="text-2xl font-semibold border-none shadow-none focus-visible:ring-0 px-0"
              autoFocus
            />
          ) : (
            <h1
              className="text-2xl font-semibold cursor-pointer hover:text-primary"
              onClick={() => setIsEditingTitle(true)}
            >
              {currentNote.title}
            </h1>
          )}

          <div className="flex items-center gap-2">
            {/* Editor/Preview Toggle */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'editor' | 'preview')}>
              <TabsList>
                <TabsTrigger value="editor" className="gap-1">
                  <Edit3 className="w-3 h-3" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-1">
                  <Eye className="w-3 h-3" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleTogglePin}>
                  <Pin className="w-4 h-4 mr-2" />
                  {currentNote.is_pinned ? 'Unpin' : 'Pin'} note
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 items-center">
          {currentNote.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {isEditingTags ? (
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onBlur={() => {
                handleAddTag();
                setIsEditingTags(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddTag();
                  setIsEditingTags(false);
                }
              }}
              placeholder="Add tag..."
              className="w-32 h-6 text-sm"
              autoFocus
            />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingTags(true)}
              className="h-6 px-2 text-xs"
            >
              <Tag className="w-3 h-3 mr-1" />
              Add tag
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'editor' ? (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={currentNote.blocks.map(block => block.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4 max-w-4xl mx-auto">
                  {currentNote.blocks.map((block) => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      onUpdate={(content, items) => handleUpdateBlock(block.id, content, items)}
                      onDelete={() => handleDeleteBlock(block.id)}
                      onAddBlockBelow={(type) => handleAddBlock(type)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Add Block Button */}
            <div className="max-w-4xl mx-auto mt-4">
              <BlockTypeSelector onSelect={handleAddBlock} />
            </div>
          </>
        ) : (
          <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
            {currentNote.blocks.length > 0 ? (
              currentNote.blocks.map((block) => (
                <div key={block.id} className="mb-4">
                  {block.type === 'heading' && (
                    <h2>{block.content_md || ''}</h2>
                  )}
                  {block.type === 'paragraph' && (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {block.content_md || ''}
                    </ReactMarkdown>
                  )}
                  {block.type === 'todo' && block.items && (
                    <ul className="list-none space-y-2">
                      {block.items.map((item) => (
                        <li key={item.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.done}
                            readOnly
                            className="rounded"
                          />
                          <span className={item.done ? 'line-through text-muted-foreground' : ''}>
                            {item.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground italic">No content</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Sortable Block Wrapper
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
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
