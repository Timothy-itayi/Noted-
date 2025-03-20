import { useState, useEffect } from 'react';

interface Note {
  id?: string;
  title: string;
  body: string;
  created_at?: string;
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && currentNote) {
        // Update note
        const response = await fetch(`/api/notes/${currentNote.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, body }),
        });
        
        if (response.ok) {
          await fetchNotes(); // Fetch fresh data after update
          setIsEditing(false);
          setCurrentNote(null);
          setTitle('');
          setBody('');
        }
      } else {
        // Create new note
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, body }),
        });

        if (response.ok) {
          await fetchNotes(); // Fetch fresh data after create
          setTitle('');
          setBody('');
        }
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== id));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleEdit = (note: Note) => {
    setIsEditing(true);
    setCurrentNote(note);
    setTitle(note.title);
    setBody(note.body);
  };

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setNotes(data.filter(note => note.title && note.body)); // Only show notes with content
        } else {
          console.error('Received non-array data:', data);
          setNotes([]);
        }
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return {
    notes,
    title,
    body,
    isEditing,
    setTitle,
    setBody,
    handleSubmit,
    handleDelete,
    handleEdit,
    setIsEditing,
    setCurrentNote,
  };
} 