# Notes Feature Documentation

## Overview

The Notes feature is a Notion-inspired, block-based note-taking system that allows users to create, edit, and organize notes with rich content including text, headings, and todo lists.

## Features

### Core Functionality

- ✅ **Block-based Editor**: Similar to Notion, notes are composed of blocks that can be:
  - Paragraphs (with markdown support)
  - Headings
  - Todo lists with checkable items

- ✅ **Drag & Drop**: Reorder blocks by dragging them up or down
- ✅ **Markdown Support**: Write content in markdown with live preview
- ✅ **Search & Filter**: Search notes by title or tags
- ✅ **Pin Notes**: Pin important notes to the top
- ✅ **Tags**: Organize notes with custom tags
- ✅ **Real-time Updates**: Changes are saved automatically

### User Interface

#### Notes List Page (`/dashboard/notes`)
- Grid layout with note cards
- Search bar for filtering
- Pinned section at the top
- Create new note button
- Quick actions: Pin, Delete
- Preview of note content
- Tags display
- Last updated timestamp

#### Note Editor Page (`/dashboard/notes/[id]`)
- Clean, distraction-free editor
- Inline title editing
- Block-based content editing
- Add new blocks with type selector
- Drag handles for reordering
- Tags management
- Pin/unpin toggle
- Delete note option

## Technical Architecture

### File Structure

```
app/
  dashboard/
    notes/
      page.tsx                    # Notes list page
      [id]/
        page.tsx                  # Note editor page

components/
  notes/
    block-editor.tsx              # Individual block editor component
    block-type-selector.tsx       # Block type selection dropdown

contexts/
  notes-context.tsx               # Notes state management

services/
  notes.ts                        # API service layer

types/
  api.ts                          # TypeScript type definitions
```

### State Management

**NotesContext** (`contexts/notes-context.tsx`)
- Manages notes list and current note state
- Provides CRUD operations for notes and blocks
- Handles API calls and error states
- Shows toast notifications for user feedback

**Key Functions:**
- `fetchNotes()` - Load all notes
- `fetchNoteById(id)` - Load specific note
- `createNote(data)` - Create new note
- `updateNote(id, data)` - Update note properties
- `deleteNote(id)` - Delete note
- `addBlock(noteId, type)` - Add new block
- `updateBlock(noteId, blockId, content)` - Update block content
- `deleteBlock(noteId, blockId)` - Delete block
- `reorderBlocks(noteId, blockIds)` - Reorder blocks

### API Integration

**NotesService** (`services/notes.ts`)

All API calls follow the backend documentation:

```typescript
// Create note
POST /notes
Body: { title: string, tags?: string[] }

// Get all notes
GET /notes

// Get note by ID
GET /notes/:id

// Update note
PATCH /notes/:id
Body: { title?, tags?, is_pinned? }

// Delete note
DELETE /notes/:id

// Add block
POST /notes/:id/blocks
Body: { type: 'paragraph' | 'heading' | 'todo', content_md?, items? }

// Update block
PATCH /notes/:id/blocks/:blockId
Body: { content_md?, items? }

// Delete block
DELETE /notes/:id/blocks/:blockId

// Reorder blocks
PATCH /notes/:id/blocks/order
Body: { order: string[] }
```

### Components

#### BlockEditor (`components/notes/block-editor.tsx`)

The main block editing component that handles:
- **Text Blocks** (paragraph, heading):
  - Click to edit mode
  - Textarea for editing
  - Markdown preview when not editing
  - Auto-save on blur
  - Enter to create new block below
  - Escape to cancel

- **Todo Blocks**:
  - Checkbox toggle for completion
  - Inline text editing
  - Add new items
  - Delete items
  - Auto-save on blur

- **Common Features**:
  - Drag handle for reordering
  - Delete button
  - Hover states for better UX

#### BlockTypeSelector (`components/notes/block-type-selector.tsx`)

Dropdown menu to select block type:
- Paragraph
- Heading
- Todo List

### Styling

**Markdown Prose Styles** (`app/globals.css`)

Custom prose styles for markdown rendering:
- Headings (h1, h2, h3)
- Paragraphs
- Links
- Lists (ul, ol)
- Code blocks
- Blockquotes
- Text formatting (bold, italic)

## User Workflows

### Creating a Note

