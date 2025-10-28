"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotes } from '@/contexts/notes-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pin, Trash2, MoreHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Note } from '@/types/api';

export default function NotesPage() {
  const router = useRouter();
  const { notes, isLoading, fetchNotes, createNote, updateNote, deleteNote } = useNotes();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pinnedNotes = filteredNotes.filter(note => note.is_pinned);
  const unpinnedNotes = filteredNotes.filter(note => !note.is_pinned);

  const handleCreateNote = async () => {
    setIsCreating(true);
    const newNote = await createNote({
      title: 'Untitled',
      tags: []
    });
    setIsCreating(false);
    if (newNote) {
      router.push(`/dashboard/notes/${newNote.id}`);
    }
  };

  const handleTogglePin = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    await updateNote(note.id, { is_pinned: !note.is_pinned });
  };

  const handleDeleteNote = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      await deleteNote(noteId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Notes</h1>
          <Button onClick={handleCreateNote} disabled={isCreating} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
            ))}
          </div>
        ) : (
          <>
            {pinnedNotes.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Pin className="w-4 h-4" />
                  Pinned
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pinnedNotes.map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onTogglePin={handleTogglePin}
                      onDelete={handleDeleteNote}
                      formatDate={formatDate}
                      onClick={() => router.push(`/dashboard/notes/${note.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {unpinnedNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <h2 className="text-sm font-medium text-muted-foreground mb-3">
                    All Notes
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unpinnedNotes.map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onTogglePin={handleTogglePin}
                      onDelete={handleDeleteNote}
                      formatDate={formatDate}
                      onClick={() => router.push(`/dashboard/notes/${note.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredNotes.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="text-muted-foreground mb-4">
                  {searchQuery ? 'No notes found' : 'No notes yet'}
                </div>
                {!searchQuery && (
                  <Button onClick={handleCreateNote} disabled={isCreating}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create your first note
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface NoteCardProps {
  note: Note;
  onTogglePin: (note: Note, e: React.MouseEvent) => void;
  onDelete: (noteId: string, e: React.MouseEvent) => void;
  formatDate: (date: string) => string;
  onClick: () => void;
}

function NoteCard({ note, onTogglePin, onDelete, formatDate, onClick }: NoteCardProps) {
  const getPreviewText = () => {
    const textBlocks = note.blocks.filter(b => b.type === 'paragraph' || b.type === 'heading');
    if (textBlocks.length === 0) return 'No content';
    return textBlocks[0].content_md?.substring(0, 100) || 'No content';
  };

  return (
    <Card
      className="p-4 cursor-pointer hover:bg-accent/50 transition-colors group relative"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium truncate flex-1">{note.title}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => onTogglePin(note, e)}>
              <Pin className="w-4 h-4 mr-2" />
              {note.is_pinned ? 'Unpin' : 'Pin'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => onDelete(note.id, e)} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {getPreviewText()}
      </p>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatDate(note.updated_at)}</span>
        {note.tags.length > 0 && (
          <div className="flex gap-1">
            {note.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {note.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{note.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
