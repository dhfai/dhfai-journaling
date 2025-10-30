"use client";

import { useEffect, useState, useRef } from 'react';
import { useNotes } from '@/contexts/notes-context';
import { Button } from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import { Plus, Search, Pin, Trash2, FileText, MoreVertical, PanelLeftClose, ChevronRight, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Note } from '@/types/api';
import { NoteEditor } from '@/components/notes/note-editor';
import { cn } from '@/lib/utils';
import { stripMarkdown } from '@/lib/strip-markdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function NotesPage() {
  const { notes, isLoading, fetchNotes, createNote, updateNote, deleteNote } = useNotes();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    if (notes.length > 0 && !selectedNote) {
      setSelectedNote(notes[0]);
    }
  }, [notes, selectedNote]);

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const startResizing = () => {
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 280 && newWidth <= 500) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleCreateNote = async () => {
    try {
      setIsCreating(true);
      const newNote = await createNote({
        title: 'Untitled Note',
        tags: []
      });
      setSelectedNote(newNote);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteNote = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    setNoteToDelete(note);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;

    try {
      await deleteNote(noteToDelete.id);
      if (selectedNote?.id === noteToDelete.id) {
        setSelectedNote(notes.length > 1 ? notes[0] : null);
      }
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleTogglePin = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateNote(note.id, { is_pinned: !note.is_pinned });
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pinnedNotes = filteredNotes.filter(note => note.is_pinned);
  const unpinnedNotes = filteredNotes.filter(note => !note.is_pinned);

  const NoteListItem = ({ note, isSelected }: { note: Note; isSelected: boolean }) => (
    <div
      onClick={() => handleSelectNote(note)}
      className={cn(
        "p-3 rounded-lg cursor-pointer border transition-all",
        isSelected
          ? "bg-primary/10 border-primary/50 shadow-sm"
          : "bg-card border-border hover:border-primary/30 hover:bg-accent/50 active:bg-accent"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-sm line-clamp-1 flex-1 text-foreground">{note.title}</h3>
        <div className="flex items-center gap-1">
          {note.is_pinned && (
            <Pin className="h-3 w-3 text-primary fill-primary" />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => handleTogglePin(note, e as any)}>
                {note.is_pinned ? 'Unpin' : 'Pin'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => handleDeleteNote(note, e as any)}
                className="text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
        {note.blocks.length > 0
          ? stripMarkdown(note.blocks[0].content_md || 'No content')
          : 'No content'}
      </p>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {note.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
              {tag}
            </Badge>
          ))}
          {note.tags && note.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              +{note.tags.length - 2}
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(note.updated_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })}
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-var(--header-height))] bg-background relative">
      {/* Notes Sidebar - Fixed dengan scroll area sendiri */}
      <div
        ref={sidebarRef}
        style={{
          width: isSidebarOpen ? `${sidebarWidth}px` : '0px',
          minWidth: isSidebarOpen ? `${sidebarWidth}px` : '0px'
        }}
        className={cn(
          "shrink-0 border-r bg-background transition-all duration-300 ease-in-out overflow-hidden flex flex-col",
          "md:relative fixed inset-y-0 left-0 z-40 md:z-0",
          !isSidebarOpen && "border-r-0",
          isSidebarOpen && "shadow-lg md:shadow-none"
        )}
      >
        {/* Sidebar Header - Fixed */}
        <div className="shrink-0 p-4 border-b bg-background" style={{ width: sidebarWidth }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-foreground" />
              <h1 className="text-xl font-semibold text-foreground">Notes</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Create button - hidden on mobile, will use FAB instead */}
              <Button
                onClick={handleCreateNote}
                size="icon"
                disabled={isCreating}
                className="h-8 w-8 hidden md:flex"
              >
                <Plus className="h-4 w-4" />
              </Button>
              {/* Close button - only on mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:hidden"
                onClick={() => setIsSidebarOpen(false)}
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="pl-9"
            />
          </div>
        </div>

        {/* Sidebar Content - Scrollable */}
        <div className="flex-1 overflow-hidden bg-background" style={{ width: sidebarWidth }}>
          <ScrollArea className="h-full px-4 py-4">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-3 rounded-lg border">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))}
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  {searchQuery ? 'No notes found' : 'No notes yet'}
                </p>
                <p className="text-xs mt-1">
                  {searchQuery ? 'Try a different search' : 'Create your first note'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {pinnedNotes.length > 0 && (
                  <div>
                    <h2 className="text-xs font-semibold text-muted-foreground mb-3 px-1 uppercase tracking-wide">
                      Pinned
                    </h2>
                    <div className="space-y-2">
                      {pinnedNotes.map((note) => (
                        <NoteListItem
                          key={note.id}
                          note={note}
                          isSelected={selectedNote?.id === note.id}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {unpinnedNotes.length > 0 && (
                  <div>
                    {pinnedNotes.length > 0 && (
                      <h2 className="text-xs font-semibold text-muted-foreground mb-3 px-1 uppercase tracking-wide">
                        Notes
                      </h2>
                    )}
                    <div className="space-y-2">
                      {unpinnedNotes.map((note) => (
                        <NoteListItem
                          key={note.id}
                          note={note}
                          isSelected={selectedNote?.id === note.id}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={startResizing}
          className={cn(
            "absolute top-0 right-0 w-2 h-full cursor-col-resize group hover:bg-primary/20 transition-colors hidden md:block z-50",
            isResizing && "bg-primary/30"
          )}
        >
          <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1 h-12 bg-border group-hover:bg-primary transition-colors" />
        </div>

        {/* Floating Action Button - Mobile Only */}
        {isSidebarOpen && (
          <Button
            onClick={handleCreateNote}
            disabled={isCreating}
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden z-50"
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Editor Area - flex column dengan overflow hidden */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {!isSidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="fixed md:absolute left-0 top-1/2 -translate-y-1/2 z-60 h-12 w-8 rounded-l-none rounded-r-lg bg-background hover:bg-accent border border-l-0 shadow-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </Button>
        )}

        {selectedNote ? (
          <NoteEditor noteId={selectedNote.id} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No note selected</p>
              <p className="text-sm mt-1">Select a note or create a new one</p>
            </div>
          </div>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Delete Note</DialogTitle>
            </div>
            <DialogDescription className="pt-3">
              Are you sure you want to delete <strong>"{noteToDelete?.title}"</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setNoteToDelete(null);
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
