"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import useSWR from 'swr';
import { Note, Block, CreateNoteRequest, UpdateNoteRequest } from '@/types/api';
import { NotesService } from '@/services/notes';
import { toast } from 'sonner';

interface NotesContextType {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  isLoadingNote: boolean;
  error: any;
  fetchNotes: () => Promise<void>;
  fetchNoteById: (id: string) => Promise<void>;
  createNote: (data: CreateNoteRequest) => Promise<Note | null>;
  updateNote: (id: string, data: UpdateNoteRequest) => Promise<boolean>;
  deleteNote: (id: string) => Promise<boolean>;
  addBlock: (noteId: string, type: Block['type'], content?: string) => Promise<Block | null>;
  updateBlock: (noteId: string, blockId: string, content?: string, items?: any[]) => Promise<boolean>;
  deleteBlock: (noteId: string, blockId: string) => Promise<boolean>;
  reorderBlocks: (noteId: string, blockIds: string[]) => Promise<boolean>;
  clearCurrentNote: () => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

const notesFetcher = async () => {
  const response = await NotesService.getAllNotes();
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.error || 'Failed to fetch notes');
};

const noteFetcher = async (id: string) => {
  const response = await NotesService.getNoteById(id);
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.error || 'Failed to fetch note');
};

interface NotesProviderProps {
  children: ReactNode;
}

export function NotesProvider({ children }: NotesProviderProps) {
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);

  const {
    data: notes = [],
    error: notesError,
    isLoading: isLoadingNotes,
    mutate: mutateNotes
  } = useSWR<Note[]>('/api/notes', notesFetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
  });

  const {
    data: currentNote = null,
    error: noteError,
    isLoading: isLoadingNote,
    mutate: mutateNote
  } = useSWR<Note | null>(
    currentNoteId ? `/api/notes/${currentNoteId}` : null,
    () => currentNoteId ? noteFetcher(currentNoteId) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000,
    }
  );

  const fetchNotes = useCallback(async () => {
    await mutateNotes();
  }, [mutateNotes]);

  const fetchNoteById = useCallback(async (id: string) => {
    setCurrentNoteId(id);
  }, []);

  const createNote = useCallback(async (data: CreateNoteRequest): Promise<Note | null> => {
    try {
      const response = await NotesService.createNote(data);
      if (response.success && response.data) {
        await mutateNotes([response.data, ...notes], false);
        toast.success('Note created successfully');
        return response.data;
      } else {
        toast.error(response.error || 'Failed to create note');
        return null;
      }
    } catch (error) {
      toast.error('An error occurred while creating note');
      return null;
    }
  }, [notes, mutateNotes]);

  const updateNote = useCallback(async (id: string, data: UpdateNoteRequest): Promise<boolean> => {
    try {
      const response = await NotesService.updateNote(id, data);
      if (response.success) {
        await mutateNotes(
          notes.map(note => note.id === id ? { ...note, ...data, updated_at: new Date().toISOString() } : note),
          false
        );

        if (currentNote?.id === id) {
          await mutateNote({ ...currentNote, ...data, updated_at: new Date().toISOString() }, false);
        }

        toast.success('Note updated successfully');
        return true;
      } else {
        toast.error(response.error || 'Failed to update note');
        return false;
      }
    } catch (error) {
      toast.error('An error occurred while updating note');
      return false;
    }
  }, [notes, currentNote, mutateNotes, mutateNote]);

  const deleteNote = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await NotesService.deleteNote(id);
      if (response.success) {
        await mutateNotes(notes.filter(note => note.id !== id), false);

        if (currentNote?.id === id) {
          setCurrentNoteId(null);
        }

        toast.success('Note deleted successfully');
        return true;
      } else {
        toast.error(response.error || 'Failed to delete note');
        return false;
      }
    } catch (error) {
      toast.error('An error occurred while deleting note');
      return false;
    }
  }, [notes, currentNote, mutateNotes]);

  const addBlock = useCallback(async (
    noteId: string,
    type: Block['type'],
    content?: string
  ): Promise<Block | null> => {
    try {
      const blockData: any = { type };

      if (type === 'todo') {
        blockData.items = [];
      } else {
        blockData.content_md = content || '';
      }

      const response = await NotesService.addBlock(noteId, blockData);
      if (response.success && response.data) {
        if (currentNote?.id === noteId) {
          await mutateNote({
            ...currentNote,
            blocks: [...currentNote.blocks, response.data],
            updated_at: new Date().toISOString()
          }, false);
        }
        return response.data;
      } else {
        toast.error(response.error || 'Failed to add block');
        return null;
      }
    } catch (error) {
      toast.error('An error occurred while adding block');
      return null;
    }
  }, [currentNote, mutateNote]);

  const updateBlock = useCallback(async (
    noteId: string,
    blockId: string,
    content?: string,
    items?: any[]
  ): Promise<boolean> => {
    try {
      const updateData: any = {};
      if (content !== undefined) updateData.content_md = content;
      if (items !== undefined) updateData.items = items;

      console.log('Updating block:', { noteId, blockId, updateData });

      const response = await NotesService.updateBlock(noteId, blockId, updateData);

      console.log('Update block response:', response);

      if (response.success) {
        if (currentNote?.id === noteId) {
          await mutateNote({
            ...currentNote,
            blocks: currentNote.blocks.map(block =>
              block.id === blockId ? { ...block, ...updateData } : block
            ),
            updated_at: new Date().toISOString()
          }, false);
        }
        return true;
      } else {
        toast.error(response.error || 'Failed to update block');
        return false;
      }
    } catch (error) {
      toast.error('An error occurred while updating block');
      return false;
    }
  }, [currentNote, mutateNote]);

  const deleteBlock = useCallback(async (noteId: string, blockId: string): Promise<boolean> => {
    try {
      const response = await NotesService.deleteBlock(noteId, blockId);
      if (response.success) {
        if (currentNote?.id === noteId) {
          await mutateNote({
            ...currentNote,
            blocks: currentNote.blocks.filter(block => block.id !== blockId),
            updated_at: new Date().toISOString()
          }, false);
        }
        return true;
      } else {
        toast.error(response.error || 'Failed to delete block');
        return false;
      }
    } catch (error) {
      toast.error('An error occurred while deleting block');
      return false;
    }
  }, [currentNote, mutateNote]);

  const reorderBlocks = useCallback(async (noteId: string, blockIds: string[]): Promise<boolean> => {
    try {
      const response = await NotesService.reorderBlocks(noteId, { order: blockIds });
      if (response.success) {
        if (currentNote?.id === noteId) {
          const blocksMap = new Map(currentNote.blocks.map(b => [b.id, b]));
          const reorderedBlocks = blockIds.map((id, index) => ({
            ...blocksMap.get(id)!,
            order: index
          }));

          await mutateNote({
            ...currentNote,
            blocks: reorderedBlocks,
            updated_at: new Date().toISOString()
          }, false);
        }
        return true;
      } else {
        toast.error(response.error || 'Failed to reorder blocks');
        return false;
      }
    } catch (error) {
      toast.error('An error occurred while reordering blocks');
      return false;
    }
  }, [currentNote, mutateNote]);

  const clearCurrentNote = useCallback(() => {
    setCurrentNoteId(null);
  }, []);

  return (
    <NotesContext.Provider
      value={{
        notes,
        currentNote,
        isLoading: isLoadingNotes,
        isLoadingNote,
        error: notesError || noteError,
        fetchNotes,
        fetchNoteById,
        createNote,
        updateNote,
        deleteNote,
        addBlock,
        updateBlock,
        deleteBlock,
        reorderBlocks,
        clearCurrentNote,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