1. Navigate to `/dashboard/notes`
2. Click "New Note" button
3. Automatically redirected to editor with empty note titled "Untitled"
4. Click title to edit
5. Add blocks using the "Add block" button
6. Content auto-saves on blur

### Editing Blocks

**Text Blocks:**
1. Click on block content to enter edit mode
2. Type content (markdown supported)
3. Press Enter to save and create new block below
4. Press Escape to cancel
5. Click outside to save

**Todo Blocks:**
1. Click checkbox to toggle completion
2. Click text to edit
3. Click "Add item" to add new todo
4. Hover and click X to delete items

### Reordering Blocks

1. Hover over a block
2. Drag handle appears on the left
3. Click and drag to new position
4. Release to save new order

### Managing Tags

1. Click "..." menu in editor
2. Select "Manage tags"
3. Type tag name and click "Add"
4. Click X on tag to remove
5. Tags appear below title

### Searching Notes

1. Type in search bar on notes list page
2. Filters by title and tags in real-time
3. Clear search to see all notes

## Error Handling

All API operations include comprehensive error handling:

- **Network Errors**: Display toast notification
- **Validation Errors**: Show specific error message
- **Not Found**: Redirect to notes list
- **Unauthorized**: Handled by API client (token refresh)

Error messages are user-friendly and actionable.

## Best Practices

### Performance Optimization

- **Lazy Loading**: Only load note content when needed
- **Debouncing**: Updates are saved on blur, not on every keystroke
- **Optimistic Updates**: UI updates immediately, then syncs with server
- **Memoization**: Context values are memoized to prevent unnecessary re-renders

### Code Quality

- **Type Safety**: Full TypeScript coverage
- **Modularity**: Separated concerns (services, context, components)
- **Reusability**: Atomic components that can be reused
- **Clean Code**: No unnecessary comments, self-documenting code

### User Experience

- **Keyboard Shortcuts**: Enter, Escape for quick navigation
- **Visual Feedback**: Hover states, loading states, toast notifications
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Intuitive UI**: Follows Notion's familiar patterns

## Future Enhancements

Potential improvements for future iterations:

- [ ] Rich text editor instead of markdown
- [ ] Image blocks
- [ ] Code blocks with syntax highlighting
- [ ] Nested blocks (sub-items)
- [ ] Collaboration (real-time editing)
- [ ] Version history
- [ ] Templates
- [ ] Export to PDF/Markdown
- [ ] Keyboard shortcuts reference
- [ ] Block comments
- [ ] @mentions
- [ ] Linked notes (backlinks)

## Troubleshooting

### Common Issues

**Notes not loading:**
- Check backend API is running
- Verify authentication token is valid
- Check browser console for errors

**Blocks not saving:**
- Ensure you blur the input (click outside)
- Check network tab for failed requests
- Verify backend endpoint is accessible

**Drag & drop not working:**
- Check if @dnd-kit packages are installed
- Verify DndContext is wrapping the blocks
- Check browser console for errors

## Dependencies

```json
{
  "react-markdown": "^10.1.0",
  "remark-gfm": "^4.0.1",
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

## API Response Examples

### Get All Notes
```json
[
  {
    "id": "671e5c9e8bafd4f3b24cf67a0",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "My Daily Journal",
    "blocks": [...],
    "tags": ["daily", "personal"],
    "is_pinned": true,
    "created_at": "2025-10-28T10:30:00Z",
    "updated_at": "2025-10-28T15:45:00Z"
  }
]
```

### Get Note by ID
```json
{
  "id": "671e5c9e8bafd4f3b24cf67a0",
  "title": "My Daily Journal",
  "blocks": [
    {
      "id": "b1-uuid",
      "type": "heading",
      "order": 0,
      "content_md": "# Today's Highlights"
    },
    {
      "id": "b2-uuid",
      "type": "paragraph",
      "order": 1,
      "content_md": "Completed the **project** on time."
    },
    {
      "id": "b3-uuid",
      "type": "todo",
      "order": 2,
      "items": [
        { "id": "t1", "text": "Review code", "done": true },
        { "id": "t2", "text": "Deploy", "done": false }
      ]
    }
  ],
  "tags": ["daily"],
  "is_pinned": false,
  "created_at": "2025-10-28T10:30:00Z",
  "updated_at": "2025-10-28T15:45:00Z"
}
```

---

**Last Updated:** October 28, 2025
**Version:** 1.0.0
